# ゲーム結果の送信仕様

ゲーム起動時にURLクエリパラメータで結果送信先を指定すると、ゲーム終了時（エンディング到達時）に回答内容とプレイ時間をサーバへ自動送信します。

## 起動URL

```
https://example.com/game/?resultUrl=<結果送信先URL(URLエンコード)>&token=<セッションを識別するトークン>
```

| パラメータ | 必須 | 説明 |
| --- | --- | --- |
| `resultUrl` | ○ | 結果をPOST送信する送信先URL。URLエンコードして指定する。未指定の場合は送信自体を行わない。 |
| `token` | 任意 | セッションやプレイヤーを識別するためのトークン。送信データにそのまま含まれる。 |

### サンプルURL

```
https://example.com/game/?resultUrl=https%3A%2F%2Fapi.example.com%2Fgame-results&token=abc123
```

ローカル開発サーバーの例:

```
http://localhost:5173/?resultUrl=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fgame-results&token=test-session-001
```

## 送信タイミング

シナリオ（Timeline DSL）の `scene_transition` イベントで遷移先キーが `ending`（エンディングシーン）になったタイミングで送信します。

```ts
{ event: EventTypeEnum.SceneTransition, key: "ending" }
```

`resultUrl` が指定されていない場合は何も送信されません。

## リクエスト仕様

- メソッド: `POST`
- Content-Type: `application/json`
- 送信先: 起動時に指定した `resultUrl`

### ボディ

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
  ]
}
```

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `token` | `string \| undefined` | 起動URLで指定した `token`。未指定の場合は `undefined`（JSON上は省略）。 |
| `playTimeMs` | `number` | ゲーム開始（起動時）からエンディング到達までの経過時間(ミリ秒)。 |
| `answers` | `AnswerRecord[]` | プレイ中に発生した回答の時系列履歴。 |

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

## 実装箇所

- [src/classes/game_session.ts](../src/classes/game_session.ts) — URLパラメータの読み取り、回答履歴の保持、結果送信処理。
- [src/index.ts](../src/index.ts) — 起動時に `initGameSession()` を呼び出し、セッションを初期化。
- [src/classes/timeline_player.ts](../src/classes/timeline_player.ts) — 選択肢・数値入力のたびに `recordAnswer()` を呼び出して回答を記録し、エンディング遷移時に `sendGameResult()` を呼び出して送信する。

## 注意事項

- 送信は `fetch` によるベストエフォートで行われ、失敗した場合はコンソールにエラーを出力するのみで、リトライは行いません。
- 通信内容は暗号化されません。機密性の高い情報を扱う場合はHTTPS通信を使用し、必要に応じてサーバー側で認可・改ざん検知の仕組みを用意してください。
