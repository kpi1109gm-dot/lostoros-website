# Render 移行・お問い合わせフォーム設定ガイド

Renderは「フォーム送信サービス」ではなく「アプリを動かす場所」なので、
サイト本体（静的サイト）と、フォームを受け取るAPI（Webサービス）の2つを作る。

## 構成

| サービス | 種類 | プラン | 役割 |
|---|---|---|---|
| lostoros-site | Static Site | 無料 | サイト本体。CDN配信・常時稼働・スリープなし |
| lostoros-api | Web Service (Node) | 無料→後日Starter | フォーム受信とメール送信 |

リポジトリ直下の `render.yaml` に定義済み。Blueprintから一括作成できる。

**無料枠の注意**: Web Serviceの無料プランは一定時間アクセスがないと休止し、
次の起動に最大1分程度かかる。フォーム送信時に「接続に少し時間がかかっています」
と表示されるのはこのため。Starter（$7/月）にすると休止しなくなる。
サイト本体（Static Site）は無料でも休止しないので、表示が遅くなることはない。

---

## STEP 1: Renderにサービスを作る

1. https://render.com/ にアクセスし、**GitHubアカウントで登録**
2. ダッシュボード右上 **Add new → Blueprint**
3. リポジトリ `kpi1109gm-dot/lostoros-website` を選択
   （表示されない場合は Credentials → Configure in GitHub でリポジトリを許可）
4. ブランチに `claude/lostoros-corporate-site-dzn7az` を指定
5. `render.yaml` が読み込まれ、2つのサービスが提案される → **Apply**

数分でデプロイが完了し、以下のURLが発行される:

- サイト: `https://lostoros-site.onrender.com`
- API: `https://lostoros-api.onrender.com`

※サービス名が重複して別名になった場合は、APIのURLを控えて
`js/main.js` の `FORM_ENDPOINT` を書き換えること（Claudeに伝えれば対応する）。

## STEP 2: メール送信の設定

> **重要**: Renderの無料プランは2025年9月から **SMTPポート(25/465/587)への
> 送信を遮断** している。そのためGmailのSMTPは無料プランでは使えない。
> 下記のどちらかを選ぶ。

### 方式A: Resend（HTTP API）を使う — 無料のまま動く【推奨】

RenderがブロックするのはSMTPポートのみで、HTTPS経由のメールAPIは使える。
Resendは月3,000通まで無料。

1. https://resend.com/ で登録（GitHubアカウントで可）
2. **Domains** → **Add Domain** → `lostoros.net` を入力
3. 表示されるDNSレコード（3件程度）をWixの「DNSレコードを管理」で追加
   - **既存のMXレコードには触らない**。Resendは `send.lostoros.net` など
     サブドメイン向けのレコードを使うので、今のメール受信とは共存できる
4. Resend側で **Verified** になるまで待つ（数分〜数十分）
5. **API Keys** → **Create API Key** → 発行されたキー（`re_` で始まる）をコピー
6. Renderダッシュボード → `lostoros-api` → **Environment** に登録:

| キー | 値 |
|---|---|
| RESEND_API_KEY | `re_` で始まるAPIキー |
| MAIL_FROM | `LosToros サイト <noreply@lostoros.net>` |
| MAIL_TO | `chida@lostoros.net,ikeda@lostoros.net` |

7. SMTP_* の環境変数は削除してよい（残っていてもResendが優先される）

### 方式B: Renderを有料プラン（Starter $7/月）にしてSMTPを使う

有料にするとSMTPの遮断が解除される。あわせて**サービスの休止もなくなる**ため、
フォーム送信時の待ち時間もなくなる。

1. Renderダッシュボード → `lostoros-api` → **Settings** → Instance Type を
   **Starter** に変更
2. アプリパスワードは**設定する本人のアカウント**で発行してよい
   （池田さんなら ikeda@lostoros.net。千田さんのアカウント情報は不要）
   https://myaccount.google.com/apppasswords
3. **Environment** に登録:

| キー | 値 |
|---|---|
| SMTP_HOST | smtp.gmail.com |
| SMTP_PORT | 465 |
| SMTP_USER | アプリパスワードを発行したアドレス |
| SMTP_PASS | 発行した16桁 |
| MAIL_TO | `chida@lostoros.net,ikeda@lostoros.net` |

### 設定できたかの確認（共通）

`https://lostoros-api.onrender.com/healthz` を開く。

- `{"ok":true,"mail":true,"mode":"resend"}` → 方式Aで設定済み
- `{"ok":true,"mail":true,"mode":"smtp"}` → 方式Bで設定済み
- `"mode":"none"` → 未設定

そのうえでサイトのフォームからテスト送信し、受信を確認する。

## STEP 3: 独自ドメイン lostoros.net をRenderへ向ける

現在は GitHub Pages に向いている。Renderへ切り替える場合:

### 3-1. Render側

`lostoros-site` → Settings → **Custom Domains** → `lostoros.net` と
`www.lostoros.net` を追加。

### 3-2. Wix側（DNSレコードを管理）

| 種類 | ホスト名 | 値 |
|---|---|---|
| A | （空欄） | 216.24.57.1 |
| CNAME | www | lostoros-site.onrender.com |

- 既存のGitHub Pages向けAレコード4つ（185.199.108〜111.153）は削除する
- **MX・TXTレコードには触らない**（メールが止まる）
- AAAAレコードがあれば削除する（Render指定）

### 3-3. 確認

Renderのダッシュボードでドメインが Verified になり、
証明書が自動発行されれば https://lostoros.net でRender版が表示される。

---

## ドメイン契約が切れた後の運用

Wixのドメイン契約は 2027年6月14日 まで。更新しない場合は
`https://lostoros-site.onrender.com` が正式URLになる（無料・恒久）。

ただし独自ドメインは会社の信用に直結するため、Wixを離れても
他社（Cloudflare Registrar・お名前.com等、年1,500円前後）へ
移管して lostoros.net を維持する選択肢も検討する価値がある。

---

## ローカルでの動作確認方法（開発者向け）

```bash
cd server
npm install
SMTP_HOST=smtp.gmail.com SMTP_PORT=465 \
SMTP_USER=chida@lostoros.net SMTP_PASS=xxxx \
MAIL_TO=chida@lostoros.net node index.js
# 別ターミナルで
curl -X POST http://127.0.0.1:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"テスト","email":"a@example.com","message":"本文"}'
```

## 実装済みの迷惑メール対策

- 隠しフィールド（honeypot）: ボットが入力すると送信せず成功を返す
- 連投制限: 同一IPから10分間に5件まで
- 入力長の上限チェック、メールアドレス形式チェック
- CORS: lostoros.net / www / github.io / onrender.com 以外からは受け付けない
