// 日本語の文章に「ここで改行してよい」目印（<wbr>）を文節ごとに入れる。
//
// スマホで「る。」「お」のように1〜2文字だけ次の行に落ちるのを防ぐため（2026-11-01）。
// CSSの word-break: keep-all と組み合わせると、改行は文節の切れ目だけで起きる。
// 文節の判定には Google の BudouX を使う。サイトの表示には何も読み込まない（この作業用のみ）。
//
// 使い方（文章を書き換えたあとに実行。何度実行しても結果は同じ）:
//   npm install --no-save budoux
//   node tools/wbr.cjs
//
// 実行しなくてもサイトは壊れない。その文章だけ、普通の折り返しになる。
const fs = require('fs');
const path = require('path');
const { loadDefaultJapaneseParser } = require('budoux');
const parser = loadDefaultJapaneseParser();

const ROOT = path.join(__dirname, '..');
const FILES = ['index.html', 'about', 'business', 'members', 'partner', 'contact', 'supporter', 'privacy']
  .map(f => path.join(ROOT, f.endsWith('.html') ? f : f + '/index.html'));

// 中身を書き換えてはいけない要素（<wbr> を入れると壊れる・意味がない）
const SKIP = /^(script|style|title|head|option|select|textarea|noscript)$/;
const JA = /[぀-ヿ㐀-鿿！-｠]/;

function addWbr(text) {
  if (!JA.test(text)) return text;
  // 文字参照（&amp; など）は1文字の目印に置き換えてから区切り、あとで戻す
  const ents = [];
  const plain = text.replace(/&[#a-zA-Z0-9]+;/g, m => { ents.push(m); return String.fromCharCode(0xE000 + ents.length - 1); });
  return parser.parse(plain).join('<wbr>').replace(/[-]/g, c => ents[c.charCodeAt(0) - 0xE000]);
}

for (const file of FILES) {
  const src = fs.readFileSync(file, 'utf8').replace(/<wbr>/g, '');
  const stack = [];
  const out = src.split(/(<!--[\s\S]*?-->|<[^>]+>)/).map(part => {
    if (part.startsWith('<!--')) return part;
    const tag = part.match(/^<\/?([a-zA-Z0-9]+)/);
    if (tag) {
      const name = tag[1].toLowerCase();
      if (part.startsWith('</')) { const i = stack.lastIndexOf(name); if (i >= 0) stack.length = i; }
      else if (!/\/>$/.test(part) && !/^(br|img|input|meta|link|source|hr|wbr)$/.test(name)) stack.push(name);
      // PCだけの改行（<br class="pc">）はスマホでは消えるので、代わりに改行してよい目印を置く
      if (name === 'br' && !part.startsWith('</') && stack.includes('body')) return part + '<wbr>';
      return part;
    }
    return stack.some(t => SKIP.test(t)) || !stack.includes('body') ? part : addWbr(part);
  }).join('');
  fs.writeFileSync(file, out);
  console.log(path.relative(ROOT, file), (out.match(/<wbr>/g) || []).length);
}
