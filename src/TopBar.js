class TopBar {
    constructor(scene, data) {
        this.scene = scene;
        this.data = data;
        this.popupVisible = false;

        this.createBar();
        this.createCounters();
        this.createSettingsPopup();
    }

    createBar() {
        const { width } = this.scene.scale;

        // Orange background bar
        this.scene.add.rectangle(0, 0, width, 120, 0xffa500)
            .setOrigin(0)
            .setDepth(10);
    }

    createCounters() {
        const { scene, data } = this;

        // Coin icon + text
        scene.add.image(40, 60, "coin_icon")
            .setOrigin(0.5)
            .setDisplaySize(48, 48)
            .setDepth(11);

        this.coinText = scene.add.text(80, 60, data.coins.toString(), {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0, 0.5).setDepth(11);

        // Gem icon + text
        scene.add.image(200, 60, "gem_icon")
            .setOrigin(0.5)
            .setDisplaySize(48, 48)
            .setDepth(11);

        this.gemText = scene.add.text(240, 60, data.gems.toString(), {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0, 0.5).setDepth(11);

        // Gear icon (settings)
        this.gear = scene.add.text(scene.scale.width - 60, 60, "⚙️", {
            fontSize: "40px",
            fontFamily: "Arial",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });

        this.gear.on("pointerdown", () => this.togglePopup());
    }

    updateCounters(newData) {
        this.animateText(this.coinText, parseInt(this.coinText.text), newData.coins);
        this.animateText(this.gemText, parseInt(this.gemText.text), newData.gems);
    }

    updateCoins(newAmount) {
        this.animateText(this.coinText, parseInt(this.coinText.text), newAmount);
    }

    animateText(textObj, from, to) {
        this.scene.tweens.addCounter({
            from,
            to,
            duration: 500,
            onUpdate: tween => {
                textObj.setText(Math.floor(tween.getValue()).toString());
            }
        });
    }

    createSettingsPopup() {
        const { scene } = this;
        const x = scene.scale.width - 60;
        const y = 100;

        this.popupBg = scene.add.rectangle(x, y, 140, 120, 0x222222, 0.95)
            .setOrigin(1, 0)
            .setStrokeStyle(2, 0xffffff)
            .setVisible(false)
            .setDepth(20);

        const options = ["Settings", "Help", "Exit"];
        this.popupItems = options.map((label, i) => {
            const item = scene.add.text(x - 130, y + 10 + i * 35, label, {
                fontSize: "22px",
                fontStyle: "bold",
                color: "#ffffff",
                backgroundColor: "#444",
                padding: { x: 10, y: 4 }
            }).setOrigin(0, 0).setInteractive({ useHandCursor: true })
                .setVisible(false).setDepth(21);

            item.on("pointerdown", () => {
                this.hidePopup();
                if (label === "Exit") {
                    scene.game.destroy(true);
                } else if (label === "Help") {
                    alert("This is a pet care game. Feed, play, and keep your pet happy!");
                } else if (label === "Settings") {
                    alert("Settings menu coming soon!");
                }
            });

            return item;
        });
    }

    togglePopup() {
        this.popupVisible = !this.popupVisible;
        this.popupBg.setVisible(this.popupVisible);
        this.popupItems.forEach(item => item.setVisible(this.popupVisible));
    }

    hidePopup() {
        this.popupVisible = false;
        this.popupBg.setVisible(false);
        this.popupItems.forEach(item => item.setVisible(false));
    }
}
