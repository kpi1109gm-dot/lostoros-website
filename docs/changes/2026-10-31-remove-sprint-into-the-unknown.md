# 「SPRINT INTO THE UNKNOWN」をサイトから削除

日付: 2026-10-31 / 実装: Claude Code / 依頼者: 池田海

## 経緯

Instagramのプロフィール文を作る中で、池田さんから「SPRINT INTO THE UNKNOWN. はいらない。HPからも消して欲しい」と指示があった。

**今後、このタグラインはサイト・SNSで使わない。**

## 変更内容

| 場所 | 変更前 | 変更後 |
|---|---|---|
| トップ ヒーロー（`.hero-sub`） | SPRINT INTO THE UNKNOWN. | 行ごと削除（「道なき道を切り拓き、最速へ突き進む。」のみ） |
| トップ マーキー | LOSTOROS TRACK TEAM — EL TORO BRAVO — SPRINT INTO THE UNKNOWN —（×2） | LOSTOROS TRACK TEAM — EL TORO BRAVO —（×3。帯の長さを保つため繰り返しを増やした） |
| 8ページのフッター右下 | LosToros Track Team ■ Sprint Into The Unknown | LosToros Track Team |
| `css/style.css` | `.hero-sub` のスタイル（PC・スマホ） | 使われなくなったため削除 |

- シェア画像（`ogp.jpg`・`ogp-supporter.jpg`）にはこの文言は入っていないことを目視で確認済み
- 削除後、リポジトリ内に「unknown」は残っていない（大文字小文字を区別せず検索）

## 確認

PC（1440px）とスマホ（390px）で、ヒーロー・マーキー・フッターの表示を確認した。
