import { EventTypeEnum } from "./types/timeline";
import type { PreloadFileDict, Timelines } from "./types/timelines";

// EventTypeEnumの全メンバーを一度は使用するサンプルシナリオ
// (実在しないアセットを参照するイベントはコメントアウトし、アセットキーのみ例示している)
export const illustrationFiles: PreloadFileDict = {
    sample01: "assets/image/common/sample01.png",
    sample02: "assets/image/common/sample02.png",
    frame01: "assets/image/common/frame01.png",
    character01: "assets/image/common/character01.png",
};

export const musicFiles: PreloadFileDict = {
    bgm01: "assets/sound/music/bgm01.mp3",
};

export const senarioData: Timelines = {
    start: [
        { event: EventTypeEnum.ClearForeground },
        { event: EventTypeEnum.ClearBackground },
        // スコアの初期値を設定する(未設定でも加算時に0から開始するため必須ではない)
        { event: EventTypeEnum.SetVariable, key: "score", value: 0 },
        {
            event: EventTypeEnum.SetDialog,
            text: "シナリオサンプルを始めます",
            actorName: "システム",
            textFillColor: "#0000ff",
            textFillAlpha: 0.5,
            actorFillColor: "#0000ff",
            actorFillAlpha: 0.5,
        },
        {
            event: EventTypeEnum.SetDialog,
            text: "どこから始めますか？",
            actorName: "システム",
            textFillColor: "#0000ff",
            textFillAlpha: 0.5,
            actorFillColor: "#0000ff",
            actorFillAlpha: 0.5,
        },
        {
            event: EventTypeEnum.Choice,
            choices: [
                { text: "unit01へ", key: "unit01" },
                { text: "MultiChoice", key: "multi_choice" },
                { text: "Calculation", key: "calculation" },
                { text: "Presentation(演出サンプル)", key: "presentation" },
            ],
        },
    ],
    unit01: [
        //{ event: EventTypeEnum.SetBackground, key: "sample01" },
        { event: EventTypeEnum.ClearDialog },
        { event: EventTypeEnum.TimelineTransition, key: "unit02" },
    ],
    unit02: [
        //{ event: EventTypeEnum.SetBackground, key: "sample02" },
        { event: EventTypeEnum.ClearDialog },
        { event: EventTypeEnum.SetDialog, text: "テストに進みますか？" },
        {
            event: EventTypeEnum.Choice,
            choices: [
                { text: "はい", key: "multi_choice" },
                { text: "いいえ", key: "presentation" },
            ],
        },
    ],
    // 背景・画面枠・前景・BGM・Webリンクなど、演出系イベントをまとめたサンプル
    presentation: [
        //{ event: EventTypeEnum.SetBackground, key: "sample01", effect: "fadein" },
        //{ event: EventTypeEnum.SetFrame, key: "frame01" },
        //{ event: EventTypeEnum.AddForeground, key: "character01", x: 200, y: 400 },
        // { event: EventTypeEnum.PlaySound, key: "bgm01", loop: true },
        { event: EventTypeEnum.SetDialog, text: "演出サンプルです。背景・画面枠・前景・BGMを設定しました" },
        { event: EventTypeEnum.ShowWebLink, url: "https://example.com/manual", text: "解説ページを開く" },
        { event: EventTypeEnum.SetDialog, text: "リンク先を確認したら、画面をクリックして先へ進んでください" },
        { event: EventTypeEnum.HideWebLink },
        { event: EventTypeEnum.ClearSound, key: "bgm01" },
        { event: EventTypeEnum.ClearForeground },
        //{ event: EventTypeEnum.ClearBackground },
        {
            event: EventTypeEnum.Choice,
            choices: [{ text: "戻る", key: "start" }],
        },
    ],
    multi_choice: [
        { event: EventTypeEnum.SetDialog, text: "問題です。\n野菜なのはどれ？\n”正しいもの” を全て選択しなさい。" },
        {
            event: EventTypeEnum.MultiChoice,
            choices: [
                { text: "植物油", correct: false },
                { text: "バナナ", correct: true },
                { text: "リンゴ", correct: true },
                { text: "白米", correct: false },
                { text: "牛肉", correct: false },
            ],
            correctKey: "multi_choice_correct",
            incorrectKey: "multi_choice_incorrect",
            shuffle: true,
            scoreKey: "score",
        },
    ],
    multi_choice_correct: [
        {
            event: EventTypeEnum.SetDialog,
            text: "正解です！ 現在のスコア: {{score}}",
            actorName: "システム",
            textFillColor: "#008000",
            textFillAlpha: 0.5,
            actorFillColor: "#0000ff",
            actorFillAlpha: 0.5,
        },
        {
            event: EventTypeEnum.SetDialog,
            text: "以上でテストは終了です\t次に進みますか？",
            actorName: "システム",
            textFillColor: "#0000ff",
            textFillAlpha: 0.5,
            actorFillColor: "#0000ff",
            actorFillAlpha: 0.5,
        },
        {
            event: EventTypeEnum.Choice,
            choices: [
                { text: "はい(終了)", key: "calculation" },
                { text: "いいえ(もう一度テスト)", key: "multi_choice" },
            ],
        },
    ],
    multi_choice_incorrect: [
        {
            event: EventTypeEnum.SetDialog,
            text: "残念、不正解です",
            actorName: "システム",
            textFillColor: "#ff0000",
            textFillAlpha: 0.5,
            actorFillColor: "#0000ff",
            actorFillAlpha: 0.5,
        },
        {
            event: EventTypeEnum.SetDialog,
            text: "再度テストに挑みますか？",
            actorName: "システム",
            textFillColor: "#0000ff",
            textFillAlpha: 0.5,
            actorFillColor: "#0000ff",
            actorFillAlpha: 0.5,
        },
        {
            event: EventTypeEnum.Choice,
            choices: [
                { text: "はい(もう一度テスト)", key: "multi_choice" },
                { text: "いいえ(次に進む)", key: "calculation" },
            ],
        },
    ],
    calculation: [
        { event: EventTypeEnum.SetDialog, text: "計算問題です" },
        { event: EventTypeEnum.SetDialog, text: "1 + 1 = ?" },
        {
            event: EventTypeEnum.InputNumber,
            key: "calc_answer",
            min: -100,
            max: 100,
            defaultValue: 0,
            step: 1,
        },
        { event: EventTypeEnum.ClearDialog },
        { event: EventTypeEnum.SetDialog, text: "あなたの回答は {{calc_answer}} です" },
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
            scoreKey: "score",
        },
        // 変数削除のサンプル(この後の分岐では calc_answer 条件は使わないため削除しておく)
        { event: EventTypeEnum.ClearVariable, key: "calc_answer" },
    ],
    calculation_correct: [
        {
            event: EventTypeEnum.SetDialog,
            text: "正解です！ 現在のスコア: {{score}}",
            actorName: "システム",
            textFillColor: "#008000",
            textFillAlpha: 0.5,
            actorFillColor: "#0000ff",
            actorFillAlpha: 0.5,
        },
        {
            event: EventTypeEnum.Choice,
            choices: [
                { text: "はい(もう一度テスト)", key: "calculation" },
                { text: "いいえ(次に進む)", key: "ending" },
            ],
        },
    ],
    calculation_incorrect: [
        {
            event: EventTypeEnum.SetDialog,
            text: "残念、不正解です。正解は 2 でした",
            actorName: "システム",
            textFillColor: "#ff0000",
            textFillAlpha: 0.5,
            actorFillColor: "#0000ff",
            actorFillAlpha: 0.5,
        },
        {
            event: EventTypeEnum.Choice,
            choices: [
                { text: "はい(もう一度テスト)", key: "calculation" },
                { text: "いいえ(次に進む)", key: "ending" },
            ],
        },
    ],
    ending: [{ event: EventTypeEnum.SceneTransition, key: "ending" }],
};
