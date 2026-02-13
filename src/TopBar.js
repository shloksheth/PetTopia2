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
        const scene = this.scene;
        if (!GameData.settings) {
            GameData.settings = { useScrollingBar: false };
            GameData.save();
        }

        const overlay = scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6)
            .setDepth(200)
            .setInteractive();

        const panel = scene.add.rectangle(360, 640, 520, 820, 0x0f1620, 0.98)
            .setStrokeStyle(3, 0x00d1ff)
            .setDepth(201);

        const title = scene.add.text(360, 300, "Settings", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#e8f7ff"
        }).setOrigin(0.5).setDepth(202);

        const elements = [overlay, panel, title];

        let y = 360;
        const leftX = 210;

        elements.push(...this.createSettingToggle(scene, leftX, y, 'music', "Music", GameData.settings.music ?? true));
        y += 75;
        elements.push(...this.createSettingToggle(scene, leftX, y, 'sfx', "SFX", GameData.settings.sfx ?? true));
        y += 75;

        // English/Español language selection
        const langSelectLabel = scene.add.text(leftX, y, "Language:", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0, 0.5).setDepth(202);
        
        const engBtn = scene.add.rectangle(435, y, 100, 50, 
            GameData.settings.language === "English" ? 0x00ff88 : 0x333333, 0.95)
            .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true }).setDepth(202);
        const engLabel = scene.add.text(435, y, "English", {
            fontSize: "20px",
            fontFamily: "Arial Black",
            color: GameData.settings.language === "English" ? "#000000" : "#ffffff"
        }).setOrigin(0.5).setDepth(203);
        
        const espBtn = scene.add.rectangle(550, y, 100, 50,
            GameData.settings.language === "Español" ? 0x00ff88 : 0x333333, 0.95)
            .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true }).setDepth(202);
        const espLabel = scene.add.text(550, y, "Español", {
            fontSize: "20px",
            fontFamily: "Arial Black",
            color: GameData.settings.language === "Español" ? "#000000" : "#ffffff"
        }).setOrigin(0.5).setDepth(203);
        
        engBtn.on("pointerdown", () => {
            GameData.settings.language = "English";
            engBtn.setFillStyle(0x00ff88);
            espBtn.setFillStyle(0x333333);
            engLabel.setColor("#000000");
            espLabel.setColor("#ffffff");
            GameData.save();
            scene.game.events.emit("language-changed", "English");
        });
        
        espBtn.on("pointerdown", () => {
            GameData.settings.language = "Español";
            espBtn.setFillStyle(0x00ff88);
            engBtn.setFillStyle(0x333333);
            espLabel.setColor("#000000");
            engLabel.setColor("#ffffff");
            GameData.save();
            scene.game.events.emit("language-changed", "Español");
        });
        
        elements.push(langSelectLabel, engBtn, engLabel, espBtn, espLabel);
        y += 35;

        const [fsLabel, fsToggle] = this.createToggle(scene, leftX, y, "Fullscreen", scene.scale.isFullscreen);
        fsToggle.on("pointerdown", () => {
            const isOn = scene.scale.isFullscreen;
            if (isOn) scene.scale.stopFullscreen();
            else scene.scale.startFullscreen();
            const newText = isOn ? "Off" : "On";
            fsToggle.setText(newText);
            if (!GameData.settings) GameData.settings = {};
            GameData.settings.fullscreen = !isOn;
            GameData.save();
        });
        elements.push(fsLabel, fsToggle);
        y += 35;

        const textSizeLabel = scene.add.text(leftX, y, "Text Size:", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0, 0.5).setDepth(202);
        const textSizeToggle = scene.add.text(510, y, GameData.settings.textSize || "Normal", {
            fontSize: "26px",
            fontFamily: "Arial Black",
            color: "#00ccff",
            backgroundColor: "#061018",
            padding: { x: 14, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(202);
        textSizeToggle.on("pointerdown", () => {
            const newSize = textSizeToggle.text === "Normal" ? "Large" : "Normal";
            textSizeToggle.setText(newSize);
            if (!GameData.settings) GameData.settings = {};
            GameData.settings.textSize = newSize;
            GameData.save();
        });
        elements.push(textSizeLabel, textSizeToggle);
        y += 60;

        elements.push(...this.createToggle(scene, leftX, y, "High Contrast", GameData.settings.highContrast ?? false));
        y += 30;

        const resetBtn = scene.add.text(360, y+50, "Reset Game Progress", {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#ff8888",
            backgroundColor: "#061018",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(202);
        resetBtn.on("pointerdown", () => {
            if (confirm("Are you sure you want to reset all progress?")) {
                GameData.reset();
                location.reload();
            }
        });
        elements.push(resetBtn);

        // Bottom style selector
        const barStyleY = 830;
        const barStyleLabel = scene.add.text(360, barStyleY - 30, "Bottom Bar Style", {
            fontSize: "22px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5).setDepth(202);

        const classicBtn = scene.add.rectangle(240, barStyleY + 30, 140, 60,
            !GameData.settings.useScrollingBar ? 0x00ff88 : 0x333333, 0.95)
            .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true }).setDepth(202);
        const classicLabel = scene.add.text(240, barStyleY + 30, "Classic\n(5 buttons)", {
            fontSize: "16px",
            fontFamily: "Arial Black",
            color: !GameData.settings.useScrollingBar ? "#000000" : "#ffffff",
            align: "center"
        }).setOrigin(0.5).setDepth(203);

        const scrollingBtn = scene.add.rectangle(480, barStyleY + 30, 140, 60,
            GameData.settings.useScrollingBar ? 0x00ff88 : 0x333333, 0.95)
            .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true }).setDepth(202);
        const scrollingLabel = scene.add.text(480, barStyleY + 30, "Scrolling\n(All buttons)", {
            fontSize: "16px",
            fontFamily: "Arial Black",
            color: GameData.settings.useScrollingBar ? "#000000" : "#ffffff",
            align: "center"
        }).setOrigin(0.5).setDepth(203);

        classicBtn.on("pointerdown", () => {
            GameData.settings.useScrollingBar = false;
            GameData.save();
            setTimeout(() => scene.scene.restart(), 60);
            elements.forEach(el => el.destroy());
        });

        scrollingBtn.on("pointerdown", () => {
            GameData.settings.useScrollingBar = true;
            GameData.save();
            setTimeout(() => scene.scene.restart(), 60);
            elements.forEach(el => el.destroy());
        });

        const closeBtn = scene.add.text(360, 960, "Close", {
            fontSize: "26px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#444",
            padding: { x: 24, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(202);
        closeBtn.on("pointerdown", () => elements.forEach(el => el.destroy()));

        elements.push(barStyleLabel, classicBtn, classicLabel, scrollingBtn, scrollingLabel, closeBtn);
    }

    showCreditsPopup() {
        const { scene } = this;

        const overlay = scene.add.rectangle(360, 740, 720, 1280, 0x000000, 0.6)
            .setDepth(60)
            .setInteractive();

        const panel = scene.add.rectangle(360, 740, 700, 620, 0x222222, 0.95)
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

    createSettingToggle(scene, x, y, key, labelText, initialState) {
        const label = scene.add.text(x, y, labelText, {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0, 0.5).setDepth(202);

        const rect = scene.add.rectangle(x + 260, y, 120, 42, initialState ? 0x00ff88 : 0x333333, 0.95)
            .setOrigin(0.5)
            .setDepth(202)
            .setInteractive({ useHandCursor: true });

        const txt = scene.add.text(x + 260, y, initialState ? "On" : "Off", {
            fontSize: "22px",
            fontFamily: "Arial Black",
            color: initialState ? "#000000" : "#ffffff"
        }).setOrigin(0.5).setDepth(203);

        rect.on("pointerdown", () => {
            const newState = !Boolean(GameData.settings?.[key]);
            if (!GameData.settings) GameData.settings = {};
            GameData.settings[key] = newState;
            GameData.save();
            rect.setFillStyle(newState ? 0x00ff88 : 0x333333);
            txt.setText(newState ? "On" : "Off");
            txt.setColor(newState ? "#000000" : "#ffffff");
        });

        return [label, rect, txt];
    }
}

// Ensure TopBar is globally available
window.TopBar = TopBar;