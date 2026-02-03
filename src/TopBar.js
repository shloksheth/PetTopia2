class TopBar {
    constructor(scene) {
        this.scene = scene;

        // Background bar
        this.bar = scene.add.rectangle(0, 0, 720, 120, 0x000000, 0.4)
            .setOrigin(0);

        // Coins
        this.coinText = scene.add.text(20, 30, "Coins: 100", {
            fontSize: "32px",
            color: "#ffffff"
        });

        // Gems
        this.gemText = scene.add.text(20, 70, "Gems: 5", {
            fontSize: "32px",
            color: "#ffffff"
        });
    }

    updateUI(coins, gems) {
        this.coinText.setText("Coins: " + coins);
        this.gemText.setText("Gems: " + gems);
    }
}
