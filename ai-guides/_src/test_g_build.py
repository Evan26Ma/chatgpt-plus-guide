import importlib.util
import json
from pathlib import Path
import re
from tempfile import TemporaryDirectory
import unittest

spec = importlib.util.spec_from_file_location('guide_build', Path(__file__).with_name('build.py'))
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class GBuildTests(unittest.TestCase):
    def temporary(self):
        return TemporaryDirectory(prefix='.g-build-test-', dir=build.ROOT.parent)

    def test_metadata_accepts_legacy_and_json_modules(self):
        path = Path('pixel-ai-pro.js')
        for source in ["{index: '29', title: '测试标题'}", '{"index": "29", "title": "测试标题"}', '{"index": 29}']:
            self.assertEqual(build.g_index(path, source), '29')
        self.assertEqual(build.g_string('{"slug":"pixel-ai-pro"}', 'slug'), 'pixel-ai-pro')
        self.assertEqual(build.heading_text('{"title":"开始", nested: {title: \'完成\'}}'), '开始完成')

    def test_images_in_js_and_rich_html_are_packaged(self):
        image = next((build.ROOT / 'assets' / 'google-account').glob('*.webp'))
        relative = image.relative_to(build.ROOT).as_posix()
        with self.temporary() as directory:
            site = Path(directory)
            data = {'src': '@embed-image:' + relative, 'html': '<img src="@embed-image:' + relative + '">'}
            packaged = json.loads(build.g_resources(json.dumps(data), site))
            self.assertTrue(packaged['src'].startswith('../assets/guides/google-account/'))
            self.assertIn(packaged['src'], packaged['html'])
            target = site / 'assets' / 'guides' / image.relative_to(build.ROOT / 'assets')
            self.assertEqual(target.read_bytes(), image.read_bytes())
            embedded = json.loads(build.g_resources(json.dumps(data), site, inline=True))
            self.assertTrue(embedded['src'].startswith('data:image/webp;base64,'))
            self.assertIn(embedded['src'], embedded['html'])

    def test_resource_traversal_is_rejected(self):
        with self.temporary() as directory:
            with self.assertRaises(ValueError):
                build.g_resources("'@embed-image:../map/index.html'", Path(directory))

    def test_plus_build_preserves_daily_price_markers(self):
        with self.temporary() as directory:
            site = Path(directory)
            build.build_g(['plus'], site, False)
            page = (site / 'guides' / '17-plus.html').read_text(encoding='utf-8')
            self.assertEqual(page.count('<!-- ph-plus-price:start -->'), 1)
            self.assertEqual(page.count('<!-- ph-plus-price:end -->'), 1)
            self.assertIn("aiGuideStateV2::plus", page)
            self.assertIn('g-engine.js?v=', page)
            self.assertEqual((site / 'assets' / build.G_FONTS[0]).read_bytes(),
                             (build.SITE_DEFAULT / 'assets' / build.G_FONTS[0]).read_bytes())

    def test_inline_page_embeds_fonts_images_engine_and_qr(self):
        with self.temporary() as directory:
            site = Path(directory)
            build.build_g(['google-account'], site, True)
            page = (site / 'guides' / '28-google-account.html').read_text(encoding='utf-8')
            self.assertNotRegex(page, r'<script\s+src=|<link\s+rel="stylesheet"')
            self.assertIn('data:font/woff2;base64,', page)
            self.assertIn('data:image/webp;base64,', page)
            self.assertIn('data:image/png;base64,', page)
            self.assertNotIn('@embed-', page)
            self.assertNotIn('url("../assets/', page)

    def test_ppt_downloads_are_copied_to_existing_urls(self):
        with self.temporary() as directory:
            site = Path(directory)
            build.build_g(['zcode-pptx'], site, False)
            for suffix in ['pptx', 'pdf']:
                relative = f'zcode-pptx/zcode-practice.{suffix}'
                self.assertEqual((site / 'guides' / 'assets' / relative).read_bytes(),
                                 (build.ROOT / 'assets' / relative).read_bytes())


if __name__ == '__main__':
    unittest.main(verbosity=2)
