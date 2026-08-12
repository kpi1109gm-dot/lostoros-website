# CLAUDE.md — 合同会社LosToros コーポレートサイト

新しいセッションで前提説明なしに作業を再開するための引き継ぎ書。
最終更新: 2026-08-12

**依頼者は COO・池田海さん**（ikeda@lostoros.net）。代表の千田さんではないため、
千田さん個人のアカウントが必要な作業は依頼できない。
非エンジニアなので、専門用語は噛み砕き、画面操作は手順を1つずつ示すこと。

---

## プロジェクト概要

- **目的**: 陸上スプリントチーム「LosToros Track Team」を運営するスポーツ事業ブランド、
  合同会社LosTorosのコーポレートサイト。**企業パートナー獲得が最大の目的**
- **対象**: パートナー検討中の企業担当者、メディア、イベント主催者
- **公開URL**: https://lostoros.net （www も同URLへ転送・HTTPS有効）
- **公開日**: 2026-08-03。Google検索は登録済みで「合同会社ロストロス」等で表示される

### 会社情報（クライアント提供・確定）

- 会社名: 合同会社LosToros（ロストロス） / チーム名: LosToros Track Team
- 由来: スペイン語で「闘牛」
- コンセプト: 道なき道を切り拓き、最速へ突き進む
- ビジョン: 陸上スプリントを、誰もが熱狂するスポーツエンターテインメントへ
- ミッション: 競技者の価値を、企業や社会の価値に変換する
- CEO 千田杜真寿（100m・200m）/ COO 池田海（110mH）。両名とも現役選手
- サイト表示の問い合わせ先は chida@lostoros.net。
  **フォーム送信は chida@ と ikeda@ の両方に届く**

---

## 技術構成

- **フロントエンド**: 素のHTML / CSS / JavaScript。**ビルドツール・フレームワークなし**
  - 外部JSライブラリはゼロ（vanilla JSで実装）
  - フォントのみ Google Fonts をCDN読み込み
- **バックエンド**: `server/` に Express。お問い合わせフォームの受信専用
  - 依存: express / cors / nodemailer

### ホスティング（3つ存在する。混同注意）

| 用途 | 稼働場所 | 状態 |
|---|---|---|
| **本番サイト（lostoros.net）** | **GitHub Pages** | 現行。`server: GitHub.com` を確認済み |
| **フォーム受信API** | **Render Web Service `lostoros-api`（Starter $7/月）** | 現行・稼働中 |
| Render Static Site `lostoros-site` | Render | 作成済みだが**未使用**。将来の移行先候補 |

- ドメイン `lostoros.net` は **Wixで契約**（更新期限 2027-06-14）。
  DNSレコードのみGitHub Pagesへ向けている。ネームサーバーはWixのまま
- **1年間はこの構成のまま運用する方針**（池田さん判断）

### デプロイ手順

```bash
git add -A
git commit -m "変更内容"
git push -u origin claude/lostoros-corporate-site-dzn7az
```

- GitHub Pages が数分で自動再デプロイ（**公開元は `main` ではなくこのブランチ**）
- Renderも同ブランチを監視し、`server/` の変更で自動再デプロイ
- 確認: `curl -sSI https://lostoros.net/` / `curl -sS https://lostoros-api.onrender.com/healthz`

---

## ディレクトリ構造

