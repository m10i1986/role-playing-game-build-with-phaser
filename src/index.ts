import "./style.css";
import * as Phaser from "phaser";
import { initGameSession } from "./classes/game_session";
import { scenes } from "./scene/index";

// URLクエリパラメータ(resultUrl, token)の読み取りとプレイ開始時刻の記録
initGameSession();

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // webGLを使うかcanvasを使うかをphaserが自動で判断してくれる
    width: 1280,
    height: 720,
    parent: "game-app", // #game-app内にcanvasを生成
    scene: scenes,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
};

new Phaser.Game(config);
