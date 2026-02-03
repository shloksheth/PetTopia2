class TopBar {
    constructor(scene, data) {
        this.scene = scene;
        this.data = data;

        this.bg = scene.add.rectangle(0, 0, 720, 140, 0x000000, 0.35)
            .setOrigin(0);

        this.nameText = scene.add.text(30, 20, data.name, {
            fontSize: "48px",
            color: "#ffffff"
        })
        .setInteractive({ useHandCursor: true });

        this.nameText.on("pointerdown", () => {
            scene.showRenameUI();
        });

        this.coinIcon = scene.add.image(30, 90, "coin_icon").setScale(0.5);
        this.coinText = scene.add.text(90, 70, data.coins, {
            fontSize: "40px",
            color: "#ffffff"
        });

        this.gemIcon = scene.add.image(220, 90, "gem_icon").setScale(0.5);
        this.gemText = scene.add.text(280, 70, data.gems, {
            fontSize: "40px",
            color: "#ffffff"
        });
    }

    refresh() {
        this.coinText.setText(this.data.coins);
        this.gemText.setText(this.data.gems);
        this.nameText.setText(this.data.name);
    }
}
