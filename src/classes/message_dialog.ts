import * as Phaser from "phaser";
import BBCodeText from "phaser4-rex-plugins/plugins/bbcodetext.js";

export type MessageDialogConfig = {
    x: number;
    y: number;
    width: number;
    height: number;
    padding?: number;
    margin?: number;
    // TimelinePlayer等の通常Textとスタイルオブジェクトを共有しているため、
    // Phaser標準のTextStyleを受け取りBBCodeText.TextStyleとして扱う（fontFamily/fontSize等の共通プロパティのみ使用）
    text_style?: Phaser.Types.GameObjects.Text.TextStyle;
};

// Phaser.GameObjects.Containerを継承してMessageDialogを作成
// 会話テキストはBBCodeText（[b]太字[/b], [u]下線[/u] 等のタグ）で部分装飾に対応する
export class MessageDialog extends Phaser.GameObjects.Container {
    private box: Phaser.GameObjects.Rectangle;
    private text: BBCodeText;

    // Phaser 4.2.1時点でRectangle shapeのstroke描画に対角線が入るバグがあるため、
    // actor_name_boxのみGraphicsで矩形を描画する
    private actor_name_box: Phaser.GameObjects.Graphics;
    private actor_name_box_x: number;
    private actor_name_box_y: number;
    private actor_name_box_height: number;
    private actor_name_box_fill_color: number = 0x000000;
    private actor_name_box_fill_alpha: number = 1.0;
    private actor_name_text: BBCodeText;

    private padding: number;

    constructor(
        public scene: Phaser.Scene,
        { x, y, width, height, padding = 20, margin = 0, text_style = {} }: MessageDialogConfig,
    ) {
        // Phaser.GameObjects.Containerのコンストラクタ
        super(scene, 0, 0);

        // 白枠付きの黒いRectangleを作成
        this.box = new Phaser.GameObjects.Rectangle(this.scene, x, y, width, height, 0x000000).setStrokeStyle(
            1,
            0xffffff,
        );
        this.add(this.box); // Containerへの追加

        // BBCodeTextの[u]タグはデフォルトスタイルのunderline設定を有効化するだけのトグルであり、
        // underlineThicknessをベース側で指定しないと太さ0（非表示）になるため、共通のデフォルト値を用意する
        const default_underline_style: BBCodeText.TextStyle = {
            underline: { color: "#ffffff", thickness: 2, offset: 2 },
        };

        // 折り返し設定を追加した会話テキスト用のTextStyleを作成
        // wrap.mode: 'char'を指定することで日本語のような単語区切りのない言語でも折り返しが有効になる
        // text_styleはPhaser標準のTextStyle型で受け取っているが、実際にはfontFamily/fontSize等の
        // BBCodeText.TextStyleと共通のプロパティのみが渡される想定のためキャストする
        const dialog_box_text_style = {
            ...default_underline_style,
            ...(text_style as BBCodeText.TextStyle),
            wrap: { mode: "char" as const, width: width - padding * 2 },
        };

        // 会話テキスト用のBBCodeTextを作成（[b]太字[/b], [u]下線[/u]等のタグで部分装飾可能）
        this.text = new BBCodeText(
            this.scene,
            x - width / 2 + padding,
            y - height / 2 + padding,
            "",
            dialog_box_text_style,
        );
        this.add(this.text); // Containerへの追加

        // 高さ40の白枠付きの黒いRectangleを作成（左下座標を保持しておく）
        this.actor_name_box_x = x - width / 2;
        this.actor_name_box_y = y - height / 2 - margin;
        this.actor_name_box_height = 40;
        this.actor_name_box = new Phaser.GameObjects.Graphics(this.scene);
        this.actor_name_box.setVisible(false); // 初期状態では非表示
        this.add(this.actor_name_box); // Containerへの追加

        // 名前テキスト用のBBCodeTextを作成
        this.actor_name_text = new BBCodeText(this.scene, x - width / 2 + padding, y - height / 2 - margin - 20, "", {
            ...default_underline_style,
            ...(text_style as BBCodeText.TextStyle),
        });
        this.actor_name_text.setOrigin(0, 0.5); // 原点を左中に設定
        this.actor_name_text.setVisible(false); // 初期状態では非表示
        this.add(this.actor_name_text); // Containerへの追加

        this.padding = padding;
    }

