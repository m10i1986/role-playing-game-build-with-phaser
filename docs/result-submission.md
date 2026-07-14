# ゲーム結果の送信仕様

ゲーム結果の送信には2種類の方式があります。シナリオ（Timeline DSL）側でイベントを配置することで、任意のタイミングで明示的に送信をトリガーします。

| 方式 | イベント | 送信内容 | 主な宛先 |
| --- | --- | --- | --- |
| [PhaserWorks向け送信](#phaserworks向け送信) | `EventTypeEnum.SendGameResult` | 回答履歴・プレイ時間・`result`(成否/スコア)の全データ | 自社サーバー(PhaserWorks) |
| [Power Automate向け送信](#power-automate向け送信) | `EventTypeEnum.SendGameResultWithPowerAutomate` | `userPrincipalName`・成否・スコア・プレイ時間 | Power AutomateのHTTP Webhookトリガー |

いずれの方式も、シナリオ内でイベントを配置した箇所で即座に送信されます（例: エンディング遷移の直前）。

## PhaserWorks向け送信

### 起動URL

```
https://example.com/game/?resultUrl=<結果送信先URL(URLエンコード)>&token=<セッションを識別するトークン>&publicKey=<サーバーの公開鍵(Base64, URLエンコード)>
```

| パラメータ | 必須 | 説明 |
| --- | --- | --- |
| `resultUrl` | ○ | 結果をPOST送信する送信先URL。URLエンコードして指定する。未指定の場合は送信自体を行わない。 |
| `token` | 任意 | セッションやプレイヤーを識別するためのトークン。送信データにそのまま含まれる。 |
| `publicKey` | 任意 | サーバーのECDH(P-256)公開鍵(raw形式・非圧縮ポイント65バイトをBase64エンコードしたもの)をURLエンコードして指定する。指定した場合、送信データは[暗号化](#暗号化)される。未指定の場合は平文のJSONを送信する。 |

### サンプルURL

```
https://example.com/game/?resultUrl=https%3A%2F%2Fapi.example.com%2Fgame-results&token=abc123&publicKey=BPqG...(Base64・URLエンコード済み)
```

ローカル開発サーバーの例:

```
http://localhost:5173/?resultUrl=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fgame-results&token=test-session-001&publicKey=BPqG...
```

### 送信タイミング

シナリオ（Timeline DSL）内で `SendGameResult` イベントを配置したタイミングで送信します。

```ts
{ event: EventTypeEnum.SendGameResult },
```

`resultUrl` が指定されていない場合は何も送信されません。

### リクエスト仕様

- メソッド: `POST`
- Content-Type: `application/json`
- 送信先: 起動時に指定した `resultUrl`

#### ボディ（`publicKey` 未指定時・平文）

```json
{
  "token": "abc123",
  "playTimeMs": 123456,
  "answers": [
    {
      "type": "choice",
      "key": "unit01",
      "value": "unit01へ",
      "elapsedMs": 5230
    },
    {
      "type": "multi_choice",
      "key": "multi_choice_correct",
      "value": ["バナナ", "リンゴ"],
      "elapsedMs": 21870
    },
    {
      "type": "input_number",
      "key": "calc_answer",
      "value": 2,
      "elapsedMs": 42000
    }
  ],
  "result": {
    "success": true,
    "score": 100
  }
}
```

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `token` | `string \| undefined` | 起動URLで指定した `token`。未指定の場合は `undefined`（JSON上は省略）。 |
| `playTimeMs` | `number` | ゲーム開始（起動時）からエンディング到達までの経過時間(ミリ秒)。 |
| `answers` | `AnswerRecord[]` | プレイ中に発生した回答の時系列履歴。 |
| `result` | `{ success: boolean; score: number \| null }` | シナリオ側で計算されたゲーム結果。[結果(result)の設定方法](#結果resultの設定方法)を参照。 |

### 結果(result)の設定方法

`result` はシナリオ（Timeline DSL）側で `SetVariable` イベントを使って計算・設定します。エンディングへ遷移する前に、以下の変数へ値を設定してください。

| 変数名 | 型 | 説明 |
| --- | --- | --- |
| `result_success` | `boolean` | ゲーム結果の成否。送信JSONでは `result.success` になります。`false` 以外の値・未設定の場合は `true` として送信されます。 |
| `result_score` | `number` | ゲーム結果のスコア。送信JSONでは `result.score` になります。数値以外・未設定の場合は `null` として送信されます。 |

```ts
// 成功例: シナリオ側で正誤判定や合計スコアをもとに result_success/result_score を設定する
{ event: EventTypeEnum.SetVariable, key: "result_success", value: true },
{ event: EventTypeEnum.SetVariable, key: "result_score", value: 100 },

// 失敗例: result_scoreを設定しない場合、送信されるresult.scoreはnullになる
{ event: EventTypeEnum.SetVariable, key: "result_success", value: false },
```

どちらの変数も設定しない場合、標準値として次の内容が送信されます。

```json
"result": { "success": true, "score": null }
```

### `answers[]`（回答履歴）

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `type` | `"choice" \| "multi_choice" \| "input_number"` | 回答の種類。 |
| `key` | `string` | 回答対象を識別するキー。`choice`/`multi_choice` は遷移先のタイムラインID、`input_number` は入力値を保存する変数名。 |
| `value` | `string \| number \| boolean \| (string \| number \| boolean)[]` | 回答内容。`choice` は選択したテキスト、`multi_choice` は選択した全テキストの配列、`input_number` は入力された数値。 |
| `elapsedMs` | `number` | ゲーム開始からその回答が行われるまでの経過時間(ミリ秒)。 |

### 同一keyへの複数回回答（再挑戦・途中経過）について

`recordAnswer()` は呼ばれるたびに `answers` へ追記するのみで、同じ `key` の既存レコードを上書き・削除することはありません。そのため、不正解による再挑戦や数値入力のやり直しなど、同じ `key` に対して複数回回答した場合は、**すべての試行が`elapsedMs`付きで時系列に残ります**。

例: `multi_choice` で1回目に不正解、再挑戦して2回目に正解した場合

```json
"answers": [
  { "type": "multi_choice", "key": "multi_choice_incorrect", "value": ["植物油"], "elapsedMs": 15000 },
  { "type": "multi_choice", "key": "multi_choice_correct", "value": ["バナナ", "リンゴ"], "elapsedMs": 32000 }
]
```

最終的な回答のみを集計したい場合は、サーバー側で同じ `type`/`key` グループのうち `elapsedMs` が最大のもの（＝最後に記録されたもの）を採用するなど、送信データ側ではなく集計側で絞り込む必要があります。

## Power Automate向け送信

Power AutomateのHTTP Webhookトリガーなど、`result`/`score`など最小限の情報のみを受け取る宛先へ直接POSTするための方式です。暗号化は行いません。

### 起動URL

```
https://example.com/game/?userPrincipalName=<プレイヤーを識別するUPN(URLエンコード)>
```

| パラメータ | 必須 | 説明 |
| --- | --- | --- |
| `userPrincipalName` | ○ | プレイヤーを識別するUser Principal Name(UPN)。未指定の場合、送信は中断されコンソールにエラーが出力される。 |

### 送信タイミング

シナリオ（Timeline DSL）内で `SendGameResultWithPowerAutomate` イベントを配置したタイミングで送信します。`url` には送信先のPower Automate HTTP Webhookトリガーの実行URLを指定します。

```ts
{ event: EventTypeEnum.SendGameResultWithPowerAutomate, url: "https://prod-00.japaneast.logic.azure.com/..." },
```

### リクエスト仕様

- メソッド: `POST`
- Content-Type: `application/json`
- 送信先: イベントで指定した `url`

```json
{
  "userPrincipalName": "user@example.com",
  "success": true,
  "score": 100,
  "playTimeMs": 123456
}
```

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `userPrincipalName` | `string` | 起動URLで指定した `userPrincipalName`。 |
| `success` | `boolean` | ゲーム結果の成否。[結果(result)の設定方法](#結果resultの設定方法)を参照。 |
| `score` | `number \| null` | ゲーム結果のスコア。[結果(result)の設定方法](#結果resultの設定方法)を参照。 |
| `playTimeMs` | `number` | ゲーム開始（起動時）からイベント実行までの経過時間(ミリ秒)。 |

### 暗号化

`publicKey` パラメータが指定されている場合、送信ボディは **ECIES（ECDH P-256 + AES-256-GCM）** 方式で暗号化されます。ブラウザ標準の WebCrypto API (`crypto.subtle`) のみで実装されており、追加ライブラリは不要です。

#### 暗号化の流れ

1. 起動URLで受け取った `publicKey`（サーバーのECDH公開鍵、raw形式・Base64）を `crypto.subtle.importKey` で読み込む。
2. 送信のたびに一時的なECDH鍵ペア（Ephemeral Key Pair）を新規生成する。
3. サーバー公開鍵と一時秘密鍵から `crypto.subtle.deriveKey` でAES-GCM共有鍵を導出する（ECDH鍵交換）。
4. ランダムな12バイトのIVを生成し、AES-256-GCMで送信ボディ（JSON）を暗号化する。
5. 一時鍵ペアの公開鍵・IV・暗号文をBase64エンコードしてJSONとしてPOSTする。

一時鍵ペアは送信のたびに使い捨てるため、サーバー側は都度受け取った `ephemeralPublicKey` と自身の秘密鍵からECDHで同じ共有鍵を導出し、AES-GCMで復号する。

#### ボディ（`publicKey` 指定時・暗号化）

```json
{
  "ephemeralPublicKey": "BPqG...(Base64、raw形式・非圧縮ポイント65バイト)",
  "iv": "3F2a...(Base64、12バイト)",
  "ciphertext": "9dQx...(Base64、AES-256-GCM暗号文。復号すると平文ボディのJSONが得られる)"
}
```

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `ephemeralPublicKey` | `string` | 送信のたびに生成される一時ECDH公開鍵(raw形式)をBase64エンコードしたもの。 |
| `iv` | `string` | AES-GCMの初期化ベクトル(12バイト)をBase64エンコードしたもの。 |
| `ciphertext` | `string` | 暗号化された本文。復号すると `token`/`playTimeMs`/`answers` を含む平文ボディと同じJSONになる。AES-GCMの認証タグはciphertextの末尾に含まれる。 |

実装: [src/classes/result_encryption.ts](../src/classes/result_encryption.ts)

## 実装箇所

- [src/classes/game_session.ts](../src/classes/game_session.ts) — URLパラメータの読み取り、回答履歴の保持、結果送信処理(`sendGameResultWithPhaserWorks`/`sendGameResultWithPowerAutomate`)。`result_success`/`result_score` 変数から `result` を組み立てる処理も含む。
- [src/classes/variable_store.ts](../src/classes/variable_store.ts) — シナリオの `SetVariable` イベントで設定した変数を保持する変数ストア。
- [src/classes/result_encryption.ts](../src/classes/result_encryption.ts) — `publicKey` を使ったECIES(ECDH + AES-GCM)暗号化処理。PhaserWorks向け送信でのみ使用。
- [src/index.ts](../src/index.ts) — 起動時に `initGameSession()` を呼び出し、セッションを初期化。
- [src/classes/timeline_player.ts](../src/classes/timeline_player.ts) — 選択肢・数値入力のたびに `recordAnswer()` を呼び出して回答を記録し、`SendGameResult`/`SendGameResultWithPowerAutomate` イベント実行時にそれぞれの送信関数を呼び出す。

## 注意事項

- 送信は `fetch` によるベストエフォートで行われ、失敗した場合はコンソールにエラーを出力するのみで、リトライは行いません。
- `publicKey` が未指定の場合、通信内容は暗号化されません。機密性の高い情報を扱う場合は `publicKey` を指定するか、HTTPS通信を使用し、必要に応じてサーバー側で認可・改ざん検知の仕組みを用意してください。
- WebCrypto APIはセキュアコンテキスト（HTTPSまたはlocalhost）でのみ利用可能です。HTTP環境（localhost以外）では `crypto.subtle` が利用できず暗号化に失敗するため、その場合は `publicKey` を指定しないでください。
- `publicKey` はURLクエリパラメータとして平文で渡されるため、URL自体の漏洩（ブラウザ履歴・リファラ・アクセスログ等）には注意してください。公開鍵自体の漏洩は暗号方式の安全性を損ないませんが、鍵の配布経路が信頼できることを別途担保する必要があります（例: HTTPSでの起動URL発行、鍵のローテーション）。
- Power Automate向け送信は暗号化を行わないため、機密性の高い情報を含めないでください。また `userPrincipalName` はURLクエリパラメータとして平文で渡されるため、PhaserWorks向け送信と同様にURL自体の漏洩に注意してください。