```
index.html                    サイト本体（1ファイル完結のシングルページ）
css/style.css                 全スタイル
js/main.js                    スクロール演出・ナビ・2つのフォーム送信処理
CNAME                         "lostoros.net"
.nojekyll                     GitHub PagesのJekyll処理を無効化
robots.txt                    AI検索クローラー（GPTBot/ClaudeBot等）も明示的に許可
sitemap.xml                   検索エンジン向け
favicon.ico                   ルート必須（Googleが最初に見に来る）
render.yaml                   Render Blueprint（static site + web service）

assets/
  hero-video.mp4              ヒーロー全面背景（404x720・20秒・音声のみ無劣化削除・4.4MB）
  hero-poster.jpg             動画読み込み前の静止画
  team-duo.jpg                2ショット写真（CONTACTの全面背景）
  member-01.jpg / member-02.jpg  千田さん / 池田さんのポートレート（800x1067）
  logo-lockup.png             マーク+文字の横組みロゴ（ヘッダー・フッター・白）
  wordmark.png                文字のみロゴタイプ（ヒーロー巨大表示・白）
  logo.png                    闘牛マーク単体（赤・透過）
  favicon-{48,96,144,192,512}.png / apple-touch-icon.png
  ogp.jpg                     SNSシェア用カード（1200x630）
  partner-freezia.png         パートナー企業ロゴ（FreeZia Sports・掲載許諾済み）

server/index.js               Express。POST /api/contact と GET /healthz
docs/
  project-brief.md            制作ブリーフ・受領素材の記録
  design-analysis.md          参考サイトのデザイン分解メモ
  publishing-guide.md         GitHub Pages公開手順
  render-guide.md             Render設定・メール送信・ドメイン移行手順
.claude/skills/reference-build/  「参照→分解→実装」フローのSkill
```

---

## ページ構成（2026-08-10時点）

ヒーロー（全面動画）→ マーキー(赤) → (001) ABOUT → (002) PHILOSOPHY →
(003) BUSINESS → (004) MEMBERS → (005) PARTNER → (006) CONTACT →
お問い合わせフォーム → (007) BUSINESS PARTNER 申込 → フッター

### BUSINESS：5事業領域（2026-08-10に再編）

`TRACK TEAM` / `BRAND PARTNERSHIP` / `SPORTS & COMMUNITY` /
`CREATIVE & CONTENT` / `HEALTH & PRODUCTIVITY`

- 各事業は「事業名 → 一言 → 提供内容リスト → この事業について相談する」の統一フォーマット
- TRACK TEAM には「CORE — すべての事業の起点となるブランド資産」を明示
- 健康経営は 分析→設計→実行→評価→改善 の一気通貫を図示
- **CTAの `data-inquiry` 属性が問い合わせ種別を引き継ぐ**（js/main.js で実装）。
  種別の選択肢を変えるときは `data-inquiry` の値と完全一致させること

### PARTNER セクション

HERO →「WHY PARTNER WITH LOSTOROS」(5項目) → 「PARTNERSHIP EXAMPLES」(5例) →
「PARTNERSHIP PLAN」→ OUR PARTNERS（ロゴ）→ FOUNDING PARTNER 募集 → CTA(2導線)

- **高額プランは商談導線、Business Partner（年額50,000円）のみ申込フォーム直結**
- **各パートナープランの名称・金額・内容は未受領**。憶測で書かず
  「企業ごとに設計します」に留めている

---

## デザイン方針

### 配色（`css/style.css` の `:root`）

| 変数 | 値 | 用途 |
|---|---|---|
| `--ink` | `#0c0c0d` | 黒背景 |
| `--ink-soft` | `#161618` | やや明るい黒 |
| `--paper` | `#f4f2ec` | 白背景・白文字 |
| `--red` | `#c8102e` | 唯一のアクセント色（闘牛の赤） |

**色数を極端に絞ることがこのデザインの核**。赤は「ここぞ」の1点のみ。
自社の写真・動画はすべて `filter: grayscale(1)` でモノクロ化する。

### フォント

| 変数 | フォント | 用途 |
|---|---|---|
| `--disp` | Goldman | 英語見出し（WHAT WE DO / FOUNDERS など） |
| `--mono` | Space Mono | 小さいラベル・セクション番号 |
| `--jp` | Noto Sans JP | 日本語本文 |

ロゴは**フォントではなく画像**（`wordmark.png` / `logo-lockup.png`）。
表記は **LとTのみ大文字の `LosToros`** が正式。

### ロゴ・ファビコン

