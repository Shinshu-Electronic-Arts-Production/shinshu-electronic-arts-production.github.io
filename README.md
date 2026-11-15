# SEAP 作品一覧サイト

SEAP（Shinshu Electronic Arts Production）の作品一覧サイトです。

- 公開 URL: https://shinshu-electronic-arts-production.github.io/
- 設計書: [docs/DESIGN.md](docs/DESIGN.md)

Astro で生成し、`main` への push で GitHub Pages にデプロイします。

## 開発

Node.js 24 以上が必要です。

```sh
npm ci
npm run dev     # http://localhost:4321（draft の作品も表示される）
npm run check   # 型・frontmatter の検証
npm run build   # 本番ビルド（dist/）
```

## 作品の追加

1. `src/content/games/<slug>/index.md` を作る（`slug` は英小文字・数字・ハイフン。URL になるので後から変えない）。
   書き方は [`sample-game`](src/content/games/sample-game/index.md) を参照。
2. 同じディレクトリにカバー画像（16:9 推奨）とスクリーンショットを置く。
3. 作者がまだいなければ `src/content/authors/<id>.yaml` を追加する。
4. 使いたいタグが [`src/data/tags.yaml`](src/data/tags.yaml) に無ければ追加する。
5. Pull Request を出す。`check` が通り、幹部の承認を得たらマージ → 公開。

`links`（`play` / `unityroom` / `download` / `source`）はどれか 1 つ以上あればよく、書いたものだけボタンが出ます。
