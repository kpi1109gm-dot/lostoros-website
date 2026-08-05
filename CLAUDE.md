# CLAUDE.md — 合同会社LosToros コーポレートサイト

このファイルは、新しいセッションで前提説明なしに作業を再開するための引き継ぎ書。
最終更新: 2026-08-05

**重要**: 依頼者は **COO・池田海さん**（ikeda@lostoros.net）。
代表の千田さんではないので、千田さん個人のアカウントが必要な作業は依頼できない。
非エンジニアなので、専門用語は噛み砕いて説明し、画面操作は手順を1つずつ示すこと。

---

## プロジェクト概要

- **サイトの目的**: 合同会社LosToros（陸上スプリントチーム「LosToros Track Team」を
  運営するスポーツ事業ブランド）のコーポレートサイト。
  スポンサー候補企業・取材・イベント依頼者に向けて信頼感を伝え、問い合わせにつなげる
- **対象ユーザー**: スポンサー検討中の企業担当者、メディア、イベント主催者
- **公開URL**: https://lostoros.net （www も同URLへ転送、HTTPS有効）
- **公開日**: 2026-08-03
- **Google検索**: 2026-08-05時点でインデックス登録済み。「合同会社ロストロス」で
  1ページ目に表示されることを確認済み

### 会社情報（クライアント提供・確定）

- 会社名: 合同会社LosToros（ロストロス） / チーム名: LosToros Track Team
- 由来: スペイン語で「闘牛」
- コンセプト: 道なき道を切り拓き、最速へ突き進む
- ビジョン: 陸上スプリントを、誰もが熱狂するスポーツエンターテインメントへ
- ミッション: 競技者の価値を、企業や社会の価値に変換する
- 創業メンバー: CEO 千田杜真寿（100m・200m） / COO 池田海（110mH）
- 問い合わせ先: chida@lostoros.net（サイト表示用）、
  フォーム送信は chida@ と ikeda@ の両方に届く

---

## 技術構成

- **フロントエンド**: 素のHTML / CSS / JavaScript。**ビルドツール・フレームワークなし**
  - 外部JSライブラリはゼロ（GSAP等は使わず vanilla JS で実装）
  - フォントのみ Google Fonts をCDN読み込み
- **バックエンド**: `server/` に Express（Node.js）。お問い合わせフォームの受信専用
  - 依存: express / cors / nodemailer

### ホスティング（2系統が並存している。混同注意）

| 用途 | 稼働場所 | 状態 |
|---|---|---|
| **本番サイト（lostoros.net）** | **GitHub Pages** | 現行。`server: GitHub.com` を確認済み |
| フォーム受信API | **Render Web Service**（`lostoros-api`、Starter $7/月） | 現行・稼働中 |
| Render Static Site（`lostoros-site`） | Render | 作成済みだが**未使用**。将来の移行先候補 |

- ドメイン `lostoros.net` は **Wixで契約**（更新期限 2027-06-14）。
  DNSレコードのみGitHub Pagesへ向けている。ネームサーバーはWixのまま
- **1年間はこの構成のまま運用する方針**（池田さん判断）

### デプロイ手順

```bash
# ブランチ claude/lostoros-corporate-site-dzn7az にプッシュするだけ
git add -A
git commit -m "変更内容"
git push -u origin claude/lostoros-corporate-site-dzn7az
```

- GitHub Pages が数分で自動再デプロイ（`main` ではなくこのブランチが公開元）
- Render も同ブランチを監視しており、`server/` の変更で自動再デプロイ
- 反映確認: `curl -sSI https://lostoros.net/` / `curl -sS https://lostoros-api.onrender.com/healthz`

---

## ディレクトリ構造

```
index.html                    サイト本体（1ファイル完結のシングルページ）
css/style.css                 全スタイル
js/main.js                    スクロール演出・ナビ・フォーム送信
CNAME                         "lostoros.net"（GitHub Pagesの独自ドメイン設定）
.nojekyll                     GitHub PagesのJekyll処理を無効化
robots.txt / sitemap.xml      検索エンジン向け
favicon.ico                   ルート必須（Googleが最初に見に来る）
render.yaml                   Render Blueprint（static site + web service の定義）

assets/
  hero-video.mp4              ヒーロー全面背景の映像（404x720・20秒・音声削除済み・4.4MB）
  hero-poster.jpg             動画読み込み前に表示する静止画
  team-duo.jpg                2ショット写真（CONTACTセクションの全面背景）
  member-01.jpg               千田さんのポートレート（800x1067）
  member-02.jpg               池田さんのポートレート（800x1067）
  logo-lockup.png             マーク+文字の横組みロゴ（ヘッダー・フッター用・白）
  wordmark.png                文字のみロゴタイプ（ヒーローの巨大表示用・白）
  logo.png                    闘牛マーク単体（赤・透過）
  favicon-{48,96,144,192,512}.png / apple-touch-icon.png
  ogp.jpg                     SNSシェア用カード画像（1200x630）

server/
  index.js                    Express。POST /api/contact と GET /healthz
  package.json

docs/
  project-brief.md            制作ブリーフ・受領素材の記録
  design-analysis.md          参考サイトのデザイン分解メモ
  publishing-guide.md         GitHub Pages公開手順
  render-guide.md             Render設定・メール送信・ドメイン移行手順

.claude/skills/reference-build/
  SKILL.md                    「参照→分解→実装」フローのSkill化
  scripts/capture.js          参考サイトのスクショ・構造情報を取得するスクリプト
```