- ファビコンは**黒地に白の闘牛マーク**。元ロゴは赤だが検索結果の白背景で沈むため反転
- Googleの要件により **48pxの倍数の正方形**（48/96/144/192/512）。`/favicon.ico` はルート必須

### パートナーロゴの扱い（重要）

- **他社ロゴは改変しない**。モノクロ化もしない（先方のブランド規定に触れる可能性）
- 原色のロゴを正しく見せるため、**白地（#fff）の帯に枠線なしで配置**する。
  Bath Rugby等のパートナー掲載を参照した結果、これが最も自然
- **空き枠（OPEN）は並べない**。パートナー不在の印象を与えるため、
  募集は FOUNDING PARTNER のメッセージで表現する

### レイアウトとトーン

- **シングルページ**。黒(`section--ink`)と白(`section--paper`)を交互に配置し、
  白セクションの上辺は `clip-path` で斜めに切ってスピード感を出す
- セクション見出しは `(001) ABOUT` の**番号+罫線**の編集デザイン
- メンバー紹介は**写真左・テキスト右**を縦に積む（千田さんが上）
- アニメーションは IntersectionObserver。`prefers-reduced-motion` を尊重

---

## これまでの主要な決定事項（理由つき）

1. **参考サイト freegamemgmt.com を「分解して翻訳」**
   - 「AIっぽい平均的なHPは嫌」という要望。丸コピーは著作権上NGなので、
     配色・タイポ・レイアウトの本質だけ抽出して闘牛×スプリントに置換
2. **フレームワークを使わず素のHTML/CSS/JS**
   - 依存が増えると引き継ぎが困難。この規模なら不要でGitHub Pagesにそのまま置ける
3. **ホスティングはGitHub Pages、ドメインはWixのまま**
   - Wixのサイトプランを諦めずに済み、**社用メールも影響を受けない**
4. **フォームはFormspreeではなくRenderの自前API**
   - 池田さんが知り合いのエンジニアに相談してRenderを希望したため
5. **`lostoros-api` を有料プラン（Starter $7/月）に**
   - 無料プランではSMTPが遮断されメールが届かない（後述）。
     有料化で解決し、サーバー休止による待ち時間もなくなった
6. **「スポンサー」ではなく「パートナー」で統一**（2026-08-10）
   - 「企業に応援してもらう」関係ではなく「企業と共に価値をつくる」位置づけにするため。
     5万円プランも当初 Business Supporter だったが **Business Partner に統一**
7. **営業資料の情報を全部は載せない**
   - 料金プラン表・比較表・資金使途は商談で見せる情報。
     サイトに載せると読ませる圧が強くなり問い合わせのハードルが上がる
8. **FAQセクションを削除**（2026-08-10）
   - スクロール量が増え離脱が懸念されたため。
     **表示と構造化データは一致必須**なので、FAQPageのJSON-LDも同時に削除した。
     復活させるなら別ページ（/faq）に切り出すのが望ましい

---

## ハマったポイント・注意点

### 1. Renderの無料プランはSMTPを遮断している（最大の落とし穴）

- 2025年9月からポート25/465/587への送信がブロック。設定が正しくても
  **約2分でタイムアウト**する
- 解決策は2つ。現在は**方式B（有料化）**
  - 方式A: `RESEND_API_KEY` を設定すると `server/index.js` が自動でHTTP API送信に切り替わる（実装・テスト済み）
  - 方式B: Starterプラン以上 ← **現在こちら**
- `/healthz` が `{"mail":true,"mode":"smtp"}` を返しても、
  無料プランでは**実際には送れない**。healthzだけで判断しないこと

### 2. CSSの落とし穴（実際に2回踏んだ）

- **グリッド/フレックスの項目は既定で中身より縮まない**。
  大きなロゴ画像を入れると列が広がり枠外へはみ出す → `min-width: 0` が必要
- **同じ詳細度なら後に書いた方が勝つ**。`.cfield input { width:100% }` が
  後方にあるため、チェックボックスは `input[type="checkbox"]` で詳細度を上げて打ち消している

