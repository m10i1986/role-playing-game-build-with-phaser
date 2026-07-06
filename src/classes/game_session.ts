import type { VariableValue } from "../types/timeline";

// 回答の種類
export type AnswerRecordType = "choice" | "multi_choice" | "input_number";

// 1回分の回答履歴
export type AnswerRecord = {
    type: AnswerRecordType;
    key: string; // 回答対象を識別するキー(選択肢の遷移先key、InputNumberの変数keyなど)
    value: VariableValue | VariableValue[]; // 選択したテキスト・数値・複数選択の配列など
    elapsedMs: number; // ゲーム開始からこの回答までの経過時間(ms)
};

// 結果送信先の設定(URLクエリパラメータから取得)
let resultUrl: string | undefined;
let resultToken: string | undefined;
let started_at: number | undefined;

const answers: AnswerRecord[] = [];

// URLクエリパラメータ(resultUrl, token)から結果送信先を読み取り、プレイ開始時刻を記録する
export function initGameSession(): void {
    const params = new URLSearchParams(window.location.search);
    resultUrl = params.get("resultUrl") ?? undefined;
    resultToken = params.get("token") ?? undefined;
    started_at = Date.now();
    answers.length = 0;
}

// 回答を時系列履歴に追加する
export function recordAnswer(type: AnswerRecordType, key: string, value: VariableValue | VariableValue[]): void {
    const elapsedMs = started_at !== undefined ? Date.now() - started_at : 0;
    answers.push({ type, key, value, elapsedMs });
}

// 結果送信先が設定されている場合、回答履歴・プレイ時間をJSONでPOST送信する
export async function sendGameResult(): Promise<void> {
    if (!resultUrl) {
        return;
    }

    const playTimeMs = started_at !== undefined ? Date.now() - started_at : 0;

    const body = {
        token: resultToken,
        playTimeMs,
        answers,
    };

    try {
        await fetch(resultUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error("[ERROR] ゲーム結果の送信に失敗しました", error);
    }
}
