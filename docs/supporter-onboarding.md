# Business Supporter 加入時の対応手順

作成: 2026-09-28

Business Supporter の特典に「公式サイトへのロゴ掲載」がある。
1社目の加入時に慌てないよう、受付からサイト掲載までの流れをまとめる。

## 全体の流れ

1. **Squareから入金通知が届く**（会社名・ご担当者名・電話・メールはSquare側に記録される）
2. **担当からお礼と今後のご案内を送る**（サイトには「お支払い後、担当よりご連絡いたします」と記載済み）
3. **ロゴデータと掲載の可否を確認する**（下記）
4. **サイトに掲載する**（下記のHTMLを追加してpush）
5. **掲載したことを先方に連絡する**

## ロゴを受け取るときに確認すること

- **掲載してよいかの確認**（社名だけ・ロゴなし、を希望される場合もある）
- **ロゴのファイル**：背景が透明なPNG、またはSVG・AI形式。横長のものが望ましい
- **ブランド規定の有無**（色の指定・余白・背景色など）。**サイト側でロゴの色や形は変えない**
- **会社のウェブサイトへのリンクを貼るか**。貼る場合はURLを受け取る

## 決めておく必要があること（未決定）

- 入金から掲載までの目安日数（例：ロゴ受領から5営業日以内）
- 交流会の開催時期と案内方法
- 「スポンサー呼称権」の具体的な使い方の案内（例：「LosToros Track Team オフィシャルサポーター」と名乗ってよい、など）
- 解約された場合にロゴをいつ外すか

## サイトへの掲載方法（技術メモ）

`index.html` の OUR PARTNERS（`.pt-partners`）の中、`</ul>` の直後に以下を追加する。
パートナー企業より一段小さく表示されるスタイル（`.pt-supporters` / `.pt-logos--sm`）は用意済み。
**加入企業が0社のあいだは追加しない**（空の枠はパートナー不在の印象を与えるため）。

```html
<div class="pt-supporters">
  <p class="pt-h mono">BUSINESS SUPPORTERS</p>
  <ul class="pt-logos pt-logos--sm">
    <li><img src="assets/supporter-会社名.png" alt="会社名" width="横幅" height="高さ" loading="lazy"></li>
  </ul>
</div>
```

`/supporter/index.html` の OUR PARTNERS にも同じものを追加する（画像パスは `/assets/...` にする）。

### 注意点

- 画像は `assets/supporter-会社名.png` として保存し、余白を切り詰めてから置く
  （FreeZia Sports のロゴも同様に余白を切り詰めて600px幅に縮小している）
- **会社サイトへリンクする場合は `rel="sponsored"` を付ける**。
  お金を受け取って貼るリンクにこれを付けないと、Googleのガイドライン違反とみなされる恐れがある
  ```html
  <li><a href="https://example.co.jp/" rel="sponsored noopener" target="_blank"><img ...></a></li>
  ```
- 構造化データ（`index.html` 冒頭の JSON-LD）には加入企業を追加しなくてよい
