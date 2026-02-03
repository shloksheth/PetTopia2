class ShopScreen extends Phaser.Scene {
    constructor() {
        super("ShopScreen");
    }

    create() {
        // Top bar
        this.topbar = new TopBar(this);
        this.topbar.updateUI(100, 5);

        // Title
        this.add.text(200, 200, "SHOP SCREEN", {
            fontSize: "48px",
            color: "#ffffff"
        });

        // Back button
        const backBtn = this.add.rectangle(360, 500, 300, 100, 0xff5555)
            .setInteractive();

        this.add.text(280, 470, "Back to Home", {
            fontSize: "36px",
            color: "#ffffff"
        });

        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
    }
}
