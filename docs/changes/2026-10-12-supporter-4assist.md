# Business Supporter 1社目のロゴ掲載（株式会社フォーアシスト）

日付: 2026-10-12 / 実装: Claude Code / 依頼者: 池田海

## 内容

池田さんから「スポンサーいただいている企業のロゴをもらったので入れてほしい」と依頼。
`docs/supporter-onboarding.md` の手順どおり、OUR PARTNERS の下に
**BUSINESS SUPPORTERS** の枠を新設し、1社目として掲載した。

| ファイル | 変更 |
|---|---|
| assets/supporter-4assist.png | 受領した400×400のJPG（白背景）から、ロゴ外周の余白を切り詰めて358×273のPNGにした。色・形は変更していない |
| index.html | OUR PARTNERS 内に BUSINESS SUPPORTERS の枠とロゴを追加 |
| supporter/index.html | 同上（画像パスは `/assets/...`） |

- 表示サイズは用意済みの `.pt-logos--sm`（高さ最大72px）。FreeZia Sports（パートナー）より一段小さい
- 背景は白のまま。掲載帯も白（#fff）なので境目は見えない
- 会社サイトへのリンクはURLを受け取っていないため付けていない。
  付ける場合は手順書のとおり `rel="sponsored noopener"` を付けること

## 検証

トップ・`/supporter/` を 1280px / 390px で表示。画像の読み込み、表示サイズ（94×72px）、
横スクロールなし、JSエラーなしを確認。

## 池田さんへの確認事項

- 掲載区分を Business Supporter（年額プラン）として扱った。
  FreeZia Sports と同格のパートナーなら、OUR PARTNERS 側へ移して同じ大きさにする
- 会社サイトへのリンクを貼るか
