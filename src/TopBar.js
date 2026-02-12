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

        this.scene.add.image(width / 2, 60, "topbar_bg")
            .setOrigin(0.5)
            .setDisplaySize(width + 36000, 350)
            .setDepth(9); // Behind all icons and text


    }


    createCounters() {
        const { scene, data } = this;

        // Coin Box
        const coinBox = scene.add.image(100, 60, "orange_box")
            .setOrigin(0.5)
            .setDisplaySize(140, 60) // compact and slightly taller
            .setDepth(11);

        scene.add.image(70, 60, "coin_icon")
            .setOrigin(0.5)
            .setDisplaySize(36, 36)
            .setDepth(12);

        this.coinText = scene.add.text(105, 60, data.coins.toString(), {
            fontSize: "26px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0, 0.5).setDepth(12);

        // Gem Box
        const gemBox = scene.add.image(270, 60, "orange_box")
            .setOrigin(0.5)
            .setDisplaySize(140, 60)
            .setDepth(11);

        scene.add.image(230, 60, "gem_icon")
            .setOrigin(0.5)
            .setDisplaySize(58, 58)
            .setDepth(12);

        this.gemText = scene.add.text(250, 60, data.gems.toString(), {
            fontSize: "26px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0, 0.5).setDepth(12);

        // Notifications Box
        const notifyBox = scene.add.image(scene.scale.width - 145, 60, "orange_box")
            .setOrigin(0.5)
            .setDisplaySize(70, 60)
            .setDepth(11);

        this.notify = scene.add.text(scene.scale.width - 145, 60, "🔔", {
            fontSize: "28px",
            fontFamily: "Arial",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });

        this.notify.on("pointerdown", () => this.showTasksPopup());

        // Gear Box
        const gearBox = scene.add.image(scene.scale.width - 60, 60, "orange_box")
            .setOrigin(0.5)
            .setDisplaySize(70, 60)
            .setDepth(11);

        this.gear = scene.add.text(scene.scale.width - 60, 60, "⚙️", {
            fontSize: "30px",
            fontFamily: "Arial",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: true });

        this.gear.on("pointerdown", () => this.togglePopup());

    }




    updateCounters(newData) {
        if (!newData) return;
        if (newData.coins !== undefined) this.animateText(this.coinText, parseInt(this.coinText.text), newData.coins);
        if (newData.gems !== undefined) this.animateText(this.gemText, parseInt(this.gemText.text), newData.gems);
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

    getActiveTasks() {
        const pet = GameData.getActivePet();
        if (!pet) return [];

        const tasks = [];
        if (Number(pet.hunger ?? 0) < 65) tasks.push("🍽️ Feed");
        if (Number(pet.water ?? 0) < 65) tasks.push("🥤 Drink");
        if (Number(pet.happiness ?? 0) < 65) tasks.push("🎾 Play");
        if (Number(pet.cleanliness ?? 100) < 65) tasks.push("🧽 Clean");
        if (Number(pet.health ?? 0) < 65) tasks.push("🏥 Vet");
        return tasks;
    }

    createTasksPanel(scene, elements, config = {}) {
        const tasks = this.getActiveTasks();
        const panelX = config.x ?? 360;
        const panelY = config.y ?? 260;
        const panelWidth = config.width ?? 560;
        const panelHeight = config.height ?? 110;
        const depthBase = config.depthBase ?? 52;

        const panel = scene.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x131820, 0.95)
            .setStrokeStyle(2, 0x00d1ff)
            .setDepth(depthBase);

        const titleX = panelX - panelWidth / 2 + 20;
        const title = scene.add.text(titleX, panelY - 36, "Active Tasks", {
            fontSize: "22px",
            fontFamily: "Trebuchet MS",
            color: "#9fe6ff"
        }).setOrigin(0, 0.5).setDepth(depthBase + 1);

        elements.push(panel, title);

        if (tasks.length === 0) {
            const empty = scene.add.text(panelX, panelY + 8, "All clear. Your pet is doing great!", {
                fontSize: "20px",
                fontFamily: "Trebuchet MS",
                color: "#a6ffcf"
            }).setOrigin(0.5).setDepth(depthBase + 1);
            elements.push(empty);
            return;
        }

        const maxWidth = panelWidth - 40;
        let startX = panelX - maxWidth / 2 + 10;
        let startY = panelY + 6;
        let lineY = startY;
        let lineX = startX;

        tasks.forEach(task => {
            const chipText = scene.add.text(0, 0, task, {
                fontSize: "18px",
                fontFamily: "Trebuchet MS",
                color: "#0b141a"
            }).setOrigin(0, 0.5);

            const paddingX = 12;
            const paddingY = 6;
            const chipWidth = chipText.width + paddingX * 2;
            const chipHeight = chipText.height + paddingY * 2;

            if (lineX + chipWidth > panelX + maxWidth / 2) {
                lineX = startX;
                lineY += chipHeight + 10;
            }

            const chipBg = scene.add.rectangle(lineX + chipWidth / 2, lineY, chipWidth, chipHeight, 0x9fe6ff, 0.9)
                .setStrokeStyle(1, 0x0b141a)
                .setDepth(depthBase + 1);

            chipText.setPosition(lineX + paddingX, lineY);
            chipText.setDepth(depthBase + 2);

            elements.push(chipBg, chipText);
            lineX += chipWidth + 10;
        });
    }
    createTopBarBox(x, y, iconKey, text, textStyle = {}) {
        const container = this.add.container(x, y);

        const box = this.add.image(0, 0, "orange_box")
            .setOrigin(0.5)
            .setDisplaySize(180, 80); // Adjust size as needed

        const icon = this.add.image(-50, 0, iconKey)
            .setScale(0.5)
            .setOrigin(0.5);

        const label = this.add.text(20, 0, text, {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3,
            ...textStyle
        }).setOrigin(0, 0.5);

        container.add([box, icon, label]);
        return container;
    }

    showTasksPopup() {
        const { scene } = this;

        const overlay = scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.55)
            .setDepth(60)
            .setInteractive();

        const panel = scene.add.rectangle(360, 640, 620, 340, 0x15222b, 0.97)
            .setStrokeStyle(3, 0x00d1ff)
            .setDepth(61);

        const title = scene.add.text(360, 470, "Notifications", {
            fontSize: "40px",
            fontFamily: "Trebuchet MS",
            color: "#e8f7ff"
        }).setOrigin(0.5).setDepth(62);

        const elements = [overlay, panel, title];
        this.createTasksPanel(scene, elements, { x: 360, y: 620, width: 560, height: 140, depthBase: 62 });

        const closeBtn = scene.add.text(360, 770, "Close", {
            fontSize: "28px",
            fontFamily: "Trebuchet MS",
            color: "#0b141a",
            backgroundColor: "#7bdfff",
            padding: { x: 22, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(62);

        elements.push(closeBtn);

        const closeAll = () => {
            elements.forEach(el => el.destroy());
        };

        closeBtn.on("pointerdown", closeAll);
        overlay.on("pointerdown", closeAll);

        elements.forEach(el => el.setAlpha(0));
        scene.tweens.add({
            targets: elements,
            alpha: 1,
            duration: 220,
            ease: "Sine.easeOut"
        });
    }

    createSettingsPopup() {
        const { scene } = this;
        const x = scene.scale.width - 60;
        const y = 100;

        this.popupBg = scene.add.rectangle(x, y, 160, 245, 0x222222, 0.95)
            .setOrigin(1, 0)
            .setStrokeStyle(2, 0xffffff)
            .setVisible(false)
            .setDepth(20);

        const options = ["Settings", "Credits", "Help", "Debug", "Exit"];
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
                } else if (label === "Debug") {
                    this.showDebugDialog();
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
    showDebugDialog() {
        const { scene } = this;

        const overlay = scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6)
            .setDepth(70)
            .setInteractive();

        const panel = scene.add.rectangle(360, 640, 500, 400, 0x222222, 0.95)
            .setStrokeStyle(4, 0xffffff)
            .setDepth(71);

        const title = scene.add.text(360, 500, "Debug Panel", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5).setDepth(72);

        const coinLabel = scene.add.text(200, 580, "Coins:", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0, 0.5).setDepth(72);

        const coinInput = scene.add.dom(400, 580).createFromHTML(`
        <input type="number" id="coinInput" value="${GameData.coins}" style="
            font-size: 24px;
            padding: 6px;
            width: 120px;
            border-radius: 6px;
            border: none;
            text-align: center;
        ">
    `).setOrigin(0.5).setDepth(1000); // Ensure it's above everything

        const gemLabel = scene.add.text(200, 640, "Gems:", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0, 0.5).setDepth(72);

        const gemInput = scene.add.dom(400, 640).createFromHTML(`
        <input type="number" id="gemInput" value="${GameData.gems}" style="
            font-size: 24px;
            padding: 6px;
            width: 120px;
            border-radius: 6px;
            border: none;
            text-align: center;
        ">
    `).setOrigin(0.5).setDepth(1000);

        const okBtn = scene.add.text(360, 720, "OK", {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#00ff88",
            backgroundColor: "#000",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(72);

        okBtn.on("pointerdown", () => {
            const coinField = coinInput.getChildByID("coinInput");
            const gemField = gemInput.getChildByProperty("id", "gemInput");

            if (!coinField || !gemField) {
                console.warn("Input fields not found.");
                return;
            }

            const coins = parseInt(coinField.value);
            const gems = parseInt(gemField.value);

            if (!isNaN(coins)) GameData.coins = coins;
            if (!isNaN(gems)) GameData.gems = gems;

            GameData.save();
            this.scene.registry.events.emit("update-stats", {
                coins: GameData.coins,
                gems: GameData.gems
            });

            [overlay, panel, title, coinLabel, coinInput, gemLabel, gemInput, okBtn].forEach(el => el.destroy());
        });

    }


    showSettingsMenu() {
        const { scene } = this;
        const overlay = scene.add.rectangle(360, 660, 720, 1280, 0x000000, 0.6)
            .setDepth(50)
            .setInteractive();

        const panel = scene.add.rectangle(360, 520, 600, 720, 0x222222, 0.95)
            .setStrokeStyle(4, 0xffffff)
            .setDepth(51);

        const title = scene.add.text(360, 210, "Settings", {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(52);

        const elements = [];
        let y = 310;
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