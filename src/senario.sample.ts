import { EventTypeEnum } from "./types/timeline";
import type { PreloadFileDict, Timelines } from "./types/timelines";

export const illustrationFiles: PreloadFileDict = {
    sample01: "assets/image/common/sample01.png",
    sample02: "assets/image/common/sample02.png",
};

export const musicFiles: PreloadFileDict = {};

export const senarioData: Timelines = {
    start: [
        { event: EventTypeEnum.ClearForeground },
        { event: EventTypeEnum.ClearBackground },
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
            ],
        },
    ],

    unit01: [
        { event: EventTypeEnum.SetBackground, key: "sample01" },
        { event: EventTypeEnum.ClearDialog }, //一旦画面を止めるためにクリア
        { event: EventTypeEnum.TimelineTransition, key: "unit02" },
    ],
    unit02: [
        { event: EventTypeEnum.SetBackground, key: "sample02" },
        { event: EventTypeEnum.ClearDialog },
        { event: EventTypeEnum.SetDialog, text: "テストに進みますか？" },
        {
            event: EventTypeEnum.Choice,
            choices: [
                { text: "はい", key: "multi_choice" },
                { text: "いいえ", key: "unit01" },
            ],
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
        },
    ],
    multi_choice_correct: [
        {
            event: EventTypeEnum.SetDialog,
            text: "正解です！",
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
                    condition: { event: EventTypeEnum.GetVariable, key: "calc_answer", operator: "eq", value: 2 },
                },
                {
                    text: "答え合わせをする",
                    key: "calculation_incorrect",
                    condition: { event: EventTypeEnum.GetVariable, key: "calc_answer", operator: "neq", value: 2 },
                },
            ],
        },
    ],
    calculation_correct: [
        {
            event: EventTypeEnum.SetDialog,
            text: "正解です！",
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
