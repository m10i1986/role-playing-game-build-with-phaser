// src/senario.ts が無い場合、src/senario.sample.ts をコピーして用意する
import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));
const senarioPath = `${srcDir}/senario.ts`;
const samplePath = `${srcDir}/senario.sample.ts`;

if (!existsSync(senarioPath)) {
    copyFileSync(samplePath, senarioPath);
    console.log("[ensure-senario] src/senario.ts が存在しなかったため、senario.sample.ts をコピーしました");
}
