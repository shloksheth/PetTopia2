class TopBar {
    constructor(scene) {
        this.scene = scene;

        // Background bar
        this.bar = scene.add.rectangle(0, 0, 720, 120, 0x333333)
            .setOrigin(0);

        // Coins
        this.coinText = scene.add.text(20, 30, "Coins: 0", {
            fontSize: "32px",
            color: "#ffffff"
        });

        // Gems
        this.gemText = scene.add.text(20, 70, "Gems: 0", {
            fontSize: "32px",
            color: "#ffffff"
        });

        // Settings button
        this.settingsBtn = scene.add.text(600, 40, "⚙️", {
            fontSize: "48px",
            color: "#ffffff"
        })
        .setInteractive()
        .on("pointerdown", () => this.openSettings());
    }

    updateUI(coins, gems) {
        this.coinText.setText("Coins: " + coins);
        this.gemText.setText("Gems: " + gems);
    }

    openSettings() {
        alert("Settings menu coming soon");
    }
}
