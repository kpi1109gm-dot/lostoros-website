# LosToros サイト公開手順書

**2026-08-03 公開完了 → https://lostoros.net （HTTPS有効）**

対象ドメイン: lostoros.net（Wixで契約中 / メール chida@lostoros.net もWix管理）
公開先: GitHub Pages（無料）

進行状況に合わせてチェックを付けていく。

## STEP 1: GitHub Pages を有効にする（GitHubの画面操作）

1. https://github.com/kpi1109gm-dot/lostoros-website を開く
2. リポジトリが Private の場合は Public に変更する
   （Settings → General → 最下部 Danger Zone → Change visibility → Make public）
   ※無料プランのGitHub Pagesは公開リポジトリのみ対応
3. Settings → 左メニュー Pages
4. Build and deployment → Source: **Deploy from a branch**
5. Branch: **claude/lostoros-corporate-site-dzn7az** / フォルダ: **/ (root)** → Save
6. 1〜2分待ってページを再読み込みすると上部に
   「Your site is live at https://kpi1109gm-dot.github.io/lostoros-website/」と出る
7. そのURLを開いてサイトが表示されることを確認する

→ この時点で「仮URLでの公開」が完了。

## STEP 2: フォーム送信サービスの設定（任意だが推奨）

1. https://formspree.io/ で chida@lostoros.net として登録
2. New Form → フォーム名は任意（例: LosToros Contact）
3. 発行されたエンドポイントURL（https://formspree.io/f/xxxxxxxx）をClaudeに伝える
4. Claudeが js/main.js の FORM_ENDPOINT に設定して反映

※未設定の間は、送信ボタンでメールソフトが起動する暫定動作。

## STEP 3: 独自ドメイン lostoros.net を接続する

### 3-1. GitHub側

1. Settings → Pages → Custom domain に **lostoros.net** と入力 → Save
   （ブランチに CNAME ファイルが自動コミットされる）
2. DNS check が走るが、Wix側の設定が済むまでエラー表示でOK

### 3-2. Wix側（DNSレコードの編集）

Wixにログイン → 設定 → ドメイン → lostoros.net → DNSレコードを管理

**追加・変更するレコード:**

| 種類 | ホスト名 | 値 |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | kpi1109gm-dot.github.io |

- 既存の A レコード（Wixサイト向け）は削除または上記に置き換える
- 既存の CNAME (www → Wix系のホスト) も上記に置き換える

**絶対に触らないレコード:**

- MX レコード（メール配送用。消すと chida@lostoros.net が受信不能になる）
- TXT / SPF / DKIM 系（メールの認証用）

### 3-3. 反映確認とHTTPS

1. 数十分〜最大48時間でDNSが反映される
2. GitHub Settings → Pages で DNS check successful になったら
   **Enforce HTTPS** にチェックを入れる
3. https://lostoros.net で表示されれば完了

## STEP 4: 公開後の運用

- サイトの更新はこれまで通りClaudeに依頼 → ブランチにプッシュされると
  GitHub Pagesが自動で再デプロイ（数分で反映）
- Wixの有料サイトプランは解約可（ドメイン契約とメール契約は維持すること。
  メールがサイトプランに含まれていないか解約前に要確認）
- Wixで作りかけのサイトは非公開のまま放置でよい

## トラブル時

- 仮URLで404 → Pages設定のブランチ/フォルダ指定を再確認
- 独自ドメインで表示されない → https://dnschecker.org で lostoros.net の
  Aレコードが 185.199.108.153 系4つになっているか確認
- メールが届かなくなった → WixのDNSでMXレコードが残っているか確認（最優先で復旧）