---

## デザイン方針

### 配色（`css/style.css` の `:root`）

| 変数 | 値 | 用途 |
|---|---|---|
| `--ink` | `#0c0c0d` | 黒背景 |
| `--ink-soft` | `#161618` | やや明るい黒 |
| `--paper` | `#f4f2ec` | 白背景・白文字 |
| `--red` | `#c8102e` | 唯一のアクセント色（闘牛の赤） |

**色数を極端に絞ることがこのデザインの核**。赤は「ここぞ」の1点にのみ使う。
写真・動画はすべて `filter: grayscale(1)` でモノクロ化して色数を保つ。

### フォント

| 変数 | フォント | 用途 |
|---|---|---|
| `--disp` | Goldman | 英語の見出し（WHO WE ARE / FOUNDERS など） |
| `--mono` | Space Mono | 小さいラベル・セクション番号・等幅表示 |
| `--jp` | Noto Sans JP | 日本語本文 |

- ロゴ部分は**フォントではなく画像**（`wordmark.png` / `logo-lockup.png`）を使用。
  Goldmanで再現していた時期があるが、公式ロゴ受領後に画像へ置換した
- 「LosToros」の表記は **LとTのみ大文字**が正式。ただし**ロゴ画像内の字形がそれ**なので、
  テキストで書く箇所も `LosToros` に統一する

### ロゴ・ファビコン

- **ファビコンは黒地に白の闘牛マーク**。元ロゴは赤だが、検索結果の白背景で沈むため反転した
- Googleの要件により **48pxの倍数の正方形**で用意（48/96/144/192/512）
- `/favicon.ico` はルート直下必須

### レイアウトとトーン

- **シングルページ構成**。セクション順:
  ヒーロー → マーキー(赤) → ABOUT → PHILOSOPHY → BUSINESS → MEMBERS →
  SPONSORS → CONTACT → お問い合わせフォーム → フッター
- 黒背景(`section--ink`)と白背景(`section--paper`)を交互に配置。
  白セクションの上辺は `clip-path` で斜めに切ってスピード感を出す
- セクション見出しは `(001) ABOUT` のような**番号+罫線**の編集デザイン
- メンバー紹介は**写真左・テキスト右の横並びを縦に積む**（千田さんが上）
- アニメーションは vanilla JS の IntersectionObserver。`prefers-reduced-motion` を尊重

---

## これまでの主要な決定事項（理由つき）

1. **参考サイト freegamemgmt.com を「分解して翻訳」する方式を採用**
   - 理由: 「AIっぽい平均的なHPは嫌」という要望。丸コピーは著作権上NGなので、
     配色・タイポ・レイアウトの**本質だけ抽出**して闘牛×スプリントに置換した
   - 分解結果は `docs/design-analysis.md` に文書化済み

2. **フレームワークを使わず素のHTML/CSS/JSで実装**
   - 理由: 依存が増えるとメンテと引き継ぎが難しくなる。
     このサイトの規模なら不要で、GitHub Pagesにそのまま置ける

3. **ホスティングはGitHub Pages、ドメインはWixのまま**
   - 理由: Wixのサイトプランを諦めずに済み、**社用メールも影響を受けない**。
     WixはDNSレコード編集（ポインティング方式）に対応しているため両立できた

4. **フォームはFormspreeではなくRenderの自前API**
   - 理由: 池田さんが知り合いのエンジニアに相談してRenderを希望したため
   - ただしRenderは「フォームサービス」ではないので、受信プログラムを自作した

5. **Renderの `lostoros-api` を有料プラン（Starter $7/月）にした**
   - 理由: 無料プランではSMTP送信が遮断されメールが届かない（後述）。
     有料化で解決し、同時にサーバー休止による待ち時間もなくなった

6. **サイト表示のメールは chida@ のまま、フォーム送信は両名に届く設定**
   - 理由: 池田さんの判断（表示は代表宛が自然）。
     `MAIL_TO` にカンマ区切りで2アドレスを指定することで両立している

