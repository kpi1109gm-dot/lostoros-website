// reference-build STEP 1: サイトのスクリーンショットと構造情報を取得する
// 使い方: node capture.js <URL> <出力ディレクトリ>
// 前提: 実行ディレクトリ（または親）に playwright がインストールされていること

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];
const out = process.argv[3] || '.';
if (!url) {
  console.error('usage: node capture.js <URL> <outdir>');
  process.exit(1);
}
fs.mkdirSync(out, { recursive: true });

const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)/.test(url);

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    // TLS 1.3のPQ拡張がプロキシに弾かれるため tls1.2 に制限する（この環境固有）
    args: ['--no-sandbox', '--ssl-version-max=tls1.2'],
    proxy: process.env.HTTPS_PROXY && !isLocal
      ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' }
      : undefined,
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text()); });
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));

  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Cookieバナーがあれば閉じる
  for (const label of ['Accept all', 'Accept', 'OK', '同意する', '同意']) {
    const btn = page.getByRole('button', { name: label }).first();
    if (await btn.isVisible().catch(() => false)) { await btn.click().catch(() => {}); break; }
  }

  // スクロール位置ごとのスクリーンショット
  const height = await page.evaluate(() => document.body.scrollHeight);
  const positions = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 0.96];
  for (let i = 0; i < positions.length; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), height * positions[i]);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: path.join(out, `shot_${i}.png`) });
  }

  // スタイル情報の抽出
  const info = await page.evaluate(() => {
    const uniq = (a) => [...new Set(a)];
    const els = [...document.querySelectorAll('body *')].slice(0, 3000);
    const fonts = {}, colors = {}, bgs = {};
    for (const el of els) {
      const cs = getComputedStyle(el);
      fonts[cs.fontFamily] = (fonts[cs.fontFamily] || 0) + 1;
      if (el.textContent && el.textContent.trim()) colors[cs.color] = (colors[cs.color] || 0) + 1;
      const bg = cs.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)') bgs[bg] = (bgs[bg] || 0) + 1;
    }
    const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
    return {
      title: document.title,
      bodyHeight: document.body.scrollHeight,
      topFonts: top(fonts, 8),
      topColors: top(colors, 10),
      topBgs: top(bgs, 10),
      headings: [...document.querySelectorAll('h1,h2,h3')].slice(0, 30).map((h) => {
        const cs = getComputedStyle(h);
        return { tag: h.tagName, text: h.textContent.trim().slice(0, 80), size: cs.fontSize, weight: cs.fontWeight, family: cs.fontFamily.split(',')[0], transform: cs.textTransform };
      }),
      scripts: uniq([...document.querySelectorAll('script[src]')].map((s) => s.src)),
      generator: document.querySelector('meta[name="generator"]')?.content || null,
    };
  });
  fs.writeFileSync(path.join(out, 'info.json'), JSON.stringify(info, null, 2));
  fs.writeFileSync(path.join(out, 'page.html'), await page.content());

  // モバイル表示
  const mp = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mp.goto(url, { waitUntil: 'load', timeout: 60000 });
  await mp.waitForTimeout(4000);
  await mp.screenshot({ path: path.join(out, 'shot_mobile.png') });

  console.log('done. bodyHeight=', height, 'out=', out);
  await browser.close();
})();
