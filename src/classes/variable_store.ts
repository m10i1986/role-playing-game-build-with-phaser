import type { VariableCondition, VariableValue } from "../types/timeline";

const variables = new Map<string, VariableValue>();

// リスト変数専用のストア(通常変数とは別の名前空間で管理する)
const variable_lists = new Map<string, VariableValue[]>();

export function setVariable(key: string, value: VariableValue): void {
    variables.set(key, value);
}

export function clearVariable(key: string): void {
    variables.delete(key);
}

export function getVariable(key: string): VariableValue | undefined {
    return variables.get(key);
}

// スコア用変数(key)に対して数値を加算する(未設定時は0から開始)
export function addScore(key: string, delta: number): number {
    const current = getVariable(key);
    const base = typeof current === "number" ? current : 0;
    const next = base + delta;
    setVariable(key, next);
    return next;
}

// 数値変数(key)をdelta分加算する(未設定時は0から開始)
export function incrementVariable(key: string, delta: number): number {
    const current = getVariable(key);
    const base = typeof current === "number" ? current : 0;
    const next = base + delta;
    setVariable(key, next);
    return next;
}

// 数値変数(key)をdelta分減算する(未設定時は0から開始)
export function decrementVariable(key: string, delta: number): number {
    return incrementVariable(key, -delta);
}

// リスト変数(key)に配列をセットする(既存があれば上書き)
export function setVariableList(key: string, values: VariableValue[]): void {
    variable_lists.set(key, [...values]);
}

// リスト変数(key)を削除する
export function clearVariableList(key: string): void {
    variable_lists.delete(key);
}

export function getVariableList(key: string): VariableValue[] | undefined {
    return variable_lists.get(key);
}

// リスト変数(key)の末尾に値を追加する(未設定時は空配列から開始)
export function pushVariableList(key: string, value: VariableValue): VariableValue[] {
    const list = variable_lists.get(key) ?? [];
    list.push(value);
    variable_lists.set(key, list);
    return list;
}

// リスト変数(key)の末尾の値を取り出して削除する(空/未設定時はundefined)
export function popVariableList(key: string): VariableValue | undefined {
    const list = variable_lists.get(key);
    if (!list || list.length === 0) {
        return undefined;
    }
    return list.pop();
}

// Choice/MultiChoiceの表示条件を判定する
export function evaluateCondition(condition: VariableCondition): boolean {
    const current = getVariable(condition.key);

    switch (condition.operator) {
        case "exists":
            return current !== undefined;
        case "notExists":
            return current === undefined;
        case "eq":
            return current === condition.value;
        case "neq":
            return current !== condition.value;
        case "gt":
            return typeof current === "number" && typeof condition.value === "number" && current > condition.value;
        case "gte":
            return typeof current === "number" && typeof condition.value === "number" && current >= condition.value;
        case "lt":
            return typeof current === "number" && typeof condition.value === "number" && current < condition.value;
        case "lte":
            return typeof current === "number" && typeof condition.value === "number" && current <= condition.value;
    }
}

// テキスト中の{{変数名}}を変数値に置換する(未定義変数は空文字)
export function interpolateVariables(text: string): string {
    return text.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) => {
        const value = getVariable(key);
        return value === undefined ? "" : String(value);
    });
}
