class HomeScreen extends Phaser.Scene {
    constructor() {
        super("HomeScreen");
    }

    create() {
        // Top bar
        this.topbar = new TopBar(this);
        this.topbar.updateUI(100, 5);

        // Title
        this.add.text(180, 200, "HOME SCREEN", {
            fontSize: "48px",
            color: "#ffffff"
        });

        // Shop button background
        const shopBtn = this.add.rectangle(360, 500, 300, 100, 0x4a90e2)
            .setInteractive({ useHandCursor: true });

        // Shop button text
        this.add.text(300, 470, "Go to Shop", {
            fontSize: "36px",
            color: "#ffffff"
        });

        // Button click → go to ShopScreen
        shopBtn.on("pointerdown", () => {
            this.scene.start("ShopScreen");
        });
    }
}
