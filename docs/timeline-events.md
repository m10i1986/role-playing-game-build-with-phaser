# Timeline イベントリファレンス（EventTypeEnum）

シナリオ（`senarioData`）は Timeline（イベントの配列）の辞書として定義し、`TimelinePlayer` が先頭から順に実行します。本書は `EventTypeEnum` で定義された各イベントの使い方をまとめたリファレンスです。

- enum 定義: [src/types/timeline.ts](../src/types/timeline.ts)
- 実行処理: [src/classes/timeline_player.ts](../src/classes/timeline_player.ts)
- シナリオ記述例: [src/senario.sample.ts](../src/senario.sample.ts)

## 基本の仕組み

### タイムラインの進行

イベントは進行の仕方で3種類に分かれます。

| 進行タイプ | 対象イベント | 動作 |
| --- | --- | --- |
| クリック待ち | `SetDialog` | 表示後、画面クリックで次のイベントへ進む |
| 入力待ち | `Choice` / `MultiChoice` / `InputNumber` | プレイヤーの入力・決定で次へ進む |
| 即時実行 | 上記以外 | 実行後すぐに次のイベントへ自動で進む |

`SetDialog` のタイピング演出中にクリックすると、まず全文が即時表示され、もう一度クリックすると次のイベントへ進みます。

### レイヤー構造

`TimelinePlayer` は以下の重なり順（depth）で描画します。

| depth | レイヤー | 関連イベント |
| --- | --- | --- |
| 0 | 背景 | `SetBackground` / `ClearBackground` |
| 1 | 前景 | `AddForeground` / `ClearForeground` |
| 2 | 画面枠 | `SetFrame` |
| 3 | メッセージダイアログ | `SetDialog` / `ClearDialog` |
| 4 | UI（選択肢・Webリンク・数値入力など） | `Choice` / `MultiChoice` / `ShowWebLink` / `InputNumber` |

### 変数ストア

`SetVariable` / `InputNumber` で保存した変数は以下で利用できます（実装: [src/classes/variable_store.ts](../src/classes/variable_store.ts)）。

