# サイト点検にもとづく改善

日付: 2026-09-28 / 実装: Claude Code / 依頼者: 池田海

## 経緯

本番サイトをPC（1440px）とスマホ（390px）で実際に開いて点検し、改善プランを提示した。
池田さんから「今できる対応をすべてやってほしい」と依頼があり、
先方の判断や情報が要らないものをすべて実施した。

## 変更内容

| 内容 | 変更ファイル |
|---|---|
| PCで「SUPPORT／ER」と単語の途中で折り返される見出しを修正。文字サイズを列幅に収まる 5.2vw（最大80px）にし、`overflow-wrap:anywhere` を外した | css/style.css |
| 白いセクションの上でヘッダーのロゴ・メニューが白く消える不具合を修正（公開当初から）。反転指定をヘッダー本体へ移し、メニュー表示中は反転を止める | css/style.css, js/main.js |
| BUSINESSの提供内容リストを `<details>` で折りたたみ。スマホは閉じた状態、PCは常に開いて開閉ボタンを隠す。JSが動かない環境でも内容は読める | index.html, css/style.css, js/main.js |
| スマホで英語見出しが「BRANDPARTNERSHIP」とつながる問題を修正（`<br class="pc">` の前にスペース） | index.html |
| ABOUTの「単なる陸上クラブでも、スクールでもありません。」を削除 | index.html |
| スマホで8pxだったラベルを10pxに、ヒーローの自動更新の注記を10px→11pxに | css/style.css |
| 2ショット写真をWebP化（349KB → 202KB。品質85では空の粒子感が消えたため90を採用） | assets/team-duo.webp, index.html |
| Googleアナリティクス 4 の計測を実装（測定IDは未設定。空の間は何も読み込まない） | js/analytics.js, js/main.js |
| Business Supporter専用ページ `/supporter/` と専用シェアカード画像 | supporter/index.html, assets/ogp-supporter.jpg |
| プライバシーポリシー `/privacy/`。フッターとフォーム下からリンク | privacy/index.html, index.html |
| 加入企業のロゴ掲載用のスタイルと手順書（空の間は表示しない） | css/style.css, docs/supporter-onboarding.md |
| サイトマップに2ページ追加 | sitemap.xml |

CSS/JSの読み込みURLのバージョンを `?v=20260928` に更新。

## 検証（ローカル・Google Fontsを読み込んだ状態）

- 見出し「BUSINESS SUPPORTER」が 320 / 390 / 768 / 860 / 861 / 1024 / 1280 / 1440 / 1920px の
  すべてで2行（単語の途中で割れない）・列からのはみ出しなし
- 全幅で横スクロールの発生なし。コンソールエラーなし（3ページ）
- スマホのページ全体の高さ: 17,040px → 16,045px（BUSINESS 3,666px → 2,599px）。PCは変化なし
- 折りたたみ: スマホで閉→タップで開→タップで閉。PCは5件すべて開いた状態
- ヘッダー: PCの白セクション上・ヒーロー上・プライバシーポリシー上で表示を確認。
  スマホのメニュー開閉後に反転が元に戻ることを確認
- WebP: `<picture>` 経由で webp が選ばれ、CONTACTの背景とチーム紹介の写真の配置が以前と同じ
- アナリティクス: ダミーIDで `begin_checkout`（トップ・/supporter/ 両方）、`supporter_cta`、
  `inquiry_cta`、`generate_lead`、`section_view` が送られることを確認。
  ボタンでページ内を移動した際に通過しただけのセクションは数えない（1秒以上の表示を条件）
- ID未設定時は Google のスクリプトを一切読み込まないことを確認
- 実決済・実メール送信は未実施

## 残した判断事項

- 利用規約（解約方法・返金・特典の提供時期）、特定商取引法の表記、インボイス登録番号
- BUSINESSの BRAND PARTNERSHIP と PARTNER の WHY / EXAMPLES の重複統合
- プライバシーポリシーの文面確認（千田さん・池田さん）と所在地の掲載可否
