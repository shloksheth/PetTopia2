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
        this.scene.add.rectangle(0, 0, width, 120, 0xffa500)
            .setOrigin(0)
            .setDepth(10);
    }

    createCounters() {
        const { scene, data } = this;

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

        this.popupBg = scene.add.rectangle(x, y, 160, 200, 0x222222, 0.95)
            .setOrigin(1, 0)
            .setStrokeStyle(2, 0xffffff)
            .setVisible(false)
            .setDepth(20);

        const options = ["Settings", "Credits", "Help", "Exit"];
        this.popupItems = options.map((label, i) => {
            const item = scene.add.text(x - 150, y + 10 + i * 45, label, {
                fontSize: "26px",
                fontFamily: "Arial Black",
                color: "#ffffff",
                backgroundColor: "#444",
                padding: { x: 12, y: 6 }
            }).setOrigin(0, 0).setInteractive({ useHandCursor: true })
                .setVisible(false).setDepth(21);

            item.on("pointerdown", () => {
                this.hidePopup();
                if (label === "Settings") {
                    this.showSettingsMenu();
                } else if (label === "Credits") {
                    this.showCreditsPopup();
                } else if (label === "Help") {
                    alert("This is a pet care game. Feed, play, and keep your pet happy!");
                } else if (label === "Exit") {
                    scene.game.destroy(true);
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
    showSettingsMenu() {
        const { scene } = this;
        const overlay = scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6)
            .setDepth(50)
            .setInteractive();

        const panel = scene.add.rectangle(360, 640, 600, 720, 0x222222, 0.95)
            .setStrokeStyle(4, 0xffffff)
            .setDepth(51);

        const title = scene.add.text(360, 200, "Settings", {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(52);

        const elements = [];
        let y = 280;
        const spacing = 70;

        // Music
        elements.push(...this.createToggle(scene, 160, y, "Music", true));
        y += spacing;

        // SFX
        elements.push(...this.createToggle(scene, 160, y, "SFX", true));
        y += spacing;

        // Language
        const langLabel = scene.add.text(160, y, "Language:", {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0, 0.5).setDepth(52);
        const langToggle = scene.add.text(460, y, "English", {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#00ccff",
            backgroundColor: "#000",
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(52);
        langToggle.on("pointerdown", () => {
            langToggle.setText(langToggle.text === "English" ? "Español" : "English");
        });
        elements.push(langLabel, langToggle);
        y += spacing;

        // Fullscreen
        const [fsLabel, fsToggle] = this.createToggle(scene, 160, y, "Fullscreen", scene.scale.isFullscreen);
        fsToggle.on("pointerdown", () => {
            const isOn = scene.scale.isFullscreen;
            if (isOn) scene.scale.stopFullscreen();
            else scene.scale.startFullscreen();
            fsToggle.setText(isOn ? "Off" : "On");
        });
        elements.push(fsLabel, fsToggle);
        y += spacing;

        // Text Size
        const textSizeLabel = scene.add.text(160, y, "Text Size:", {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0, 0.5).setDepth(52);
        const textSizeToggle = scene.add.text(460, y, "Normal", {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#00ccff",
            backgroundColor: "#000",
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(52);
        textSizeToggle.on("pointerdown", () => {
            textSizeToggle.setText(textSizeToggle.text === "Normal" ? "Large" : "Normal");
        });
        elements.push(textSizeLabel, textSizeToggle);
        y += spacing;

        // Reset
        const resetBtn = scene.add.text(360, y, "Reset Game Progress", {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#ff4444",
            backgroundColor: "#000",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(52);
        resetBtn.on("pointerdown", () => {
            if (confirm("Are you sure you want to reset all progress?")) {
                GameData.reset();
                location.reload();
            }
        });
        elements.push(resetBtn);
        y += spacing;

        // High Contrast
        elements.push(...this.createToggle(scene, 160, y, "High Contrast", false));
        y += spacing;

        // Close
        const closeBtn = scene.add.text(360, y, "Close", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#444",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(52);
        closeBtn.on("pointerdown", () => {
            [overlay, panel, title, closeBtn, ...elements].forEach(el => el.destroy());
        });
        elements.push(closeBtn);
    }


    showCreditsPopup() {
        const { scene } = this;

        const overlay = scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6)
            .setDepth(60)
            .setInteractive();

        const panel = scene.add.rectangle(360, 640, 500, 300, 0x222222, 0.95)
            .setStrokeStyle(4, 0xffffff)
            .setDepth(61);

        const title = scene.add.text(360, 560, "Credits", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(62);

        const names = scene.add.text(360, 640, "Shlok Sheth\nAditya Anil Kunnakatil", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffcc",
            align: "center"
        }).setOrigin(0.5).setDepth(62);

        const closeBtn = scene.add.text(360, 720, "Close", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#444",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(62);

        closeBtn.on("pointerdown", () => {
            [overlay, panel, title, names, closeBtn].forEach(el => el.destroy());
        });
    }

    createToggle(scene, x, y, labelText, initialState) {
        const label = scene.add.text(x, y, labelText, {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0, 0.5).setDepth(52);

        const toggle = scene.add.text(x + 180, y, initialState ? "On" : "Off", {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#00ccff",
            backgroundColor: "#000",
            padding: { x: 12, y: 6 }
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).setDepth(52);

        toggle.on("pointerdown", () => {
            const newState = toggle.text === "Off";
            toggle.setText(newState ? "On" : "Off");
        });

        return [label, toggle];
    }
}
