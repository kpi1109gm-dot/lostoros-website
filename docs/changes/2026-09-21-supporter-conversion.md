# Business Supporter 加入導線強化

日付: 2026-09-21 / 実装: Codex / 依頼者: 池田海

## 目的・決定

直近は年額50,000円（税込）のBusiness Supporter加入を増やす。
企業支援の実績掲載は後日。既存の黒・白・赤のデザインと本人の素材を維持し、
入口から条件確認、Squareでの入力・決済までの迷いを減らす。
本番反映とClaude Code向けの記録は依頼者から明示的に承認済み。

## 変更ファイル

| ファイル | 変更 |
|---|---|
| index.html | ヒーローの加入CTA、チーム紹介、申込案内の上部移動、番号更新、ナビ、固定CTA。Squareリンクを1か所に集約 |
| css/style.css | 末尾に加入導線のスタイル、860px以下の固定CTA、380px以下の補正、装飾の横はみ出し抑制 |
| js/main.js | 末尾の独立IIFEにIntersectionObserver・MutationObserver・画面幅変更による固定CTA制御 |
| CLAUDE.md | 最新目的、構成、挙動、リンク数、検証範囲を更新 |

CSS/JSのキャッシュ対策として読み込みURLにバージョンクエリを追加。
CSS: supporter-20260921-3 / JS: supporter-20260921。
追加画像・追加依存・新たな入力フォームはなし。

## 導線

トップ / ナビ / PARTNER / スマホ固定CTA → #supporter → Square。
申込セクションでは特典、税込年額、自動更新、入力と支払いの流れを表示。
Squareへの遷移は同じタブ。サイト内で会社名等を重複入力させない。
CONTACTメニュー → #contact-form。事業別のdata-inquiryは維持。

固定CTAは幅860px以下のみ。トップ・申込案内・問い合わせフォーム・フッターの
いずれかが画面に入ると隠す。メニュー表示中も隠す。
非対応ブラウザやJS無効時には固定CTAは表示せず、通常のHTMLリンクを利用する。
加入案内本体にはdata-revealを付けず、表示アニメーション待ちをなくしている。

## 検証

- PC・390px・320pxの表示をブラウザで確認。
- 320pxの横幅: documentElement.clientWidth = scrollWidth = 305（スクロールバーを除く）。
- ページ内リンクの参照先IDに欠落なし。
- トップ→申込案内、CONTACT→フォーム、メニュー開閉、固定CTAの出し分けを確認。
- Squareのhrefが既存の正規リンクと一致することを確認。
- node --check js/main.js と git diff --check を実行。
- 実決済・フォーム実送信・加入率/離脱率の測定は未実施。成果は公開後に検証する。

## 継続時の注意

公開ブランチは claude/lostoros-corporate-site-dzn7az。mainではない。
変更前のコミットは452a56297120b8b414d7275724795c104d544326。
本変更の取り消しは該当コミットのrevertを用い、後続の他者の変更を残す。
解約期限・返金条件・特典提供日程など、未確認の契約条件を創作しない。
サーバー、DNS、Square側の設定、メール送信先は触っていない。
