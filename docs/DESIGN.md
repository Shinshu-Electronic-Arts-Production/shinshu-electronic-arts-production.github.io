# seap-orgpage 設計書

SEAP（Shinshu Electronic Arts Production）の作品一覧サイト。
Twitter（X）の固定ポストから飛べる「作品の入口」を、GitHub Organization
[`Shinshu-Electronic-Arts-Production`](https://github.com/Shinshu-Electronic-Arts-Production) だけで運用する。

## 背景と要件

| 要件 | 備考 |
|---|---|
| X の固定ポストから作品一覧に飛べる、変わらない URL | 旧 HP（starfree.jp）はサービス終了 |
| unityroom 以外の作品・ダウンロード配布の作品も載せる | unityroom の SEAP アカウントは引き継ぎの問題もある |
| 作品ごとの紹介ページ（スクショ・紹介文・遊ぶ / DL ボタン） | |
| ジャンル別ページではなくタグ付け + タグで絞り込み、作者別ページ | ジャンルは数が多く固定の分類にしにくい |
| ダウンロード配布は GitHub Releases | 1 ファイル 2 GiB まで |
| ブラウザゲームは自前で配信。unityroom は埋め込まずリンク | unityroom の埋め込みはセーブが効かない場合がある |
| 掲載は SEAP メンバーのみ、レビューを通ったものだけ | |
| Git が分からない人でも出展できる | 新入生・小規模な作品の作者 |
| 無料で、代替わりしても引き継げる | 外部アカウントを増やさない |

## 決定事項

| 項目 | 決定 |
|---|---|
| サイト生成 | Astro + Content Collections（作品 = Markdown 1 ファイル、frontmatter を zod で検証） |
| ホスティング | GitHub Pages（Org サイト）。ビルド・デプロイは GitHub Actions |
| URL | `https://shinshu-electronic-arts-production.github.io/`（独自ドメインは当面使わない） |
| ブラウザゲーム | 作品ごとのリポジトリの Project Pages（`…github.io/<repo>/`）。ビルドは git に入れず Release の zip から Actions でデプロイ |
| ダウンロード配布 | 作品ごとのリポジトリの Releases |
| 分類 | タグ（許可リスト制）+ 作者。ジャンル別ページは作らない |
| 登録方法 | ① PR（Git が分かる人）② private の窓口リポジトリ `seap-submissions` の Issue Form → Actions が本体サイトに PR を自動生成（Git が分からない人） |
| 掲載可否 | main へのマージ = 公開。CODEOWNERS（幹部 Team）の承認必須 |
| Discord 連携 | **後回し**（[将来拡張](#将来拡張-discord-から登録)）。discord_github_authbot の紐付けを使う想定 |
| Cloudflare / Vercel | 使わない（管理アカウントが増える。Cloudflare Pages は 1 ファイル 25 MiB 上限で Unity の `.data` が載らないことがある） |

## 全体構成

```
GitHub Org: Shinshu-Electronic-Arts-Production
├─ shinshu-electronic-arts-production.github.io   … 本体サイト（このリポジトリ。ローカル名 seap-orgpage）
│    src/content/games/<slug>/index.md            ← 1 作品 = 1 ディレクトリ
│    push to main → Actions: astro build → deploy-pages
│
├─ seap-submissions（private）                     … 作品登録の窓口。Issue Form のみ置く
│    Issue 作成 → Actions → 本体サイトに PR
│
├─ game-template                                  … 作品リポジトリの雛形（template repository）
│    .github/workflows/deploy-web.yml             ← Release の web.zip を Pages へ
│
└─ game-<name>（作品ごと、必要な作品だけ）
     Releases: web.zip（ブラウザ版） / <name>-windows.zip 等（DL 配布）
     Pages:    …github.io/game-<name>/（web.zip を展開したもの）
```

- 本体サイトにはゲームの実体を置かない。リンク（と自前配信分の埋め込み）だけを持つ。
- Pages のサイズ上限（公開サイト 1 GB）はリポジトリごとなので、作品が増えても本体サイトは膨らまない。
- unityroom にしか無い作品は作品リポジトリを作らず、本体サイトの Markdown に unityroom の URL を書くだけでよい。

## 本体サイト

### ページ

| パス | 内容 |
|---|---|
| `/` | サークル紹介の一文、新着作品、「作品一覧へ」。X の固定ポストからはここに飛ばす |
| `/games/` | 全作品のカード一覧 + タグ絞り込み（複数選択・AND）。状態は `?tags=a,b` に持たせて URL で共有できるようにする |
| `/games/<slug>/` | 作品ページ：カバー、スクショ、紹介文（Markdown 本文）、遊ぶ / DL / unityroom ボタン、タグ、作者 |
| `/tags/<tag>/` | タグ別一覧（静的生成。JS 無しでも辿れる・検索エンジン向け） |
| `/authors/<id>/` | 作者（個人 or チーム）別一覧 |
| `/about/` | SEAP について、連絡先、作品の登録方法へのリンク |

絞り込みは `/games/` に全作品のカードを静的に出しておき、数十行のクライアント JS で表示・非表示を切り替える
（作品数が数百を超えるまでは検索インデックス等は不要）。

### コンテンツ構成

```
src/content/
├─ games/
│  └─ <slug>/                # slug = 英小文字・数字・ハイフン。URL になるので後から変えない
│     ├─ index.md
│     ├─ cover.png           # 16:9 推奨。カードと OGP に使う
│     └─ ss1.png …
├─ authors/
│  └─ <id>.yaml              # 個人・チーム共通
└─ (src/data/tags.yaml)      # 使えるタグの許可リスト
```

#### `games/<slug>/index.md`

```yaml
---
title: ○○○○
summary: 一行紹介（カードに出す。60 文字程度）
authors: [nananami]     # authors コレクションの id
tags: [2Dアクション, 弾幕]          # tags.yaml にあるものだけ
releasedAt: 2026-10-31
event: 銀嶺祭2026                  # 任意。出展イベント
platforms: [web, windows]          # web | windows | mac | linux | android
cover: ./cover.png
screenshots: [./ss1.png, ./ss2.png]
links:                             # 各項目は任意。あるものだけ書く（1 つ以上必須）
  play: https://shinshu-electronic-arts-production.github.io/game-xxx/   # 自前配信のブラウザ版
  unityroom: https://unityroom.com/games/xxx
  download: https://github.com/Shinshu-Electronic-Arts-Production/game-xxx/releases/latest
  source: https://github.com/Shinshu-Electronic-Arts-Production/game-xxx  # ソースを公開する場合のみ
embed: true                        # 任意。play を作品ページに iframe で埋め込むか
draft: false
---

本文（遊び方、操作方法、クレジットなど）を Markdown で書く。
```

- `links` の各項目（`play` / `unityroom` / `download` / `source`）はすべて任意で、**どれか 1 つ以上あればよい**（zod の `refine` で検証）。
  書かなかった項目のボタンは作品ページに出ない。例：

  ```yaml
  # ダウンロード配布だけ（ソース非公開）
  links:
    download: https://github.com/Shinshu-Electronic-Arts-Production/game-xxx/releases/latest
  ```

  ```yaml
  # unityroom で公開しているだけ
  links:
    unityroom: https://unityroom.com/games/xxx
  ```

- ソースを公開したくない作品は `source` を書かない。作品リポジトリを private にしたい場合は、
  Releases（DL 配布）は private でも置けるが一般の人がダウンロードできなくなるため、
  配布用に public のリポジトリを分ける（ソース用 private と配布・Pages 用 public）。
- `download` は Release ページ（`/releases/latest`）を指すのを基本にする。
  単一ファイルに直接飛ばす場合は `/releases/latest/download/<file>` を使い、バージョンが上がってもリンクを直さずに済むようにする。
- `embed: true` は `play`（自前配信）にだけ効く。unityroom は埋め込まない。

#### `authors/<id>.yaml`

```yaml
name: なななみ
kind: person            # person | team
github: <login>         # 任意
x: ...                  # 任意
members: [a, b]         # kind: team のときのみ。個人 id
```

#### `src/data/tags.yaml`

```yaml
- 2Dアクション
- 3Dアクション
- 弾幕シューティング
- ローグライク
- パズル
- オンライン対戦
- …
```

- 表記揺れ（「STG」「シューティング」）を防ぐため許可リスト制にし、zod の enum をこのファイルから作る。
- 新しいタグは作品の PR と同じ PR で `tags.yaml` に足せばよい（レビューで揺れを止める）。

### ビルドとデプロイ

- `.github/workflows/deploy.yml`：`push: main` で `astro build` → `actions/upload-pages-artifact` → `actions/deploy-pages`。
- `.github/workflows/check.yml`：PR で `astro check` + `astro build`。frontmatter の不備・存在しないタグ / 作者 / 画像はここで落ちる。
  ブランチ保護の required check にする。
- 画像は Astro の `<Image>` で最適化する（元画像が大きくても配信は軽くなる）。

## 作品リポジトリ（game-template）

ブラウザ版を自前で配信する作品と、DL 配布する作品だけが作る。

### ブラウザ版の配信

ビルド成果物を git にコミットしない。

1. 作者は GitHub の Web 画面で Release を作り、`web.zip`（`index.html` が zip 直下にあるもの）を添付して公開する。
2. `release: published` で `deploy-web.yml` が動き、`web.zip` を取得 → 展開 → `upload-pages-artifact` → `deploy-pages`。

こうすると Git の 100 MB / ファイル制限、LFS のファイルが Pages で配信されない問題、リポジトリの肥大化をすべて避けられる。
Release asset は 1 ファイル 2 GiB までだが、Pages の公開サイトは 1 GB までなので、展開後 1 GB を超えるものはブラウザ版にしない。

### Unity WebGL の注意（README に必ず書く）

GitHub Pages では `Content-Encoding` ヘッダーを設定できない。Player Settings → Publishing Settings で次のどちらかにする。

- Compression Format: **Gzip** + **Decompression Fallback: ON**（推奨）
- Compression Format: **Disabled**

Brotli + Decompression Fallback は展開が遅いので避ける。

### 同一オリジンについて

`…github.io/` 配下はすべて同じオリジンになる。

- 利点：本体サイトから iframe で埋め込んでもサードパーティ扱いにならず、IndexedDB / localStorage がブロックされにくい（unityroom 埋め込みのセーブ問題が起きない）。
- 注意：localStorage は作品間で共有される。素の JS で `localStorage` を使う作品はキーに作品名の接頭辞を付ける
  （Unity の PlayerPrefs / `persistentDataPath` は URL パスごとに分かれるので通常は問題ない）。
- 本体サイトは静的でログインや Cookie を持たないため、作品の JS が同一オリジンで動くことによる実害は小さい。
  それでも作品リポジトリは Org メンバーしか作れないようにしておく。

### DL 配布

- Release に `<name>-windows.zip` 等を添付する。命名は `<name>-<platform>.zip` に揃える。
- 本体サイトの `links.download` には Release ページの URL を書く。

## 登録フロー

### ① PR（Git が分かる人）

1. 本体サイトのリポジトリにブランチを切り、`src/content/games/<slug>/` を追加（必要なら `authors/` に自分を追加）。
2. PR を出す。`check.yml` が通ること。
3. 幹部（CODEOWNERS）が内容を確認して承認・マージ → 数分で公開。

### ② Issue Form（Git が分からない人）

public リポジトリの Issue は GitHub アカウントがあれば誰でも作れ、作成者をメンバーに限定する設定は無い
（Interaction limits は最長 6 か月で切れるため恒久策にならない）。
そこで登録の窓口を **private リポジトリ `seap-submissions`** に分ける。
private リポジトリは Org メンバーにしか見えないので、Issue を作れた時点でメンバーであることが保証される。

```
seap-submissions（private）
  .github/ISSUE_TEMPLATE/add-game.yml
  .github/workflows/issue-to-pr.yml
        │ GitHub App の installation token
        ▼
shinshu-electronic-arts-production.github.io（public）に PR → ① と同じレビュー
```

1. メンバーは `seap-submissions` で「作品を登録する」Issue テンプレートを開く。
   項目：タイトル、slug、一行紹介、作者、タグ（チェックボックス）、各種 URL（すべて任意）、本文、カバー画像・スクショ（Issue に貼り付け）。
2. Actions（`issue-to-pr.yml`、`issues: opened` / `edited`）が Issue の本文を解析して Markdown を生成し、
   貼られた画像をダウンロードして本体サイトのリポジトリにブランチを作ってコミットし、PR を作る。
   - PR 本文には登録者（`@login`）と `Closes Shinshu-Electronic-Arts-Production/seap-submissions#<n>` を書き、マージで Issue を閉じる。
     PR は public なので、Issue の内容のうち掲載しないもの（連絡事項など）は PR に転記しない。
   - Issue が編集されたら同じブランチを更新する（PR は作り直さない）。
   - 結果（PR のリンク、または検証エラーの内容）を Issue にコメントする。
3. 以降は ① と同じレビュー。修正が必要なら幹部が PR を直接直すか、Issue でやり取りする。

本体サイト（public）には作品登録用の Issue テンプレートを置かない。本体サイトの Issues はサイトの不具合報告などに使うか、無効にする。

#### GitHub App

窓口用に GitHub App を 1 つ作る（discord_github_authbot の App とは別。あちらは Members 権限のみという設計を保つ）。

| インストール先 | 権限 |
|---|---|
| 本体サイトのリポジトリ | Contents: Read & write、Pull requests: Read & write |
| `seap-submissions` | Issues: Read & write（コメント用） |

- `GITHUB_TOKEN` は自分のリポジトリにしか書けず、また `GITHUB_TOKEN` で作った PR では本体サイトの `check.yml` が起動しない。
  そのため PR 作成は `actions/create-github-app-token` で取得した installation token で行う。
- App の秘密鍵は `seap-submissions` の Actions secret に置く。

#### 実装上の注意

窓口を private にしてもメンバーの入力ミスやアカウント乗っ取りはあり得るので、入力は信用しない。

- **Issue の内容を `run:` に直接埋め込まない。** `${{ github.event.issue.body }}` を `run:` 内に書くとシェルに注入される。
  本文・タイトルは `env:` 経由で渡し、解析はスクリプト（Node 等）内で行う。
- **slug は `^[a-z0-9]+(-[a-z0-9]+)*$` のみ許可**し、既存の slug と重複したら新規登録としては受け付けない（`../` 等でのパス操作を防ぐ）。
- **画像の取得元を制限する**（GitHub の添付ファイルのドメインのみ）。種類（PNG / JPEG / WebP / GIF）とサイズ上限も確認する。
- **private リポジトリの添付画像**はログイン無しでは取得できない URL になる。
  API で Issue を `Accept: application/vnd.github.full+json` で取得すると `body_html` に期限付きの直接 URL が入るので、
  そこから取得する想定（**要検証**）。
- 生成した Markdown は本体サイトの zod スキーマで検証され、不正なものは `check.yml` で落ちる（最後の防御線）。

#### 前提となる Org 設定

- Org の **Base permissions を Read 以上**にする（None だとメンバーにも private リポジトリが見えない）。
  Read にすると Org 内の他の private リポジトリもメンバー全員から読めるようになる点に注意。
  それを避けたい場合は Base permissions は None のままにし、Team `members`（全メンバー）に `seap-submissions` の Read を付ける。

ブラウザ版・DL 版がある場合、作品リポジトリは幹部が `game-template` から作って作者に Release の作り方を案内する
（Release のアップロードは Web 画面のドラッグ＆ドロップだけで済む）。

## 権限と運用

| 対象 | 設定 |
|---|---|
| Org owner | **2〜3 人**。代替わりで消えないようにする（引き継ぎ問題の根本対策） |
| Team `officers` | 幹部。本体サイトの CODEOWNERS、作品リポジトリの作成権限 |
| 本体サイト main | ブランチ保護：PR 必須、CODEOWNERS 承認 1、`check` 必須、force push 禁止 |
| リポジトリ作成 | Org 設定で members のリポジトリ作成を許可するかは要相談（許可しないなら幹部が作る） |
| 公開範囲 | Free プランの Org は public リポジトリでしか Pages を使えないため、本体サイト・作品リポジトリは public。窓口の `seap-submissions` のみ private |
| `seap-submissions` の閲覧 | メンバー全員が Issue を作れるようにする（Base permissions Read 以上、または全員 Team に Read） |

- 代替わり時のチェックリスト（owner の追加、`officers` の入れ替え、GitHub App の管理者と秘密鍵の更新）を `docs/HANDOVER.md` に置く。
- GitHub Pages の目安：公開サイト 1 GB、帯域 100 GB / 月（ソフトリミット）。超えそうな人気作が出たら別途検討する。

## 移行

1. unityroom の SEAP アカウント（`unityroom.com/users/vmj8usw1xzpcg60bhekn`）に載っている作品を本体サイトに登録する
   （`links.unityroom` のみ。カバーは各作品ページのスクショ）。
2. サイト公開後、X の固定ポストを本体サイトの URL に差し替える。

## 将来拡張: Discord から登録

discord_github_authbot は Discord アカウントと GitHub アカウントを 1:1 で紐付けている。
これを使えば「Discord でコマンドを打った人 = 本人確認済みの SEAP メンバー」として、Discord から登録できる。

```
/publish cover:<画像> build:<zip 任意>
  → 紐付け済みか確認（未登録なら /join を案内）
  → モーダル（タイトル / slug / タグ / 紹介文 / URL）
  → deferred 応答で 3 秒制限を回避し、waitUntil で:
       ブランチ作成 → index.md・画像をコミット → PR 作成（本文に Discord @A ↔ GitHub @B）
       ログチャンネルに PR リンク、本人に「レビュー待ち」
  → マージ → デプロイ完了をワークフローから Discord webhook で通知
```

- **authbot とは別の Worker・別の GitHub App にする。** authbot は「GitHub App の権限は Members のみ」という設計なので、
  Contents / Pull requests（作品リポジトリを作るなら Administration）を足さない。
  紐付けは authbot の D1 を読み取り専用でバインドするか、authbot に Service Binding で照会口を 1 つ足す。
- Discord の添付は無料ユーザーで 10 MB まで。小さい zip だけ Bot が Release に上げ、大きいものは作品リポジトリの
  Release アップロード画面へのリンクを返す。
- 既存作品の修正（`/publish edit slug:`）は、その作品の `authors` に本人の GitHub が入っている場合のみ許可する。
- Issue Form（②）は Discord 連携ができた後も残す（Discord を使わない人・障害時の代替）。

## 未決事項

- サイト名・トップのデザイン
- タグの初期リスト
- 作品リポジトリの命名（`game-<name>` で良いか）と、members にリポジトリ作成を許可するか
- 作者ページに載せる情報の範囲（本名・学年は載せない前提）
- `seap-submissions` を見せる方法（Base permissions を Read にするか、全員 Team を作るか）
- OGP 画像（作品のカバーをそのまま使う想定）
