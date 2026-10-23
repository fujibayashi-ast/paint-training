# iPad から開発中のアプリを開く

筆圧・傾き・遅延・PWA の挙動は iPad の実機でしか確認できない。開発中のアプリを iPad から HTTPS で開く手順と、入力検証ページ（`#input-lab`）の使い方をまとめる。方法を mkcert にした理由は [architecture.md](architecture.md) の「開発環境」を参照。

## 前提

* Mac と iPad が同じ Wi-Fi にいる
* Mac に [mkcert](https://github.com/FiloSottile/mkcert) を入れる（`brew install mkcert`）
* 動作確認した環境: iPad Pro 11 インチ（第 1 世代）、iPadOS 26.7.1、Apple Pencil 第 2 世代

```mermaid
flowchart LR
  A[Mac: mkcert で<br/>証明書を作る] --> B[iPad: ルート CA を<br/>入れて信頼する]
  B --> C[Mac: dev:ipad で<br/>HTTPS 起動]
  C --> D[iPad の Safari で開く]
```

## 1. 証明書を作る（Mac、初回のみ）

```bash
# ローカル CA を作り、Mac の信頼済みに入れる（パスワードを聞かれる）
mkcert -install

# 開発サーバー用の証明書。ホスト名と LAN の IP を含める
mkdir -p .cert
mkcert -cert-file .cert/dev.pem -key-file .cert/dev-key.pem \
  "$(scutil --get LocalHostName).local" "$(ipconfig getifaddr en0)" localhost
```

* `.cert/` に両方のファイルがあるときだけ、`vite.config.ts` が開発サーバーとプレビューを HTTPS にする。無ければ HTTP のまま
* `.cert/` は `.gitignore` 済み。コミットしない
* LAN の IP は Wi-Fi が変わると変わる。IP で開く場合は、変わったら証明書を作り直す。`<名前>.local` で開けば作り直さなくてよい
* `ipconfig getifaddr en0` が空なら、Wi-Fi のインターフェース名が違う（`ifconfig` で確認する）

## 2. iPad にルート CA を入れる（初回のみ）

1. Mac で `open "$(mkcert -CAROOT)"` を実行し、`rootCA.pem` を AirDrop で iPad に送る
   * 同じフォルダの `rootCA-key.pem` は**送らない・共有しない**（これで誰でも「信頼される証明書」を作れてしまう）
2. iPad の「設定」に「プロファイルがダウンロードされました」と出るので、タップしてインストールする（「設定 > 一般 > VPN とデバイス管理」から）
3. 「設定 > 一般 > 情報 > 証明書信頼設定」で、mkcert のルート証明書を**オンにする**（これを忘れると、インストールしても信頼されない）

項目名は iPadOS のバージョンで変わることがある。

## 3. 開発サーバーを開く

```bash
bun run dev:ipad    # vite --host（同じネットワークの端末に公開する）
```

iPad の Safari で `https://<Mac の名前>.local:5173/` を開く。Mac の名前は `scutil --get LocalHostName` で分かる。
証明書の警告が出ずに開ければ成功。ファイアウォールの許可を聞かれたら許可する。

* 普段の `bun run dev` は localhost だけに公開する。iPad で確認するときだけ `dev:ipad` を使う
* `--host` は同じネットワークの他の端末からも見える。自宅など信頼できるネットワークで使う
* `<名前>.local` 以外のホスト名（独自のドメインなど）で開くと、Vite に `Blocked request` と拒否される。その場合は `vite.config.ts` の `allowedHosts` に追加する（IP アドレスは既定で通る）

## 4. 入力検証ページ

* `https://<名前>.local:5173/#input-lab` を開く（トップ画面のリンクからも入れる）
* 開発サーバーと `build:lab`（後述）にだけ含まれる。通常の `bun run build` には含まれない（開発専用。本番には出さない）

### 測り方

1. **指**でキャンバスをなぞる → 次に **Apple Pencil** でなぞる（接触して描く。傾けて、強弱をつける）
2. Apple Pencil を画面から浮かせて近づけ、動かす（ホバー）。青い輪が出れば、ホバーのイベントが届いている（Pencil のホバーは M2 以降の iPad Pro の機能。第 1 世代では出ない）
3. 「desynchronized: OFF」で十分に描いたら「計測をリセット」→「desynchronized: ON」に切り替えて、同じように描く。「環境」の「desynchronized（指定 / 実際）」で、ヒントが効いたか（`getContextAttributes()` の値）を確認する
4. 「結果をコピー」で JSON をコピーする（コピーできないときは、下に出るテキストを選択してコピーする）

### 数値の意味

| 項目 | 意味 |
| --- | --- |
| イベントの頻度 | `pointermove` が発火する頻度（Hz） |
| サンプルの頻度 | `getCoalescedEvents()` に含まれる点も数えた頻度。入力デバイスの実際のサンプリングに近い |
| coalesced / predicted の数 | 1 回の `pointermove` に含まれる点の数。「—」は API が無い、または取れていない |
| 遅延の下限の目安 | `pointermove` の `timeStamp` から、その線を描いた `requestAnimationFrame` の時刻までの差。**画面に表示されるまでの時間は含まない**ので、実際の書き味の遅延より小さい |
| ホバーの pointermove 数 | 接触していない（`buttons === 0`）`pointermove` の数。0 ならホバーのイベントが来ない |
| うち tilt が 0 以外 | ホバー中に傾きが取れたか |
| フレーム間隔 | `requestAnimationFrame` の間隔。60 Hz なら約 16.7 ms、ProMotion なら約 8.3 ms |

画面に表示されるまでを含めた遅延を知りたい場合は、iPhone などのスローモーション撮影で、ペン先と線の先端が離れる距離（フレーム数）を見る方法がある（任意）。

## 5. PWA の確認

`bun run dev` では Service Worker を登録しないため、PWA の確認はビルドして行う。

```bash
bun run build:lab      # 検証ページ入りの本番ビルド（vite build --mode lab）。出力は dist-lab/
bun run preview:ipad   # dist-lab/ を vite preview --host で配信（ポート 4173）
```

1. iPad の Safari で `https://<名前>.local:4173/#input-lab` を開く
2. 共有ボタン →「ホーム画面に追加」で追加し、**ホーム画面のアイコンから**起動する
3. 検証ページの「PWA」を確認する
   * 表示モードが `standalone` になる
   * Service Worker が登録・制御中になる（初回は一度開き直す必要がある）
   * 「IndexedDB に書く」→ 値が表示される。アプリを完全に終了して開き直したあとも残るか
   * 「persist() を実行」の結果と、`storage.persisted()`
4. 数日後にもう一度開いて、IndexedDB の値が残っているか確認する（保存の永続性）

注意:

* ホーム画面のアプリは Safari とは別の保存領域を使う。IndexedDB の確認は、ホーム画面のアプリの中で行う
* 通常の `bun run build` には検証ページは含まれない。`build:lab` は `dist/` ではなく `dist-lab/` に出力するので、`build` や `bun run preview` と混ざらない
* **`preview:ipad` で配信中に、`dist-lab/` を作り直さない**（`build:lab` をやり直すなら、先に `preview:ipad` を止める）。ホーム画面のアプリが保存している版とファイル名が変わると、アプリを開き直したときに更新が走り、真っ白になる可能性がある（原因は未検証）
* 真っ白になって直らないときは、アプリを削除し、Safari で開き直して「ホーム画面に追加」をやり直す（保存したデータは消える）

## 6. Mac から iPad を調べる（Web インスペクタ）

1. iPad: 「設定 > Safari > 詳細 > Web インスペクタ」をオン
2. Mac の Safari: 「設定 > 詳細 > Web 開発者向けの機能を表示」をオン
3. iPad を USB で Mac につなぎ、「このコンピュータを信頼」を選ぶ
4. Mac の Safari の「開発」メニュー → iPad の名前 → 開いているページ（ホーム画面から起動したアプリも出る）
5. コンソール、ネットワーク、ストレージ（IndexedDB、Service Worker）を調べられる

## 動作確認のチェックリスト

* [ ] 証明書が無い状態で `bun run dev` が HTTP で起動する
* [ ] 証明書がある状態で `bun run dev:ipad` → iPad の Safari で、警告なしに HTTPS で開ける
* [ ] 通常の `bun run build` の `dist/` に `input-lab` が含まれない（`grep -r input-lab dist/` が空）
* [ ] `build:lab` + `preview:ipad` でホーム画面に追加でき、standalone で起動する

## 注意

* ルート CA の秘密鍵（`rootCA-key.pem`）と `.cert/` のファイルは、他人に渡さない・コミットしない
* mkcert の証明書には有効期限がある。切れたら手順 1 の `mkcert -cert-file ...` をやり直す
* Playwright の WebKit は実機の iPad Safari とは別物で、Apple Pencil の入力も再現できない。実機での確認の代わりにはならない