7. **営業資料の情報を「全部は載せない」方針**
   - 理由: 料金プラン表・比較表・資金使途などは商談で見せる情報。
     サイトに載せると読ませる圧が強くなり問い合わせのハードルが上がる

---

## ハマったポイント・注意点

### 1. Renderの無料プランはSMTPを遮断している（最大の落とし穴）

- 2025年9月からポート25/465/587への送信がブロックされている。
  設定が正しくてもメールが届かず、**約2分でタイムアウト**する
- 解決策は2つ。今は**方式B（有料化）**を採用済み
  - 方式A: Resend等のHTTP APIを使う（`RESEND_API_KEY` を設定すれば
    `server/index.js` が自動でそちらを使う。実装済み・テスト済み）
  - 方式B: Starterプラン以上にする ← **現在こちら**
- `/healthz` が `{"mail":true,"mode":"smtp"}` を返しても、
  無料プランでは**実際には送れない**。healthzだけで判断しないこと

### 2. この作業環境からブラウザで外部サイトを開くには追加設定が必要

```js
chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',   // playwright install は不要
  args: ['--no-sandbox', '--ssl-version-max=tls1.2'],  // TLS1.3がプロキシに弾かれる
  proxy: { server: process.env.HTTPS_PROXY },
})
```
- `--ssl-version-max=tls1.2` がないと `ERR_CONNECTION_RESET` になる
- ローカル(127.0.0.1)へアクセスする時は `proxy` の `bypass` を指定するか proxy 自体を外す

### 3. WixのDNS設定は「@」が使えない

- ルートドメインのAレコードを追加するとき、**ホスト名は空欄**にする（`@` は弾かれる）
- **MX・TXTレコードには絶対に触らない**。触ると社用メールが止まる
- Wixはネームサーバー変更ができないが、DNSレコード編集（ポインティング方式）は可能

### 4. GitHub Pagesの公開ブランチは `main` ではない

- `claude/lostoros-corporate-site-dzn7az` が公開元。`main` にはほぼ何も無い
- ブランチを間違えると本番に反映されない

### 5. 再デプロイ中はファイルが一時的に404になる

- Search Consoleへのサイトマップ送信が「取得できませんでした」になったのはこれが原因。
  デプロイ直後に外部サービスへ登録する作業をぶつけない

### 6. 動画は再エンコードしない約束

- 「画質は絶対落としたくない」という要望があり、音声トラックの削除のみ
  （`ffmpeg -c:v copy -an`）で対応した。**映像は無劣化**
- 現在の素材は404x720と低解像度のため、大画面ではソフトに見える。
  高解像度版（1080x1920）が提供されたら差し替える

### 7. Playwrightでの検証時のプロセス管理

- `pkill -f "node index.js"` は**自分のシェル自身にマッチして落ちる**ことがある。
  PIDを特定して `kill` すること
- ポート3000が掴まれたままだと `EADDRINUSE` になる

---

## 未対応のTODO

- [ ] **SNSプロフィールへのURL記載**（池田さん作業待ち）。
      アカウントURLを受け取ったら、構造化データに `sameAs` を追加する
- [ ] **検索結果へのファビコン反映待ち**。2026-08-05に設置完了。
      Googleの再クロール次第で数日〜2週間かかる
- [ ] **サイトマップのステータス確認**。2026-08-04時点で「取得できませんでした」。
      Googleの自動再取得を待っている状態。1日以上変わらなければ再送信
- [ ] **スポンサーロゴの差し替え**。現在は「YOUR LOGO」の点線枠4つ
- [ ] **会社概要の追加情報**（所在地・設立年月・資本金）を載せるか未定。
      `index.html` の `company-table` に `<!-- TODO -->` コメントあり
- [ ] **動画の高解像度版**（1080x1920）が提供されたら差し替え
- [ ] **Render Static Site（`lostoros-site`）の扱い**。作成済みだが未使用。
      使わないなら削除してよい

### 判断待ち・未確認事項

- Wixのサイトプランを解約するか**未確認**。解約前に「メールの契約がサイトプランに
  含まれていないか」をWixサポートに確認する必要がある
- ドメイン更新（2027-06-14）後の方針。池田さんは「切れたらonrender.comのURLで」と
  言っているが、他社へ移管して `lostoros.net` を維持する案も提示済み。**結論は未定**
- 会話中にGoogle検索結果として「所在地: 東京都世田谷区経堂1丁目15番22号キョウドウゲート102、
  法人番号9010903011019、設立2026年7月」が表示されていたが、これは**公開登記情報を
  第三者サイトが掲載したもの**で、クライアントから直接受領した情報ではない。
  リポジトリ内のドキュメントにも記録していない。サイトに載せる際は本人確認が必要
