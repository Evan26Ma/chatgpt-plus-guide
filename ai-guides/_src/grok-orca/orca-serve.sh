#!/usr/bin/env bash
# Adapted from Asa (@app_sail), 2026-10-09:
# https://x.com/app_sail/status/2108523630900748335
# Requires Linux, a kernel Tailscale interface and passwordless sudo.
# Pairing output is sensitive. Keep it out of shared logs and screenshots.
set -euo pipefail
umask 077
export PATH="$HOME/.local/bin:$PATH"
ORCA_DIR="$HOME/.orca"
APPIMAGE="$ORCA_DIR/orca-linux.AppImage"
APPDIR="$ORCA_DIR/app"
HASHF="$ORCA_DIR/app.sha256"
ADDR=grok-bot
PORT=6768
LOG="$HOME/orca-setup/serve.log"
PIDF="$ORCA_DIR/serve.pid"
MODE="${1:-start}"

case "$MODE" in
  start|--version|--desktop-link|--mobile|--restart) ;;
  *) printf 'Usage: %s [--version|--desktop-link|--mobile|--restart] [--confirm-restart]\n' "$0" >&2; exit 2 ;;
esac
[[ "$ADDR" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || { printf 'Invalid ADDR\n' >&2; exit 1; }
if [[ "$MODE" == --version ]]; then
  [[ -x "$APPDIR/resources/bin/orca-ide" ]] || { printf 'Orca has not been extracted yet.\n' >&2; exit 1; }
  exec "$APPDIR/resources/bin/orca-ide" --version
fi
case "$MODE" in
  --mobile|--restart)
    [[ "${2:-}" == --confirm-restart ]] || { printf 'Restart requires --confirm-restart after checking active tasks.\n' >&2; exit 2; } ;;
esac

# Reject symlinks and foreign owners before reading or appending credentials.
# Open with O_NOFOLLOW and inspect the opened file, rather than trusting a path check.
secure_log() {
  python3 - "$LOG" "$1" <<'PY'
import os
import stat
import sys
from pathlib import Path
path = Path(sys.argv[1])
try:
    parent = path.parent.lstat()
    if not stat.S_ISDIR(parent.st_mode) or parent.st_uid != os.getuid():
        raise ValueError('Log directory must be a real directory owned by this user')
    os.chmod(path.parent, 0o700)
    flags = os.O_NOFOLLOW | os.O_NONBLOCK
    flags |= os.O_RDONLY if sys.argv[2] == 'read' else os.O_WRONLY | os.O_CREAT | os.O_APPEND
    fd = os.open(path, flags, 0o600)
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_nlink != 1:
            raise ValueError('Log must be a regular, singly linked file owned by this user')
        os.fchmod(fd, 0o600)
    finally:
        os.close(fd)
except (OSError, ValueError) as error:
    sys.exit(f'Unsafe or missing pairing log: {error}')
PY
}
if [[ "$MODE" == --desktop-link ]]; then
  secure_log read
  exec python3 - "$LOG" <<'PY'
import base64
import json
import os
import re
import stat
import sys
fd = os.open(sys.argv[1], os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
with os.fdopen(fd, 'rb') as stream:
    info = os.fstat(stream.fileno())
    if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_nlink != 1 or stat.S_IMODE(info.st_mode) != 0o600:
        sys.exit('Unsafe pairing log')
    stream.seek(max(0, info.st_size - 2_000_000))
    text = stream.read().decode('utf-8', errors='replace')
for link in reversed(re.findall(r'orca://pair\?code=[A-Za-z0-9_-]+', text)):
    try:
        code = link.split('code=', 1)[1]
        payload = json.loads(base64.urlsafe_b64decode(code + '=' * (-len(code) % 4)))
    except (ValueError, TypeError):
        continue
    if isinstance(payload, dict) and payload.get('scope') == 'runtime':
        print('Sensitive desktop link; its authorization may have expired.', file=sys.stderr)
        print(link)
        sys.exit(0)
sys.exit('No desktop link in the recent log. Schedule a confirmed restart when no tasks are running.')
PY
fi

for tool in ss flock ip tailscale setsid nohup python3 sudo sha256sum; do
  command -v "$tool" >/dev/null || { printf 'Missing dependency: %s\n' "$tool" >&2; exit 1; }
done
sudo -n true 2>/dev/null || { printf 'Passwordless sudo is required. Orca was not started or restarted.\n' >&2; exit 1; }
ip link show tailscale0 >/dev/null 2>&1 || { printf 'tailscale0 is missing. Restore Tailscale first.\n' >&2; exit 1; }
tailscale ip -4 >/dev/null 2>&1 || { printf 'Tailscale has no IPv4 address.\n' >&2; exit 1; }
mkdir -p "$ORCA_DIR" "$HOME/orca-setup"
exec 9>"$ORCA_DIR/orca-serve.lock"
flock -n 9 || { printf 'Another startup check is running.\n'; exit 0; }
secure_log write
listening() { ss -H -ltn "sport = :$PORT" | grep -q .; }

# validate: verify the session leader; owns: additionally verify every listener.
# gone: wait for the whole original session, including children, to disappear.
process_check() {
  python3 - "$1" "$2" "$ORCA_DIR" "$PORT" <<'PY'
import os
from pathlib import Path
import re
import subprocess
import sys
mode, raw_pid, raw_root, port = sys.argv[1:]
try:
    pid = int(raw_pid)
    if pid <= 1:
        raise ValueError('Invalid managed PID')
    if mode == 'gone':
        for entry in Path('/proc').iterdir():
            if not entry.name.isdigit():
                continue
            try:
                fields = (entry/'stat').read_text().rsplit(')', 1)[1].split()
            except FileNotFoundError:
                continue
            if int(fields[3]) == pid:
                sys.exit(1)
        sys.exit(0)
    proc = Path(f'/proc/{pid}')
    args = (proc/'cmdline').read_bytes().split(b'\0')
    executable = (proc/'exe').resolve(strict=True)
    root = Path(raw_root).resolve()
    if proc.stat().st_uid != os.getuid() or root not in executable.parents or executable.name != 'orca-ide' or b'serve' not in args or os.getsid(pid) != pid or os.getpgid(pid) != pid:
        raise ValueError('PID does not belong to a managed Orca serve session')
    if mode == 'owns':
        output = subprocess.check_output(['ss', '-H', '-ltnp', f'sport = :{port}'], text=True)
        lines = output.splitlines()
        if not lines:
            raise ValueError('Port is not listening')
        for line in lines:
            owners = [int(value) for value in re.findall(r'pid=(\d+)', line)]
            if not owners:
                raise ValueError('Listener PID could not be inspected')
            for owner in owners:
                seen = set()
                while owner != pid:
                    if owner <= 1 or owner in seen:
                        raise ValueError('Listener is outside the managed process tree')
                    seen.add(owner)
                    fields = Path(f'/proc/{owner}/stat').read_text().rsplit(')', 1)[1].split()
                    if int(fields[3]) == pid:
                        break
                    owner = int(fields[1])
except (OSError, ValueError, subprocess.CalledProcessError) as error:
    sys.exit(str(error))
PY
}
pid=''
if [[ -s "$PIDF" ]]; then
  pid="$(<"$PIDF")"
  [[ "$pid" =~ ^[0-9]+$ && "$pid" -gt 1 ]] || { printf 'Invalid managed PID file; review manually.\n' >&2; exit 1; }
  if [[ -d "/proc/$pid" ]]; then
    process_check validate "$pid"
    listening || { printf 'Managed Orca PID is alive but port is not listening. Review it; no duplicate was started or PID overwritten.\n' >&2; exit 1; }
    process_check owns "$pid"
  else
    process_check gone "$pid" || { printf 'Old Orca session still has processes; review before starting.\n' >&2; exit 1; }
    pid=''
  fi
fi
if [[ -z "$pid" ]] && listening; then
  printf 'Port is occupied without a verified managed Orca session. Nothing was started or stopped.\n' >&2
  exit 1
fi

# Validate an existing private chain before any mutation or INPUT attachment.
ensure_firewall() {
  local fw="$1" chain=ORCA_TAILNET
  python3 - "$fw" <<'PY'
import subprocess
import sys
fw = sys.argv[1]
text = subprocess.check_output(['sudo', '-n', fw, '-w', '5', '-S'], text=True)
lines = text.splitlines()
private = [line for line in lines if line.startswith('-A ORCA_TAILNET ')]
expected = ['-A ORCA_TAILNET -i lo -j ACCEPT', '-A ORCA_TAILNET -i tailscale0 -j ACCEPT', '-A ORCA_TAILNET -j DROP']
if ('-N ORCA_TAILNET' in lines or private) and private != expected:
    sys.exit('Unexpected rules in ORCA_TAILNET. No rules were changed or attached.')
PY
  # Called from an OR-list: do not rely on set -e inside this function.
  [[ $? -eq 0 ]] || return 1
  if ! sudo -n "$fw" -w 5 -S "$chain" >/dev/null 2>&1; then
    sudo -n "$fw" -w 5 -N "$chain" || return 1
    sudo -n "$fw" -w 5 -A "$chain" -i lo -j ACCEPT || return 1
    sudo -n "$fw" -w 5 -A "$chain" -i tailscale0 -j ACCEPT || return 1
    sudo -n "$fw" -w 5 -A "$chain" -j DROP || return 1
  fi
  # Recheck the completed chain immediately before connecting it to INPUT.
  python3 - "$fw" <<'PY'
import subprocess
import sys
text = subprocess.check_output(['sudo', '-n', sys.argv[1], '-w', '5', '-S', 'ORCA_TAILNET'], text=True)
rules = [line for line in text.splitlines() if line.startswith('-A ')]
if rules != ['-A ORCA_TAILNET -i lo -j ACCEPT', '-A ORCA_TAILNET -i tailscale0 -j ACCEPT', '-A ORCA_TAILNET -j DROP']:
    sys.exit('Private chain verification failed; no INPUT jump was added.')
PY
  [[ $? -eq 0 ]] || return 1
  sudo -n "$fw" -w 5 -C INPUT -p tcp --dport "$PORT" -j "$chain" 2>/dev/null || sudo -n "$fw" -w 5 -I INPUT 1 -p tcp --dport "$PORT" -j "$chain" || return 1
  python3 - "$fw" "$PORT" <<'PY'
import subprocess
import sys
fw, port = sys.argv[1:]
text = subprocess.check_output(['sudo', '-n', fw, '-w', '5', '-S', 'INPUT'], text=True)
rules = [line for line in text.splitlines() if line.startswith('-A ')]
if not rules or rules[0] != f'-A INPUT -p tcp -m tcp --dport {port} -j ORCA_TAILNET':
    sys.exit('Orca firewall jump is not the first INPUT rule. Review existing firewall before continuing.')
PY
}
ensure_firewall iptables || { printf 'IPv4 protection failed; no start or restart. Existing processes were left running.\n' >&2; exit 1; }
ensure_firewall ip6tables || { printf 'IPv6 protection could not be verified; no start or restart. Existing processes were left running.\n' >&2; exit 1; }
if [[ -n "$pid" && "$MODE" == start ]]; then
  printf 'Managed Orca is already listening on %s; firewall verified. No process was restarted.\n' "$PORT"
  exit 0
fi

# Prepare and verify the new tree before stopping a usable old session.
[[ -f "$APPIMAGE" && -x "$APPIMAGE" ]] || { printf 'Download the matching official AppImage to %s first.\n' "$APPIMAGE" >&2; exit 1; }
hash="$(sha256sum "$APPIMAGE")"
hash="${hash%% *}"
prepared=''
if [[ ! -x "$APPDIR/resources/bin/orca-ide" || ! -f "$HASHF" || "$(<"$HASHF")" != "$hash" ]]; then
  [[ ! -e "$APPDIR" || -L "$APPDIR" ]] || { printf 'Existing app is a directory. Back it up and review migration manually.\n' >&2; exit 1; }
  stamp="$(date +%Y%m%d%H%M%S)-$$"
  extraction="$ORCA_DIR/.extract-$stamp"
  mkdir "$extraction"
  (cd "$extraction" && "$APPIMAGE" --appimage-extract >/dev/null) 9>&-
  [[ -f "$extraction/squashfs-root/resources/bin/orca-ide" && -x "$extraction/squashfs-root/resources/bin/orca-ide" ]] || { printf 'AppImage extraction failed; old service was left running.\n' >&2; exit 1; }
  "$extraction/squashfs-root/resources/bin/orca-ide" --version >/dev/null 9>&-
  after="$(sha256sum "$APPIMAGE")"
  [[ "${after%% *}" == "$hash" ]] || { printf 'AppImage changed during extraction; old service was left running.\n' >&2; exit 1; }
  prepared="$ORCA_DIR/app-$stamp"
  mv "$extraction/squashfs-root" "$prepared"
  rmdir "$extraction"
else
  "$APPDIR/resources/bin/orca-ide" --version >/dev/null 9>&-
fi
if [[ -n "$pid" ]]; then
  process_check validate "$pid"
  kill -TERM -- "-$pid"
  for ((i=0; i<20; i++)); do process_check gone "$pid" && break; sleep 1; done
  process_check gone "$pid" || { printf 'Old Orca session still has processes; no replacement was started.\n' >&2; exit 1; }
  listening && { printf 'Port still occupied; no replacement was started.\n' >&2; exit 1; }
fi
if [[ -n "$prepared" ]]; then
  ln -s "$(basename "$prepared")" "$ORCA_DIR/.app-$stamp"
  mv -Tf "$ORCA_DIR/.app-$stamp" "$APPDIR"
  printf '%s\n' "$hash" >"$HASHF.tmp"
  mv -f "$HASHF.tmp" "$HASHF"
fi
real="$(readlink -f "$APPDIR")"
extra=()
[[ "$MODE" == --mobile ]] && extra+=(--mobile-pairing)
printf '\n=== %s start orca serve ===\n' "$(date -Iseconds)" >>"$LOG"
setsid nohup "$real/resources/bin/orca-ide" serve --port "$PORT" --pairing-address "$ADDR" "${extra[@]}" >>"$LOG" 2>&1 </dev/null 9>&- &
pid=$!
printf '%s\n' "$pid" >"$PIDF"
for ((i=0; i<30; i++)); do
  if listening; then
    process_check owns "$pid" || { printf 'Listener does not belong to the managed Orca session. Review locally.\n' >&2; exit 1; }
    printf 'Orca is listening on %s. Pairing address: %s. Pairing credentials stay in %s.\n' "$PORT" "$ADDR" "$LOG"
    exit 0
  fi
  kill -0 "$pid" 2>/dev/null || { printf 'Orca exited. Inspect the log locally without sharing pairing credentials.\n' >&2; exit 1; }
  sleep 1
done
printf 'Startup was not confirmed within 30 seconds. Managed PID was retained; inspect it locally before retrying.\n' >&2
exit 1
