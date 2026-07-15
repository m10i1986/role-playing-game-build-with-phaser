// イベントタイプのenum定義
export enum EventTypeEnum {
    ClickWait = "click_wait",
    SetDialog = "dialog",
    ClearDialog = "clear_dialog",
    SetBackground = "set_background",
    ClearBackground = "clear_background",
    SetFrame = "set_frame",
    AddForeground = "add_foreground",
    ClearForeground = "clear_foreground",
    TimelineTransition = "timeline_transition",
    SceneTransition = "scene_transition",
    Choice = "choice",
    MultiChoice = "multi_choice",
    SortOrder = "sort_order",
    ShowWebLink = "show_weblink",
    HideWebLink = "hide_weblink",
    PlaySound = "play_sound",
    ClearSound = "clear_sound",
    SetVariable = "set_variable",
    ClearVariable = "clear_variable",
    GetVariable = "get_variable",
    IncrementVariable = "increment_variable",
    DecrementVariable = "decrement_variable",
    SetVariableList = "set_variable_list",
    ClearVariableList = "clear_variable_list",
    PushVariableList = "push_variable_list",
    PopVariableList = "pop_variable_list",
    InputNumber = "input_number",
    SendGameResultWithPhaserWorks = "send_game_result_with_phaser_works",
    SendGameResultWithPowerAutomate = "send_game_result_with_power_automate",
    CheckPreferredUsername = "check_preferred_username",
}

// 変数として扱える値の型
export type VariableValue = string | number | boolean;

// 変数条件の比較演算子
export type ConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "exists" | "notExists";

// 変数条件(Choice/MultiChoiceの表示条件・スキップ判定に使用)
export type VariableCondition = {
    event: EventTypeEnum.GetVariable;
    key: string;
    operator: ConditionOperator;
    value?: VariableValue; // exists/notExistsでは不要
};

// クリック待機イベント
type ClickWaitEvent = {
    event: EventTypeEnum.ClickWait;
};

// ダイアログ表示イベント
type SetDialogEvent = {
    event: EventTypeEnum.SetDialog;
    text: string;
    textFillColor?: string;
    textFillAlpha?: number;
    actorName?: string;
    actorFillColor?: string;
    actorFillAlpha?: number;
};

// ダイアログ非表示イベント
type ClearDialogEvent = {
    event: EventTypeEnum.ClearDialog;
};

// 背景設定イベント
type SetBackgroundEvent = {
    event: EventTypeEnum.SetBackground;
    x?: number;
    y?: number;
    key: string;
    effect?: string;
};

// 背景非表示イベント
type ClearBackgroundEvent = {
    event: EventTypeEnum.ClearBackground;
};

// 枠設定イベント
type SetFrameEvent = {
    event: EventTypeEnum.SetFrame;
    x?: number;
    y?: number;
    key: string;
};

// 前景追加イベント
type AddForegroundEvent = {
    event: EventTypeEnum.AddForeground;
    x?: number;
    y?: number;
    key: string;
};

// 前景クリアイベント
type ClearForegroundEvent = {
    event: EventTypeEnum.ClearForeground;
};

// タイムライン遷移イベント
type TimelineTransitionEvent = {
    event: EventTypeEnum.TimelineTransition;
    key: string;
};

// シーン遷移イベント
type SceneTransitionEvent = {
    event: EventTypeEnum.SceneTransition;
    key: string;
    data?: object;
};

// 選択肢イベント
type ChoiceEvent = {
    event: EventTypeEnum.Choice;
    choices: Choice[];
    scoreKey?: string; // choice.pointの加算先変数名(未設定時は"score")
};
export type Choice = {
    text: string;
    key: string; // 選択肢選択時の遷移先キー
    condition?: VariableCondition; // 表示条件(未設定時は常に表示)
    point?: number; // 選択時にscoreKeyへ加算するポイント(未設定時は加点しない)
};

// 複数選択肢イベント
type MultiChoiceEvent = {
    event: EventTypeEnum.MultiChoice;
    choices: MultiChoice[];
    correctKey: string; // 正解時のキー
    incorrectKey: string; // 不正解時のキー
    minSelect?: number; // 最小選択数(デフォルトは0)
    maxSelect?: number; // 最大選択数(デフォルトは全選択可能)
    shuffle?: boolean; // 選択肢をシャッフルするかどうか(デフォルトはfalse)
    scoreKey?: string; // 採点結果を加算する変数名(未設定時は"score")
};
export type MultiChoice = {
    text: string;
    correct: boolean; // 正解選択肢かどうか
    contraindication?: boolean; // 禁忌選択肢かどうか(選択すると強制的に不正解扱いになる)
    point?: number; // 選択肢のポイント(スコア計算用)
    condition?: VariableCondition; // 表示条件(未設定時は常に表示)
};