- **テキスト補間**: `SetDialog` の `text` 内の `{{変数名}}` が変数値に置換される（未定義なら空文字）
- **表示条件**: `Choice` / `MultiChoice` の選択肢に `condition` を指定すると、条件を満たす場合のみ表示される（後述の [GetVariable](#getvariable--get_variable変数条件) を参照）
- **スコア加算**: `Choice` の `point` や `MultiChoice` の正誤判定結果が `scoreKey`（デフォルト `"score"`）へ加算される。加算先の変数が未設定の場合は `0` を基準に加算される
- **スコア初期値**: 専用のイベントは無いが、タイムライン先頭に `SetVariable` で `scoreKey` と同名の変数（デフォルト `"score"`）を設定すれば任意の初期値からスコア加算を開始できる（例は [SetVariable](#setvariable--set_variable変数設定) を参照）

---

## イベント一覧

| enum メンバー | 文字列値 | 用途 | 進行 |
| --- | --- | --- | --- |
| `SetDialog` | `dialog` | ダイアログにテキスト表示 | クリック待ち |
| `ClearDialog` | `clear_dialog` | ダイアログを消去 | 即時 |
| `SetBackground` | `set_background` | 背景画像を設定 | 即時 |
| `ClearBackground` | `clear_background` | 背景を消去 | 即時 |
| `SetFrame` | `set_frame` | 画面枠画像を設定 | 即時 |
| `AddForeground` | `add_foreground` | 前景画像を追加 | 即時 |
| `ClearForeground` | `clear_foreground` | 前景を全消去 | 即時 |
| `TimelineTransition` | `timeline_transition` | 別タイムラインへ遷移 | 遷移（終端） |
| `SceneTransition` | `scene_transition` | 別シーンへ遷移 | 遷移（終端） |
| `Choice` | `choice` | 単一選択肢を表示 | 入力待ち |
| `MultiChoice` | `multi_choice` | 複数選択問題を表示 | 入力待ち |
| `ShowWebLink` | `show_weblink` | Webリンクを表示 | 即時 |
| `HideWebLink` | `hide_weblink` | Webリンクを消去 | 即時 |
| `PlaySound` | `play_sound` | サウンドを再生 | 即時 |
| `ClearSound` | `clear_sound` | サウンドを停止 | 即時 |
| `SetVariable` | `set_variable` | 変数を設定 | 即時 |
| `ClearVariable` | `clear_variable` | 変数を削除 | 即時 |
| `GetVariable` | `get_variable` | 選択肢の表示条件（単体イベントではない） | - |
| `InputNumber` | `input_number` | 数値入力UIを表示 | 入力待ち |

---

## SetDialog / `dialog`（ダイアログ表示）

メッセージダイアログにテキストをタイピング演出（50ms/文字）付きで表示します。表示後はクリック待ちになります。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `text` | string | ○ | 表示するテキスト。`\n` で改行。`{{変数名}}` は変数値に置換される |
| `actorName` | string | 任意 | 話者名。未指定なら名前欄は非表示 |
| `actorFillColor` | string | 任意 | 名前欄の背景色（`#RRGGBB` 形式のみ有効。デフォルト `#000000`） |
| `actorFillAlpha` | number | 任意 | 名前欄の背景透明度（0〜1。デフォルト `1.0`） |
| `textFillColor` | string | 任意 | テキスト欄の背景色（`#RRGGBB` 形式のみ有効。デフォルト `#000000`） |
| `textFillAlpha` | number | 任意 | テキスト欄の背景透明度（0〜1。デフォルト `1.0`） |

```ts
{
    event: EventTypeEnum.SetDialog,
    text: "あなたの回答は {{calc_answer}} です",
    actorName: "システム",
    textFillColor: "#0000ff",
    textFillAlpha: 0.5,
    actorFillColor: "#0000ff",
    actorFillAlpha: 0.5,
},
```

注意点:

- 色・透明度はイベントごとに初期値へリセットされるため、続けて同じ色にしたい場合は毎回指定が必要です
- タイピング演出中のクリックは「全文即時表示」になり、次のイベントへは進みません

## ClearDialog / `clear_dialog`（ダイアログ消去）

話者名とテキストを消去します。プロパティはありません。

```ts
{ event: EventTypeEnum.ClearDialog },
```

## SetBackground / `set_background`（背景設定）

背景レイヤーの既存画像をすべて削除し、指定テクスチャの画像を1枚配置します。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `key` | string | ○ | プリロード済みテクスチャキー（`illustrationFiles` に登録した名前） |
| `x` | number | 任意 | 配置X座標（デフォルトは画面中央） |
| `y` | number | 任意 | 配置Y座標（デフォルトは画面中央） |
| `effect` | string | 任意 | `"fadein"`: 1秒かけてフェードイン / `"fadeout"`: 1秒かけてフェードアウト / それ以外・未指定: 即時表示 |

```ts
{ event: EventTypeEnum.SetBackground, key: "sample01", effect: "fadein" },
```

注意点:

- `effect: "fadeout"` は「新しい画像を表示してから透明にしていく」動作です。表示中の背景を消したいだけなら `ClearBackground` を使ってください

## ClearBackground / `clear_background`（背景消去）

背景レイヤーの画像をすべて削除します。プロパティはありません。

```ts
{ event: EventTypeEnum.ClearBackground },
```

## SetFrame / `set_frame`（画面枠設定）

画面枠レイヤーの既存画像を削除し、指定テクスチャを画面中央に配置します。背景・前景より前面、ダイアログより背面に表示されます。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `key` | string | ○ | プリロード済みテクスチャキー |
| `x` / `y` | number | 任意 | 型定義には存在するが、現行実装では使用されず常に画面中央に配置される |

```ts
{ event: EventTypeEnum.SetFrame, key: "frame01" },
```

## AddForeground / `add_foreground`（前景追加）

前景レイヤーに画像を**追加**します。`SetBackground` と異なり既存の前景は消えないため、キャラクターの立ち絵を複数並べる用途などに使えます。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `key` | string | ○ | プリロード済みテクスチャキー |
| `x` | number | 任意 | 配置X座標（デフォルトは画面中央） |
| `y` | number | 任意 | 配置Y座標（デフォルトは画面中央） |

```ts
{ event: EventTypeEnum.AddForeground, key: "character01", x: 200, y: 400 },
```

## ClearForeground / `clear_foreground`（前景消去）

前景レイヤーの画像をすべて削除します。個別削除はできません。プロパティはありません。

```ts
{ event: EventTypeEnum.ClearForeground },
```

## TimelineTransition / `timeline_transition`（タイムライン遷移）

シーンをリスタートして、指定キーのタイムラインを先頭から実行します。このイベント以降のイベントは実行されないため、タイムラインの終端として使います。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `key` | string | ○ | 遷移先のタイムラインキー（`senarioData` のキー名） |

```ts
{ event: EventTypeEnum.TimelineTransition, key: "unit02" },
```

注意点:

- シーンのリスタートを伴うため、背景・前景・ダイアログなどの表示状態はシーンの `init`/`create` の実装に従って再構築されます

## SceneTransition / `scene_transition`（シーン遷移）

タイムラインを終了して、別の Phaser シーン（タイトル・エンディングなど）へ遷移します。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `key` | string | ○ | 遷移先シーンキー |
| `data` | object | 任意 | 遷移先シーンの `init()` に渡すデータ |

```ts
{ event: EventTypeEnum.SceneTransition, key: "ending" },
```

注意点:

- `key: "ending"` への遷移時は、結果送信先が設定されていればゲーム結果をサーバへ送信します（詳細: [result-submission.md](result-submission.md)）

## Choice / `choice`（単一選択肢）

選択肢ボタンを縦に並べて表示します。プレイヤーがボタンをクリックすると、その選択肢の `key` のタイムラインへ遷移します（内部的には `TimelineTransition` と同じシーンリスタート）。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `choices` | Choice[] | ○ | 選択肢の配列 |
| `scoreKey` | string | 任意 | `point` の加算先変数名（デフォルト `"score"`） |

`Choice`（選択肢1件）のプロパティ:

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `text` | string | ○ | ボタンに表示するテキスト |
| `key` | string | ○ | 選択時の遷移先タイムラインキー |
| `condition` | VariableCondition | 任意 | 表示条件（[GetVariable](#getvariable--get_variable変数条件) 参照）。未指定なら常に表示 |
| `point` | number | 任意 | 選択時に `scoreKey` へ加算するポイント。未指定なら加算しない |

```ts
{
    event: EventTypeEnum.Choice,
    choices: [
        {
            text: "答え合わせをする",
            key: "calculation_correct",
            point: 1,
            condition: { event: EventTypeEnum.GetVariable, key: "calc_answer", operator: "eq", value: 2 },
        },
        {
            text: "答え合わせをする",
            key: "calculation_incorrect",
            condition: { event: EventTypeEnum.GetVariable, key: "calc_answer", operator: "neq", value: 2 },
        },
    ],
},
```

注意点:

- 選択結果は回答履歴に記録され、ゲーム結果送信に含まれます
- `condition` で全選択肢が非表示になった場合、ボタンは表示されず画面クリックで次のイベントへ進みます
- 上の例のように、同じ表示テキストで `condition` により遷移先を出し分けると「変数値による分岐」が実現できます

## MultiChoice / `multi_choice`（複数選択問題）

複数選択式の問題を表示します。プレイヤーは選択肢をクリックで選択/解除し、「選択完了(採点する)」ボタンで採点します。**選択した集合が正解選択肢の集合と完全一致した場合のみ正解**です。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `choices` | MultiChoice[] | ○ | 選択肢の配列 |
| `correctKey` | string | ○ | 正解時の遷移先タイムラインキー |
| `incorrectKey` | string | ○ | 不正解時の遷移先タイムラインキー |
| `shuffle` | boolean | 任意 | `true` で選択肢の表示順をシャッフル（デフォルト `false`） |
| `minSelect` | number | 任意 | 最小選択数。満たさないと採点ボタンが反応しない（デフォルト `0`） |
| `maxSelect` | number | 任意 | 最大選択数。超えて選択しようとしても無視される（デフォルトは無制限） |
| `scoreKey` | string | 任意 | 採点結果の加算先変数名（デフォルト `"score"`）。正解で +1、不正解で +0 |

`MultiChoice`（選択肢1件）のプロパティ:

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `text` | string | ○ | ボタンに表示するテキスト |
| `correct` | boolean | ○ | 正解選択肢かどうか |
| `condition` | VariableCondition | 任意 | 表示条件。未指定なら常に表示 |
| `contraindication` | boolean | 任意 | 禁忌選択肢フラグ（型定義のみ。現行実装の採点では未使用） |
| `point` | number | 任意 | 選択肢ごとのポイント（型定義のみ。現行実装の採点では未使用） |

```ts
{ event: EventTypeEnum.SetDialog, text: "問題です。\n野菜なのはどれ？\n”正しいもの” を全て選択しなさい。" },
{
    event: EventTypeEnum.MultiChoice,
    choices: [
        { text: "植物油", correct: false },
        { text: "バナナ", correct: true },
        { text: "リンゴ", correct: true },
        { text: "白米", correct: false },
    ],
    correctKey: "multi_choice_correct",
    incorrectKey: "multi_choice_incorrect",
    shuffle: true,
},
```

注意点:

- 選択結果（選択したテキストの一覧）は回答履歴に記録され、ゲーム結果送信に含まれます
- 問題文は直前に `SetDialog` で表示しておくのが定石です（ボタン群はダイアログ領域を避けて上寄せで配置されます）

## ShowWebLink / `show_weblink`（Webリンク表示）

画面中央にクリック可能なリンクボックスを表示します。表示したまま次のイベントへ即時進行するため、通常は直後に `SetDialog` などのクリック待ちイベントを置きます。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `url` | string | ○ | リンク先URL |
| `text` | string | 任意 | 表示テキスト（デフォルトは `url` そのまま） |
| `target` | string | 任意 | `window.open` の target（デフォルト `"_blank"`） |

```ts
{ event: EventTypeEnum.ShowWebLink, url: "https://example.com/manual", text: "解説ページを開く" },
{ event: EventTypeEnum.SetDialog, text: "リンク先を確認したら、画面をクリックして先へ進んでください" },
```

注意点:

- 同時に表示できるリンクは1つです。再度実行すると前のリンクは削除されます
- リンクは自動では消えません。不要になったら `HideWebLink` で消してください

## HideWebLink / `hide_weblink`（Webリンク消去）

表示中のWebリンクボックスを削除します。プロパティはありません。

```ts
{ event: EventTypeEnum.HideWebLink },
```

## PlaySound / `play_sound`（サウンド再生）

プリロード済みのサウンドを再生します。同じキーのサウンドが再生中の場合は何もしません（多重再生防止）。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `key` | string | ○ | プリロード済みサウンドキー（`musicFiles` に登録した名前） |
| `loop` | boolean | 任意 | `true` でループ再生（デフォルト `false`） |

```ts
{ event: EventTypeEnum.PlaySound, key: "bgm01", loop: true },
```

## ClearSound / `clear_sound`（サウンド停止）

指定キーのサウンドが再生中であれば停止（破棄）します。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `key` | string | ○ | 停止するサウンドキー |

```ts
{ event: EventTypeEnum.ClearSound, key: "bgm01" },
```

## SetVariable / `set_variable`（変数設定）

変数ストアに値を保存します。同名の変数は上書きされます。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `key` | string | ○ | 変数名 |
| `value` | string \| number \| boolean | ○ | 保存する値 |

```ts
{ event: EventTypeEnum.SetVariable, key: "visited_unit01", value: true },
```

応用: スコアの初期値設定

`Choice` / `MultiChoice` のスコア加算先（`scoreKey`、デフォルト `"score"`）は未設定時に `0` から加算が始まるため、`0` 以外の値から始めたい場合はタイムライン先頭で `SetVariable` により初期値を設定します。

```ts
{ event: EventTypeEnum.SetVariable, key: "score", value: 100 },
```

`scoreKey` を独自の名前にしている場合は、その名前に合わせて `key` を指定してください。

応用: サーバー送信用の結果(result)を設定

エンディング(`key: "ending"`)へ遷移する前に `SetVariable` で `result_success` / `result_score` を設定すると、その内容が `sendGameResult()` 送信時の `result` として送信されます（`result_success` は送信JSON上では `result.result`、`result_score` は `result.score` になります。詳細: [result-submission.md](result-submission.md)）。

```ts
{ event: EventTypeEnum.SetVariable, key: "result_success", value: true }, // boolean（未設定時はresult.resultがtrue）
{ event: EventTypeEnum.SetVariable, key: "result_score", value: 100 }, // number（未設定時はresult.scoreがnull）
```

## ClearVariable / `clear_variable`（変数削除）

変数ストアから変数を削除します。削除後は `notExists` 条件が真になり、`{{変数名}}` は空文字に置換されます。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `key` | string | ○ | 削除する変数名 |

```ts
{ event: EventTypeEnum.ClearVariable, key: "calc_answer" },
```

## GetVariable / `get_variable`（変数条件）

**単体のタイムラインイベントとしては使えません。** `Choice` / `MultiChoice` の選択肢の `condition` プロパティ内で、変数値による表示条件（`VariableCondition`）を表すために使います。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `event` | - | ○ | `EventTypeEnum.GetVariable` 固定 |
| `key` | string | ○ | 判定対象の変数名 |
| `operator` | ConditionOperator | ○ | 比較演算子（下表参照） |
| `value` | string \| number \| boolean | 条件による | 比較値。`exists` / `notExists` では不要 |

| operator | 意味 | 備考 |
| --- | --- | --- |
| `eq` | 等しい | 厳密比較（`===`） |
| `neq` | 等しくない | 厳密比較（`!==`） |
| `gt` / `gte` | より大きい / 以上 | 変数値・比較値ともに数値の場合のみ真になり得る |
| `lt` / `lte` | より小さい / 以下 | 同上 |
| `exists` | 変数が定義されている | `value` 不要 |
| `notExists` | 変数が未定義 | `value` 不要 |

```ts
{
    text: "スコアが3以上の人だけの選択肢",
    key: "bonus_stage",
    condition: { event: EventTypeEnum.GetVariable, key: "score", operator: "gte", value: 3 },
},
```

## InputNumber / `input_number`（数値入力）

「-」「+」ボタンと数値表示、「決定」ボタンからなる数値入力UIを表示します。決定した値は変数として保存され、その後のダイアログや条件分岐で利用できます。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `key` | string | ○ | 入力値の保存先変数名 |
| `min` | number | 任意 | 最小値。決定時にこの値でクランプされる |
| `max` | number | 任意 | 最大値。決定時にこの値でクランプされる |
| `defaultValue` | number | 任意 | 初期値（省略時は `min ?? 0`） |
| `step` | number | 任意 | +/-ボタン1回あたりの増減量（デフォルト `1`） |

```ts
{ event: EventTypeEnum.SetDialog, text: "1 + 1 = ?" },
{
    event: EventTypeEnum.InputNumber,
    key: "calc_answer",
    min: -100,
    max: 100,
    defaultValue: 0,
    step: 1,
},
{ event: EventTypeEnum.SetDialog, text: "あなたの回答は {{calc_answer}} です" },
```

操作方法:

- 「-」「+」ボタン: `step` ずつ増減（`min` / `max` で制限）
- キーボード: `0`〜`9` で数字を追記、`Backspace` で1文字削除、`-` は先頭のみ入力可（`min` が負の場合）、`Enter` で決定
- 決定時: 入力値を数値に変換して `min` / `max` でクランプし、変数へ保存して次のイベントへ進む（不正な入力は `min ?? 0` になる）

注意点:

- 入力値は回答履歴に記録され、ゲーム結果送信に含まれます

---

## シナリオ記述の全体例

```ts
export const senarioData: Timelines = {
    start: [
        { event: EventTypeEnum.ClearForeground },
        { event: EventTypeEnum.SetBackground, key: "sample01", effect: "fadein" },
        { event: EventTypeEnum.PlaySound, key: "bgm01", loop: true },
        { event: EventTypeEnum.SetDialog, text: "冒険を始めますか？", actorName: "システム" },
        {
            event: EventTypeEnum.Choice,
            choices: [
                { text: "はい", key: "quiz" },
                { text: "いいえ", key: "ending" },
            ],
        },
    ],
    quiz: [
        { event: EventTypeEnum.SetDialog, text: "正しいものを全て選べ" },
        {
            event: EventTypeEnum.MultiChoice,
            choices: [
                { text: "選択肢A", correct: true },
                { text: "選択肢B", correct: false },
            ],
            correctKey: "quiz_correct",
            incorrectKey: "quiz_incorrect",
            shuffle: true,
        },
    ],
    quiz_correct: [
        { event: EventTypeEnum.SetDialog, text: "正解！ 現在のスコア: {{score}}" },
        { event: EventTypeEnum.TimelineTransition, key: "ending" },
    ],
    quiz_incorrect: [
        { event: EventTypeEnum.SetDialog, text: "不正解…" },
        { event: EventTypeEnum.TimelineTransition, key: "ending" },
    ],
    ending: [
        { event: EventTypeEnum.ClearSound, key: "bgm01" },
        { event: EventTypeEnum.SceneTransition, key: "ending" },
    ],
};
```