### 3. Wixの DNS設定は「@」が使えない

- ルートドメインのAレコードは**ホスト名を空欄**にする（`@` は弾かれる）
- **MX・TXTレコードには絶対に触らない**。触ると社用メールが止まる
- ネームサーバー変更は不可だが、DNSレコード編集（ポインティング方式）は可能

### 4. GitHub Pagesの公開ブランチは `main` ではない

- `claude/lostoros-corporate-site-dzn7az` が公開元。間違えると本番に反映されない

### 5. コンテナ再起動で作業ファイルが消えることがある

- 作業ディレクトリが初期状態（README.mdのみ）に戻る場合がある。
  **リモートには残っている**ので復旧できる:
  `git fetch origin <branch> && git reset --hard origin/<branch>`

### 6. 動画は再エンコードしない約束

- 「画質は絶対落としたくない」という要望。音声トラック削除のみ（`ffmpeg -c:v copy -an`）
- 現素材は404x720と低解像度。高解像度版（1080x1920）が提供されたら差し替える

### 7. この作業環境の癖

- 外部サイトをブラウザで開くには追加設定が必要:
  ```js
  chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',        // playwright install は不要
    args: ['--no-sandbox', '--ssl-version-max=tls1.2'],  // TLS1.3がプロキシに弾かれる
    proxy: { server: process.env.HTTPS_PROXY },
  })
  ```
  ローカル(127.0.0.1)へは proxy を外すこと
- `pkill -f "node index.js"` は**自分のシェル自身にマッチして落ちる**。PIDを特定して kill する
- コンテナ再起動後は Pillow / playwright の再インストールが必要な場合がある

---

## 未対応のTODO

- [ ] **パートナープランの詳細**（Business Partner 以外の名称・金額・内容）が未受領。
      受領したら PARTNERSHIP PLAN に反映する
- [ ] **利用規約ページ**。Business Partner 申込前の規約確認用。規約本文が未受領
- [ ] **決済・振込フロー**。現状は申込フォーム送信 → メール通知 → 手動で振込先案内。
      クライアント側で「別途決める」とされている
- [ ] **ページが長い**（スマホで約17,000px）。短縮案は
      ①BUSINESSの提供内容を折りたたむ ②EXAMPLESを横スクロール ③PARTNERを別ページ化
- [ ] **表示速度**。スマホ実測で表示完了まで約13秒（動画4.4MB＋画像）。
      改善案はスマホで動画を静止画に差し替え、team-duo.jpg(349KB)のWebP化、遅延読み込み
- [ ] **SNSプロフィールへのURL記載**（池田さん作業待ち）。
      アカウントURLを受け取ったら構造化データに `sameAs` を追加する
- [ ] **実績（PROOF）セクション**。大会結果・取り組み事例・メディア掲載など。
      実績が増えたら追加できる構造にしてある
- [ ] **会社概要の追加情報**（所在地・設立年月・資本金）を載せるか未定。
      `index.html` の `company-table` に `<!-- TODO -->` コメントあり
- [ ] **Render Static Site（`lostoros-site`）の扱い**。未使用。使わないなら削除してよい

### 判断待ち・未確認事項

- Wixのサイトプランを解約するか**未確認**。解約前に「メールの契約がサイトプランに
  含まれていないか」をWixサポートに確認する必要がある
- ドメイン更新（2027-06-14）後の方針。池田さんは「切れたらonrender.comのURLで」と
  言っているが、他社へ移管して `lostoros.net` を維持する案も提示済み。**結論は未定**
- 会話中にGoogle検索結果として「所在地: 東京都世田谷区経堂1丁目15番22号キョウドウゲート102、
  法人番号9010903011019、設立2026年7月」が表示されたが、これは**公開登記情報を
  第三者サイトが掲載したもの**で、クライアントから直接受領した情報ではない。
  サイトに載せる際は本人確認が必要
