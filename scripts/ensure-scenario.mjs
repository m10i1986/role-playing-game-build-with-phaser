// src/scenario.ts が無い場合、src/scenario.sample.ts をコピーして用意する
import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));
const scenarioPath = `${srcDir}/scenario.ts`;
const samplePath = `${srcDir}/scenario.sample.ts`;

if (!existsSync(scenarioPath)) {
    copyFileSync(samplePath, scenarioPath);
    console.log("[ensure-scenario] src/scenario.ts が存在しなかったため、scenario.sample.ts をコピーしました");
}