    // 会話テキストのセット
    public setText(text: string) {
        this.text.setText(text);
        this.box.setVisible(true);
        this.text.setVisible(true);
    }

    // 会話テキストのクリア（非表示）
    public clearText() {
        this.box.setVisible(false);
        this.text.setVisible(false);
    }

    // actor_name_boxをGraphicsで描き直す（左下原点相当になるようY座標を調整）
    private redrawActorNameBox(boxWidth: number) {
        const box_top_y = this.actor_name_box_y - this.actor_name_box_height;

        this.actor_name_box.clear();
        this.actor_name_box.fillStyle(this.actor_name_box_fill_color, this.actor_name_box_fill_alpha);
        this.actor_name_box.fillRect(this.actor_name_box_x, box_top_y, boxWidth, this.actor_name_box_height);
        this.actor_name_box.lineStyle(1, 0xffffff, 1);
        this.actor_name_box.strokeRect(this.actor_name_box_x, box_top_y, boxWidth, this.actor_name_box_height);
    }

    // 名前テキストのセット
    public setActorNameText(name: string) {
        this.actor_name_text.setText(name);

        // Textの幅に合わせてBoxの幅を調整
        const bounds = this.actor_name_text.getBounds();
        this.redrawActorNameBox(bounds.width + this.padding * 2);

        // BoxとTextを表示
        this.actor_name_box.setVisible(true);
        this.actor_name_text.setVisible(true);
    }

    // 名前のクリア（非表示）
    public clearActorNameText() {
        // BoxとTextを非表示
        this.actor_name_box.setVisible(false);
        this.actor_name_text.setVisible(false);
    }
    // テキストボックスの背景色を変更するメソッド
    public setActorBoxFillColor(color: string = "#000000", alpha: number = 1.0) {
        this.actor_name_box_fill_color = Phaser.Display.Color.HexStringToColor(color).color;
        this.actor_name_box_fill_alpha = alpha;

        // 既に描画済みの幅を維持したまま塗り直す
        const bounds = this.actor_name_text.getBounds();
        this.redrawActorNameBox(bounds.width + this.padding * 2);
    }

    // MessageDialogクラスに追加するメソッド
    // BBCodeタグ（[b][/b]等）を含むtextでも、タグが壊れないよう可視文字単位でタイピング表示する
    public setTextWithTypingEffect(text: string, delay: number = 100): Phaser.Time.TimerEvent {
        this.text.setText(text); // タグを解析させるため一旦全文をセット
        const plain_chars = [...this.text.getPlainText()]; // 絵文字を正しく分割
        this.text.setText(""); // 表示は空文字から開始
        this.box.setVisible(true);
        this.text.setVisible(true);

        let index = 0;
        const timer = this.scene.time.addEvent({
            delay: delay,
            callback: () => {
                index++;
                // 可視文字数indexまでを、タグを保ったまま部分表示する
                this.text.setText(this.text.getSubString(text, 0, index));
                if (index >= plain_chars.length) {
                    timer.destroy(); // タイマーを破棄
                }
            },
            loop: true,
        });

        // シーン破棄時にタイマーを破棄
        this.scene.events.once("shutdown", () => {
            timer.destroy();
        });

        return timer; // タイマーを返す
    }

    // テキストボックスの背景色を変更するメソッド
    public setTextBoxFillColor(color: string = "#000000", alpha: number = 1.0) {
        this.box.setFillStyle(Phaser.Display.Color.HexStringToColor(color).color, alpha);
    }
}
