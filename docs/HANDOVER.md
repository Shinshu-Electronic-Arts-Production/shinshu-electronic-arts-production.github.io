# 引き継ぎ（代替わり）

幹部が代替わりするときに、サイトと GitHub Org を次の代へ渡すための手順。
設計の背景は [DESIGN.md](DESIGN.md) を参照。

旧 HP（starfree.jp）はサービス終了で使えなくなり、unityroom の SEAP アカウントにも引き継ぎの問題がある。
同じことを繰り返さないよう、**「特定の 1 人しか触れないもの」を作らない** ことを最優先にする。

## 管理しているもの

| もの | 場所 | 誰が管理するか |
|---|---|---|
| GitHub Org | `Shinshu-Electronic-Arts-Production` | Org owner（2〜3 人） |
| 本体サイト | `shinshu-electronic-arts-production.github.io`（public） | Team `officers` |
| 作品登録の窓口 | `seap-submissions`（private） | Team `officers` |
| 作品リポジトリの雛形 | `game-template` | Team `officers` |
| 作品リポジトリ | `game-<name>` | 作者（Write）＋ `officers` |
| 窓口用 GitHub App | Org の Settings → GitHub Apps | Org owner |
| App の秘密鍵 | `seap-submissions` の Actions secret | Org owner |
| X アカウントの固定ポスト | 本体サイトの URL を貼る | X アカウントの管理者 |

※ 窓口・雛形・GitHub App は、まだ作っていなければ未作成のものもある。

## 代替わりチェックリスト

旧幹部がまだ動けるうちに、新旧が一緒に行う。

### Org owner

- [ ] 新幹部から **2〜3 人** を Org owner にする（Org → People → Role: Owner）
- [ ] 新 owner が実際に Org の Settings を開けることを確認する
- [ ] 旧 owner を Member に戻す（卒業後も残ってほしい人は Member のままでよい）
- [ ] owner が常に 2 人以上いる状態を保つ（1 人だけになる瞬間を作らない）

### Team `officers`

- [ ] 新幹部を `officers` に追加する
- [ ] 旧幹部を `officers` から外す
- [ ] CODEOWNERS は Team を指定しているので、ファイルの修正は不要。
      本体サイトの PR で `officers` にレビュー依頼が飛ぶことを確認する

### 窓口用 GitHub App

- [ ] 新 owner が App の設定画面（Org → Settings → GitHub Apps）を開けることを確認する
- [ ] 秘密鍵を新しく生成し、`seap-submissions` の Actions secret を更新する
- [ ] `seap-submissions` で試しに Issue を作り、本体サイトに PR が作られることを確認する（確認後、PR と Issue は閉じる）
- [ ] 古い秘密鍵を App の設定画面から削除する
      （旧幹部の手元に鍵が残っていても使えなくなる）

### 権限の点検

- [ ] 本体サイト main のブランチ保護が有効なまま（PR 必須、CODEOWNERS 承認 1、`check` 必須、force push 禁止）
- [ ] `seap-submissions` をメンバー全員が見られる（Base permissions Read 以上、または全員入りの Team に Read）
- [ ] Org を抜けた人・卒業した人を整理する（作品の作者として `authors/` に残すのは問題ない）

### Org の外のもの

- [ ] X アカウントのログイン情報が新幹部に渡っている
- [ ] X の固定ポストが本体サイトの URL のままになっている

### 最後に

- [ ] このファイルの「暫定運用」と「記録」を更新する

## 暫定運用

### レビューできる人が足りない間の PR

GitHub では PR の作成者が自分の PR を Approve できない。
`officers` でレビューできる人が実質 1 人の間は、次のようにする。

- **サイト開発の PR**（コード・設計書・ワークフロー）：作成者が自分で内容を確認したうえで、
  管理者としてルールをバイパスしてマージしてよい。PR に「レビュー者不在のためバイパス」と一言残す。
- **作品登録の PR**：バイパスしない。作者と別の `officers` が確認してからマージする。
  作品登録の受付を始める前に、承認できる `officers` を 2 人以上にする。

レビューできる人が 2 人以上になったら、この節を削除してバイパスをやめる。

## 定期的に見るもの

- GitHub Pages の目安：公開サイトはリポジトリごとに 1 GB、帯域は 100 GB / 月（ソフトリミット）。
  人気作が出て超えそうなら別途検討する。
- タグの許可リスト（`src/data/tags.yaml`）に似た意味のタグが増えていないか。

## 記録

| 年度 | Org owner | 引き継ぎ日 | 備考 |
|---|---|---|---|
| 2026 | | | |
