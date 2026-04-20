# NANAIRO FAMILY TOOLS（ツールダッシュボード）

Vite + React + TypeScript + Tailwind CSS v4。一覧は **`public/apps.csv`** のみ編集して再デプロイすれば更新できます。

## ローカル起動

```bash
npm install
npm run dev
```

## Vercel（初回デプロイ）

1. このフォルダを GitHub などにプッシュし、Vercel で **Root Directory** を `nanairo-family-tools` に指定してインポート（リポジトリのルートがこのフォルダなら Root Directory は空でよい）
2. Framework Preset: **Vite**
3. 環境変数（任意）: `VITE_OWNER_NAME`
4. **Deploy** を実行し、ビルドが成功するまで待つ

## 配布用URLの作り方

配布用URLとは、購入者や社内に共有する **本番の https リンク**（Vercel が発行する `*.vercel.app`、または独自ドメイン）のことです。

1. [Vercel](https://vercel.com) にログインし、当該プロジェクトを開く。
2. 画面上部の **Visit**（または **Domains**）から、**Production** に割り当てられた URL を確認する。形式は通常 `https://<プロジェクト名>.vercel.app` です。
3. そのURLをコピーし、商品説明・PDF・メール・QRコードなどに貼り付ける。これがそのまま配布用URLになります。
4. デプロイをやり直した場合も、同じ Production URL のまま中身だけ更新されることが多いです（ブランチやプレビュー設定によるが、既定の main 連携ならその通り）。
5. **独自ドメイン**を使う場合: プロジェクトの **Settings → Domains** でドメインを追加し、表示された DNS 指示に従ってレジストラ側を設定する。反映後は `https://tools.example.com` のようなURLを配布用にできる。

ローカルだけの `http://localhost:5173` はインターネット上から開けないため、配布用には使いません。

## apps.csv

先頭行はヘッダー固定です。

| 列 | 必須 | 説明 |
|----|------|------|
| order | 任意 | 数値が小さいほど上に表示。空なら行順 |
| name | 必須 | 表示名 |
| url | 必須 | リンク先（`https://` 推奨） |
| category | 任意 | カテゴリ（フィルタ用） |

Excel で編集する場合は UTF-8（BOM 可）で保存してください。

## 七色アイコン（カード）

一覧の **並び順**（検索・ページ送り後の表示順）で、赤→橙→黄→緑→青→藍→紫が循環します。各カードは色付きの角丸アイコンに **アプリ名の先頭1文字** を表示します。色定義は `src/lib/nanairoPalette.ts` です。

## ホーム画面アイコン（PWA）

**ショートカットでも設定可能です。** 灰色の一文字アイコンは、`apple-touch-icon` や Web App Manifest の `icons` が未設定／キャッシュのときにブラウザが自動生成することがあります。

差し替え先:

- `public/apple-touch-icon.png`（推奨 180×180、PNG）
- `public/icon-192.png` / `public/icon-512.png`（`site.webmanifest` から参照）
- タブ用: `public/favicon.svg`（七色ストライプ）

**七色ストライプの PNG を再生成（Windows）:** `npm run icons`（`scripts/gen-nanairo-png.ps1`）

差し替え後は端末側で一度ショートカットを削除してから「ホーム画面に追加」し直すと反映されやすいです。
