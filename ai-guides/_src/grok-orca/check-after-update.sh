#!/usr/bin/env bash
# Local read-only checks. Never print account tokens or pairing links.
set -u
export PATH="$HOME/.local/bin:$PATH"
ok=0
bad=0
pass() { printf 'OK   %s\n' "$1"; ok=$((ok+1)); }
fail() { printf 'FAIL %s\n' "$1"; bad=$((bad+1)); }
command -v tailscale >/dev/null && tailscale ip -4 >/dev/null 2>&1 && pass 'Tailscale has an IPv4 address' || fail 'Restore and authorize Tailscale'
ip link show tailscale0 >/dev/null 2>&1 && pass 'Kernel tailscale0 interface exists' || fail 'No tailscale0; this guide does not support proxy-only networking'
[[ -x "$HOME/.tailscale/bootstrap-tailscale.sh" ]] && pass 'Tailscale recovery script exists' || fail 'Confirm recovery support with the Tailscale Bot'
[[ -x "$HOME/.orca/orca-serve.sh" ]] && pass 'Orca startup script exists' || fail 'Restore the startup script from this guide'
[[ -x "$HOME/.orca/orca-linux.AppImage" ]] && pass 'Orca AppImage exists' || fail 'Download the correct official AppImage'
if "$HOME/.orca/orca-serve.sh" --version >/dev/null 2>&1; then pass 'Extracted Orca CLI runs'; else fail 'Orca CLI did not run'; fi
if ss -H -ltn 'sport = :6768' 2>/dev/null | grep -q .; then pass 'Port 6768 is listening'; else fail 'Port 6768 is not listening'; fi
if python3 - <<'PY'
from pathlib import Path
import os
import re
import subprocess
import sys
try:
    pid = int((Path.home()/'.orca/serve.pid').read_text().strip())
    if pid <= 1:
        raise ValueError('Invalid managed PID')
    proc = Path(f'/proc/{pid}')
    args = (proc/'cmdline').read_bytes().split(b'\0')
    program = (proc/'exe').resolve(strict=True)
    root = (Path.home()/'.orca').resolve()
    if proc.stat().st_uid != os.getuid() or root not in program.parents or program.name != 'orca-ide' or b'serve' not in args or os.getsid(pid) != pid or os.getpgid(pid) != pid:
        raise ValueError('Invalid managed session')
    output = subprocess.check_output(['ss', '-H', '-ltnp', 'sport = :6768'], text=True, stderr=subprocess.DEVNULL)
    lines = output.splitlines()
    if not lines:
        raise ValueError('No listener')
    for line in lines:
        owners = [int(value) for value in re.findall(r'pid=(\d+)', line)]
        if not owners:
            raise ValueError('Listener PID is unavailable')
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
except (OSError, ValueError, subprocess.CalledProcessError):
    sys.exit(1)
PY
then pass 'Port 6768 belongs to the managed Orca session or its children'; else fail 'Managed Orca listener ownership was not confirmed'; fi
if claude --version >/dev/null 2>&1; then pass 'Claude Code runs'; else fail 'Claude Code is missing or not on PATH'; fi
if claude auth status >/dev/null 2>&1; then pass 'Claude auth command succeeded; inspect subscription locally'; else fail 'Claude authentication requires review'; fi
for fw in iptables ip6tables; do
  if python3 - "$fw" <<'PY'
import subprocess
import sys
fw = sys.argv[1]
def rules(chain):
    text = subprocess.check_output(['sudo', '-n', fw, '-w', '5', '-S', chain], text=True, stderr=subprocess.DEVNULL)
    return [line for line in text.splitlines() if line.startswith('-A ')]
try:
    incoming = rules('INPUT')
    private = rules('ORCA_TAILNET')
    valid = bool(incoming) and incoming[0] == '-A INPUT -p tcp -m tcp --dport 6768 -j ORCA_TAILNET'
    valid = valid and private == ['-A ORCA_TAILNET -i lo -j ACCEPT', '-A ORCA_TAILNET -i tailscale0 -j ACCEPT', '-A ORCA_TAILNET -j DROP']
except (OSError, subprocess.CalledProcessError):
    valid = False
sys.exit(0 if valid else 1)
PY
  then pass "$fw protects port 6768"; else fail "$fw rules could not be verified; do not publish the port"; fi
done
printf '\n%d passed, %d need review.\n' "$ok" "$bad"
printf 'Also confirm Bot scheduled jobs, desktop/mobile pairing, and off-device project backups manually.\n'
[[ "$bad" -eq 0 ]]
