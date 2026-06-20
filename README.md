# 立体N目 PWA

GitHub Pagesで公開するためのPWA版です。

## 公開手順

1. GitHubで新しいリポジトリを作成します。例: `rittai-nmoku`
2. このフォルダ内のファイルをすべてアップロードします。
3. GitHubの `Settings` → `Pages` を開きます。
4. `Deploy from a branch` を選び、Branchを `main`、フォルダを `/root` にします。
5. 表示されたURLをスマホ/iPadで開きます。
6. Safari/Chromeの「ホーム画面に追加」でアプリ風に使えます。

## ファイル構成

- `index.html` : ゲーム本体
- `manifest.webmanifest` : PWA設定
- `sw.js` : オフライン用キャッシュ
- `icons/` : ホーム画面用アイコン
