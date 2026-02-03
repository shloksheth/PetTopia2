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

        // Back button background
        const backBtn = this.add.rectangle(360, 500, 300, 100, 0xe94e4e)
            .setInteractive({ useHandCursor: true });

        // Back button text
        this.add.text(260, 470, "Back to Home", {
            fontSize: "36px",
            color: "#ffffff"
        });

        // Button click → go back to HomeScreen
        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
    }
}
