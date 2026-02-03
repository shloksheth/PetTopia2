class ShopScreen extends Phaser.Scene {
    constructor() {
        super("ShopScreen");
    }

    preload() {
        this.load.image("button", "assets/icons/button.png");
    }

    create() {
        this.add.text(200, 200, "SHOP SCREEN", {
            fontSize: "48px",
            color: "#ffffff"
        });

        const backBtn = this.add.image(360, 1100, "button")
            .setInteractive({ useHandCursor: true })
            .setScale(1.2);

        this.add.text(300, 1070, "Back", {
            fontSize: "40px",
            color: "#ffffff"
        });

        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
    }
}
