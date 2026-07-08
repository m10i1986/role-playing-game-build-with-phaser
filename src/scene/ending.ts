export class EndingScene extends Phaser.Scene {
    constructor() {
        super("ending");
    }

    create() {
        const { width, height } = this.game.canvas;

        // 背景色を白に設定
        this.cameras.main.setBackgroundColor("#ffffff");

        // 背景画像がロードされている場合のみ追加
        if (this.textures.exists("ending")) {
            const logo_image = this.add.image(width / 2, height / 2, "ending");
            // 画像のアスペクト比を維持して画面内に収まるようにリサイズ
            const maxWidth = width;
            const maxHeight = height;
            const scale = Math.min(maxWidth / logo_image.width, maxHeight / logo_image.height);
            logo_image.setScale(scale);
            logo_image.setAlpha(1);
        }

        // テキストスタイルを定義
        const text_style: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: "Meiryo, sans-serif",
            fontSize: "28px",
            color: "#000000",
        };

        // 終了メッセージを中央上に表示
        this.add
            .text(width / 2, height / 2 - 220, "ロールプレイングが終了しました\nお疲れ様でした", text_style)
            .setOrigin(0.5);
    }
}
