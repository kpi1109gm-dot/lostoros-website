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

---

## 追記：パートナー扱いへ変更（同日）

池田さんに確認したところ、フォーアシスト様は **FreeZia Sports と同じ位置付け**とのこと。

- BUSINESS SUPPORTERS の枠を外し、OUR PARTNERS の `.pt-logos` に FreeZia Sports と並べた
  （空の枠は残さない方針のため、枠ごと削除）
- 画像名を `supporter-4assist.png` → `partner-4assist.png` に変更（`partner-freezia.png` と揃えた）
- 表示は FreeZia Sports 188×150px / フォーアシスト 197×150px。PCは横並び、スマホは縦並び
- 1280px・390pxで表示・読み込み・はみ出し・JSエラーを確認

**教訓：ロゴを受け取ったら、掲載前に「年額プランか、パートナーか」を確認する。**
手順書にも追記した。

---

## 追記：パートナー2社のロゴにリンクを設定（同日）

池田さんからURLを受領し、OUR PARTNERS の2社のロゴを各社サイトへのリンクにした
（トップ・`/supporter/` の両方）。

| 会社 | リンク先 |
|---|---|
| FreeZia Sports | https://freeziasports.com/ |
| 株式会社フォーアシスト | https://www.4assist.co.jp/ |

- 新しいタブで開く（`target="_blank"`）。訪問者がLosTorosのサイトを離れないように
- `rel="sponsored noopener"`。協賛関係のリンクとしてGoogleに正しく伝えるため
  （手順書 `docs/supporter-onboarding.md` の方針どおり）
- `noreferrer` は付けていない。先方のアクセス解析に「LosTorosから来た」と残り、
  協賛の効果を先方が確認できるようにするため
- ロゴの色は変えず、マウスを乗せたときだけ少し薄くする。キーボード操作時は赤い枠を表示
- CSS変更に伴い、キャッシュ対策のバージョンを `?v=20261012` に更新

検証：両ページを1280px・390pxで表示し、実際にクリックして2社とも
新しいタブで正しいURLが開くことを確認。ロゴの表示サイズは変化なし。