// 並び替えイベント(選択肢をドラッグ&ドロップで正しい順序に並び替えさせる)
type SortOrderEvent = {
    event: EventTypeEnum.SortOrder;
    items: SortOrderItem[]; // 正しい順序で記述する配列(表示時はshuffleされる)
    correctKey: string; // 正解時のキー
    incorrectKey: string; // 不正解時のキー
    shuffle?: boolean; // 初期表示順をシャッフルするかどうか(デフォルトはtrue)
    scoreKey?: string; // 採点結果を加算する変数名(未設定時は"score")
    labelStyle?: "number" | "alphabet"; // 各ボタン左側に表示する順序ラベルの形式(未設定時は"number")
};
export type SortOrderItem = {
    text: string;
};

// ウェブリンク表示イベント
type ShowWebLinkEvent = {
    event: EventTypeEnum.ShowWebLink;
    url: string;
    text?: string; // リンクテキスト(デフォルトはurl)
    target?: string; // デフォルトは"_blank"
};

type HideWebLinkEvent = {
    event: EventTypeEnum.HideWebLink;
};

type PlaySoundEvent = {
    event: EventTypeEnum.PlaySound;
    key: string;
    loop?: boolean;
};

type ClearSoundEvent = {
    event: EventTypeEnum.ClearSound;
    key: string;
};

// 変数設定イベント
type SetVariableEvent = {
    event: EventTypeEnum.SetVariable;
    key: string;
    value: VariableValue;
};

// 変数クリアイベント
type ClearVariableEvent = {
    event: EventTypeEnum.ClearVariable;
    key: string;
};

// 数値変数加算イベント(未設定時は0から開始し、valueを加算する。value省略時は1)
type IncrementVariableEvent = {
    event: EventTypeEnum.IncrementVariable;
    key: string;
    value?: number;
};

// 数値変数減算イベント(未設定時は0から開始し、valueを減算する。value省略時は1)
type DecrementVariableEvent = {
    event: EventTypeEnum.DecrementVariable;
    key: string;
    value?: number;
};

// リスト変数設定イベント(通常の変数とは別の名前空間で管理する)
type SetVariableListEvent = {
    event: EventTypeEnum.SetVariableList;
    key: string;
    values: VariableValue[];
};

// リスト変数クリアイベント
type ClearVariableListEvent = {
    event: EventTypeEnum.ClearVariableList;
    key: string;
};

// リスト変数末尾追加イベント(未設定時は空配列から開始する)
type PushVariableListEvent = {
    event: EventTypeEnum.PushVariableList;
    key: string;
    value: VariableValue;
};

// リスト変数末尾取り出しイベント(取り出した値はresultKeyへ格納。未設定/空の場合はresultKeyへ格納しない)
type PopVariableListEvent = {
    event: EventTypeEnum.PopVariableList;
    key: string;
    resultKey?: string;
};

// 数値入力イベント
type InputNumberEvent = {
    event: EventTypeEnum.InputNumber;
    key: string; // 入力値の保存先変数名
    min?: number;
    max?: number;
    defaultValue?: number; // 初期値(省略時はmin ?? 0)
    step?: number; // +/-ボタン1回あたりの増減量(デフォルト1)
};

// ゲーム結果送信イベント(結果送信先が設定されていればPhaserWorksへ全データを送信する)
type SendGameResultWithPhaserWorksEvent = {
    event: EventTypeEnum.SendGameResultWithPhaserWorks;
};

// ゲーム結果送信イベント(指定URLへPower AutomateのHTTP Webhookトリガーが受け取れる形式でPOST送信する)
type SendGameResultWithPowerAutomateEvent = {
    event: EventTypeEnum.SendGameResultWithPowerAutomate;
    url: string;
    variables?: string[]; // 追加で送信したい変数のkey一覧(number変数・list変数どちらのkeyも指定可能)
};

// preferredUsername判定イベント(起動URLのクエリパラメータにpreferredUsernameが正しく渡されているか判定する)
// 判定OKの場合はそのまま次のイベントへ進み、NGの場合はngTextを表示してタイムラインの進行を停止する
type CheckPreferredUsernameEvent = {
    event: EventTypeEnum.CheckPreferredUsername;
    ngText: string; // 判定NG時に表示するダイアログテキスト
    ngActorName?: string;
};

// Timelineはイベントの配列
export type Timeline = (
    | ClickWaitEvent
    | SetDialogEvent
    | ClearDialogEvent
    | SetBackgroundEvent
    | ClearBackgroundEvent
    | SetFrameEvent
    | AddForegroundEvent
    | ClearForegroundEvent
    | TimelineTransitionEvent
    | SceneTransitionEvent
    | ChoiceEvent
    | MultiChoiceEvent
    | SortOrderEvent
    | ShowWebLinkEvent
    | HideWebLinkEvent
    | PlaySoundEvent
    | ClearSoundEvent
    | SetVariableEvent
    | ClearVariableEvent
    | IncrementVariableEvent
    | DecrementVariableEvent
    | SetVariableListEvent
    | ClearVariableListEvent
    | PushVariableListEvent
    | PopVariableListEvent
    | InputNumberEvent
    | SendGameResultWithPhaserWorksEvent
    | SendGameResultWithPowerAutomateEvent
    | CheckPreferredUsernameEvent
)[];
