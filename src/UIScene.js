class UIScene extends Phaser.Scene {
        updateBottomBarColor() {
            const { width, height } = this.scale;
            const navBarHeight = 130;
            const barColor = this.registry.get('bottomBarColor') || 0xFF9000;
            if (this.navBg && this.navBg.destroy) this.navBg.destroy();
            this.navBg = this.add.rectangle(
                width / 2,
                height - (navBarHeight / 2),
                width,
                navBarHeight,
                barColor,
                0.85
            ).setOrigin(0.5).setDepth(1000).setInteractive();
        }
    constructor() {
        super({ key: "UIScene", active: true });
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        if (!this.textures.exists("orange_box")) this.load.image("orange_box", "assets/icons/orangebox.png");
        if (!this.textures.exists("topbar_bg")) this.load.image("topbar_bg", "assets/icons/topbar_gradient.png");
        if (!this.textures.exists("coin_icon")) this.load.image("coin_icon", "assets/icons/gold coin.png");;
        if (!this.textures.exists("gem_icon")) this.load.image("gem_icon", "assets/icons/gems.png");;
    }

    create() {
        GameData.load();

        this.hideHomeButton = Boolean(this.registry.get("hideHomeButton"));

        // 1. Top Bar (Currency)
        this.topBar = new TopBar(this, {
            coins: GameData.coins,
            gems: GameData.gems
        });

        // 2. Navigation & UI
        this.createBottomNav();

        // Global Event Listeners
        this.registry.events.on("update-stats", () => {
            this.topBar.updateCounters({ coins: GameData.coins, gems: GameData.gems });
        });

        // Ensure UI is always on top
        this.scene.bringToTop("UIScene");

        this.registry.events.on("toggle-home-button", (hide) => {
            this.hideHomeButton = Boolean(hide);
            this.registry.set("hideHomeButton", this.hideHomeButton);
            this.createBottomNav();
        });

        // Listen for language changes
        this._onLanguageChanged = () => {
            this.createBottomNav();
        };
        this.game.events.on("language-changed", this._onLanguageChanged);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this._onLanguageChanged) this.game.events.off("language-changed", this._onLanguageChanged);
        });
    }

    createBottomNav() {
        const { width, height } = this.scale;
        const navBarHeight = 130;
        const barColor = this.registry.get('bottomBarColor') || 0xFF9000;

        if (this.navElements) {
            this.navElements.forEach(el => el.destroy());
        }
        this.navElements = [];

        this.children.getAll().forEach(child => {
            if (child.getData && child.getData('isScrollingNavButton')) {
                child.destroy();
            }
        });

        const navBg = this.add.rectangle(
            width / 2,
            height - (navBarHeight / 2),
            width,
            navBarHeight,
            barColor,
            0.85
        ).setOrigin(0.5).setDepth(1000).setInteractive();

        this.navElements.push(navBg);

        // Add a thin white border line at the top of the bar for style
        this.add.line(0, 0, 0, height - navBarHeight, width, height - navBarHeight, 0xffffff, 8)
            .setOrigin(0)
            .setDepth(8001);
        this.navElements.push(this.children.getAt(this.children.length - 1));

        const bottomPadding = -10;
        const iconLift = 85;
        const labelLift = 35;

        // All main scenes that should be stopped when navigating
        const mainScenes = [
            "HomeScreen",
            "ShopScreen",
            "BathingScreen",
            "WardrobeScreen",
            "PlayScreen",
            "StatsScreen",
            "SleepScreen",
            "VetScreen",
            "PetPurchaseScreen",
            "PurchaseScreen",
            "StarterPetScreen"
        ];

        const stopAllScenes = () => {
            mainScenes.forEach(sceneKey => {
                if (this.scene.isActive(sceneKey)) {
                    this.scene.stop(sceneKey);
                }
            });
        };

        // Check if scrolling mode is enabled
        const useScrolling = GameData.settings && GameData.settings.useScrollingBar;

        if (useScrolling) {
            // SCROLLING MODE - All buttons with pagination
            this.createScrollingNav(width, height, bottomPadding, iconLift, labelLift, mainScenes, stopAllScenes);
        } else {
            // CLASSIC MODE - 5 main buttons
            let buttons = [
                { icon: "🐾", label: "Pets", action: () => this.openPetSwitcher() },
                { icon: "🛒", label: "Shop", action: () => { stopAllScenes(); this.scene.start("ShopScreen"); } },
                { icon: "🏠", label: "Home", action: () => { stopAllScenes(); this.scene.start("HomeScreen"); } },
                { icon: "🛁", label: "Bath", action: () => { stopAllScenes(); this.scene.start("BathingScreen"); } },
                { icon: "👚", label: "Closet", action: () => { stopAllScenes(); this.scene.start("WardrobeScreen"); } }
            ];

            if (this.hideHomeButton) {
                buttons = buttons.filter(btn => btn.label !== "Home");
            }

            buttons.forEach((btn, i) => {
                const x = (width / buttons.length) * (i + 0.5);
                const iconY = height - iconLift - bottomPadding;
                const labelY = height - labelLift - bottomPadding;

                // Circular Backdrop
                const circle = this.add.circle(x, iconY, 42, 0xffffff, 0.1)
                    .setDepth(1001)
                    .setInteractive({ useHandCursor: true });

                this.navElements.push(circle);

                // Icon Text
                const iconTxt = this.add.text(x, iconY, btn.icon, { fontSize: "48px" })
                    .setOrigin(0.5)
                    .setDepth(1002);

                this.navElements.push(iconTxt);

                // Label Text
                const labelTxt = this.add.text(x, labelY, btn.label.toUpperCase(), {
                    fontSize: "12px",
                    fontFamily: "Arial Black",
                    color: "#ffffff"
                })
                    .setOrigin(0.5)
                    .setDepth(1002);

                this.navElements.push(labelTxt);

                // Interactions
                circle.on("pointerover", () => {
                    circle.setFillStyle(0xffffff, 0.2);
                    this.tweens.add({
                        targets: [iconTxt, circle],
                        y: iconY - 12,
                        scale: 1.15,
                        duration: 200,
                        ease: 'Back.easeOut'
                    });
                });

                circle.on("pointerout", () => {
                    circle.setFillStyle(0xffffff, 0.1);
                    this.tweens.add({
                        targets: [iconTxt, circle],
                        y: iconY,
                        scale: 1.0,
                        duration: 200,
                        ease: 'Power2'
                    });
                });

                circle.on("pointerdown", () => {
                    this.tweens.add({
                        targets: [iconTxt, circle],
                        scale: 0.85,
                        duration: 80,
                        yoyo: true,
                        onComplete: btn.action
                    });
                });
            });
        }
    }

    createScrollingNav(width, height, bottomPadding, iconLift, labelLift, mainScenes, stopAllScenes) {
        // All buttons for scrolling mode
        let buttons = [
            { icon: "🐾", label: "Pets", action: () => this.openPetSwitcher() },
            { icon: "🛒", label: "Shop", action: () => { stopAllScenes(); this.scene.start("ShopScreen"); } },
            { icon: "🏠", label: "Home", action: () => { stopAllScenes(); this.scene.start("HomeScreen"); } },
            { icon: "🛁", label: "Bath", action: () => { stopAllScenes(); this.scene.start("BathingScreen"); } },
            { icon: "👚", label: "Closet", action: () => { stopAllScenes(); this.scene.start("WardrobeScreen"); } },
            { icon: "🎾", label: "Play", action: () => { stopAllScenes(); this.scene.start("PlayScreen"); } },
            { icon: "📊", label: "Stats", action: () => { stopAllScenes(); this.scene.start("StatsScreen"); } },
            { icon: "🏥", label: "Vet", action: () => { stopAllScenes(); this.scene.start("VetScreen"); } },
            { icon: "😴", label: "Sleep", action: () => { stopAllScenes(); this.scene.start("SleepScreen"); } },
            { icon: "🛍️", label: "Purchases", action: () => { stopAllScenes(); this.scene.start("PurchaseScreen"); } }
        ];

        if (this.hideHomeButton) {
            buttons = buttons.filter(btn => btn.label !== "Home");
        }

        let currentPage = 0;
        const buttonsPerPage = 3;
        const totalPages = Math.ceil(buttons.length / buttonsPerPage);

        const displayButtons = () => {
            // Clear previous scrolling buttons
            const existingButtons = this.children.getAll();
            existingButtons.forEach(child => {
                if (child.getData && child.getData('isScrollingNavButton')) {
                    child.destroy();
                }
            });

            const startIdx = currentPage * buttonsPerPage;
            const endIdx = Math.min(startIdx + buttonsPerPage, buttons.length);
            const pageButtons = buttons.slice(startIdx, endIdx);

            pageButtons.forEach((btn, i) => {
                const x = (width / pageButtons.length) * (i + 0.5);
                const iconY = height - iconLift - bottomPadding;
                const labelY = height - labelLift - bottomPadding;

                const circle = this.add.circle(x, iconY, 42, 0xffffff, 0.1)
                    .setDepth(1001)
                    .setInteractive({ useHandCursor: true })
                    .setData('isScrollingNavButton', true);

                const iconTxt = this.add.text(x, iconY, btn.icon, { fontSize: "48px" })
                    .setOrigin(0.5)
                    .setDepth(1002)
                    .setData('isScrollingNavButton', true);

                const labelTxt = this.add.text(x, labelY, btn.label.toUpperCase(), {
                    fontSize: "12px",
                    fontFamily: "Arial Black",
                    color: "#ffffff"
                })
                    .setOrigin(0.5)
                    .setDepth(1002)
                    .setData('isScrollingNavButton', true);

                circle.on("pointerover", () => {
                    circle.setFillStyle(0xffffff, 0.2);
                    this.tweens.add({
                        targets: [iconTxt, circle],
                        y: iconY - 12,
                        scale: 1.15,
                        duration: 200,
                        ease: 'Back.easeOut'
                    });
                });

                circle.on("pointerout", () => {
                    circle.setFillStyle(0xffffff, 0.1);
                    this.tweens.add({
                        targets: [iconTxt, circle],
                        y: iconY,
                        scale: 1.0,
                        duration: 200,
                        ease: 'Power2'
                    });
                });

                circle.on("pointerdown", () => {
                    this.tweens.add({
                        targets: [iconTxt, circle],
                        scale: 0.85,
                        duration: 80,
                        yoyo: true,
                        onComplete: btn.action
                    });
                });
            });

            // Update page indicator
            if (totalPages > 1) {
                this.add.text(width / 2, height - 8, `${currentPage + 1}/${totalPages}`, {
                    fontSize: "10px",
                    color: "#ffffff"
                }).setOrigin(0.5).setDepth(1002).setData('isScrollingNavButton', true);
            }
        };

        displayButtons();

        // Add left/right navigation
        if (totalPages > 1) {
            const leftArrow = this.add.text(20, height - 65, "◀", {
                fontSize: "20px",
                color: "#ffffff"
            }).setOrigin(0.5).setDepth(1002).setInteractive({ useHandCursor: true });

            leftArrow.on("pointerdown", () => {
                if (currentPage > 0) {
                    currentPage--;
                    displayButtons();
                }
            });

            const rightArrow = this.add.text(width - 20, height - 65, "▶", {
                fontSize: "20px",
                color: "#ffffff"
            }).setOrigin(0.5).setDepth(1002).setInteractive({ useHandCursor: true });

            rightArrow.on("pointerdown", () => {
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    displayButtons();
                }
            });
        }
    }

    openPetSwitcher() {
        const overlay = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6)
            .setDepth(100)
            .setInteractive();

        const panel = this.add.rectangle(360, 640, 600, 600, 0x222222, 0.95)
            .setStrokeStyle(4, 0xffffff)
            .setDepth(101);

        const title = this.add.text(460, 300, "Your Pets", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5).setDepth(102);

        const elements = [];
        const pets = GameData.pets;

        pets.forEach((pet, i) => {
            const y = 380 + i * 120;

            const box = this.add.rectangle(360, y, 500, 100, i === GameData.activePetIndex ? 0x4444aa : 0x333333, 0.9)
                .setStrokeStyle(2, 0xffffff)
                .setDepth(101);

            const nameText = this.add.text(200, y - 20, pet.name, {
                fontSize: "32px",
                fontFamily: "Arial Black",
                color: "#ffffff"
            }).setOrigin(0, 0.5).setDepth(102);

            const typeText = this.add.text(200, y + 20, pet.type.toUpperCase(), {
                fontSize: "20px",
                fontFamily: "Arial",
                color: "#cccccc"
            }).setOrigin(0, 0.5).setDepth(102);

            const switchBtn = this.add.text(500, y, "Switch", {
                fontSize: "24px",
                fontFamily: "Arial Black",
                color: "#00ccff",
                backgroundColor: "#000",
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

            switchBtn.on("pointerdown", () => {
                GameData.switchToPet(i);
                GameData.save();
                this.registry.events.emit("update-stats", { coins: GameData.coins, gems: GameData.gems });
                this.registry.events.emit("pet-switched", i);
                [overlay, panel, title, ...elements].forEach(el => el.destroy());
            });

            const removeBtn = this.add.text(500, y + 40, "Remove", {
                fontSize: "20px",
                fontFamily: "Arial Black",
                color: "#ff4444",
                backgroundColor: "#000",
                padding: { x: 10, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

            removeBtn.on("pointerdown", () => {
                const confirmOverlay = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6).setDepth(150).setInteractive();
                const confirmPanel = this.add.rectangle(360, 640, 520, 300, 0x330000, 0.95).setStrokeStyle(3, 0xff4444).setDepth(151);
                const confirmText = this.add.text(360, 580, `Remove ${pet.name}?`, { fontSize: "28px", color: "#ff4444" }).setOrigin(0.5).setDepth(152);
                const delBtn = this.add.text(300, 680, "Delete", { fontSize: "26px", backgroundColor: "#ff4444", padding: { x: 12, y: 8 } }).setOrigin(0.5).setInteractive().setDepth(152);
                const cancelBtn = this.add.text(420, 680, "Cancel", { fontSize: "26px", backgroundColor: "#444", padding: { x: 12, y: 8 } }).setOrigin(0.5).setInteractive().setDepth(152);

                delBtn.on("pointerdown", () => {
                    GameData.removePet(i);
                    GameData.save();
                    this.registry.events.emit("update-stats", { coins: GameData.coins, gems: GameData.gems });
                    this.registry.events.emit("pet-removed", i);
                    [confirmOverlay, confirmPanel, confirmText, delBtn, cancelBtn, overlay, panel, title, ...elements].forEach(el => el.destroy());
                });

                cancelBtn.on("pointerdown", () => {
                    [confirmOverlay, confirmPanel, confirmText, delBtn, cancelBtn].forEach(el => el.destroy());
                });
            });

            elements.push(box, nameText, typeText, switchBtn, removeBtn);
        });

        if (pets.length < 2) {
            const addBtn = this.add.text(360, 620, "Add Pet", {
                fontSize: "28px",
                fontFamily: "Arial Black",
                color: "#00ff88",
                backgroundColor: "#000",
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

            addBtn.on("pointerdown", () => {
                [overlay, panel, title, addBtn, ...elements].forEach(el => el.destroy());

                const aOverlay = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6).setDepth(150).setInteractive();
                const aPanel = this.add.rectangle(360, 640, 550, 650, 0x0f1620, 0.98).setStrokeStyle(3, 0x00d1ff).setDepth(151);
                const aTitle = this.add.text(360, 350, "Add a New Pet", { fontSize: "42px", fontFamily: "Arial Black", color: "#e8f7ff" }).setOrigin(0.5).setDepth(152);

                // Pet Name Label
                const nameLabel = this.add.text(360, 395, "Pet Name", { fontSize: "22px", fontFamily: "Arial Black", color: "#9fe6ff" }).setOrigin(0.5).setDepth(152);

                // Pet Name Input with styled box
                const inputBg = this.add.rectangle(360, 445, 280, 50, 0x061018, 0.9).setStrokeStyle(2, 0x00ccff).setDepth(151);
                const nameInput = this.add.dom(518, 725).createFromHTML(`
                    <input type="text" id="petNameInput" placeholder="Enter pet name..." style="font-size: 20px; padding: 10px; width: 250px; border-radius: 4px; border: none; background-color: #061018; color: #00ccff; text-align: center;">
                `).setDepth(152);

                // Pet Type Select Label
                const typeLabel = this.add.text(360, 505, "Choose Pet Type", { fontSize: "22px", fontFamily: "Arial Black", color: "#9fe6ff" }).setOrigin(0.5).setDepth(152);

                // Dog Button
                const dogBtnBg = this.add.rectangle(240, 565, 130, 80, 0x333333, 0.9).setStrokeStyle(2, 0xffffff).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(151);
                const dogEmoji = this.add.text(240, 545, "🐕", { fontSize: "40px" }).setOrigin(0.5).setDepth(152);
                const dogLabel = this.add.text(240, 590, "Dog", { fontSize: "18px", fontFamily: "Arial Black", color: "#ffffff" }).setOrigin(0.5).setDepth(152);

                // Cat Button
                const catBtnBg = this.add.rectangle(480, 565, 130, 80, 0x333333, 0.9).setStrokeStyle(2, 0xffffff).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(151);
                const catEmoji = this.add.text(480, 545, "🐱", { fontSize: "40px" }).setOrigin(0.5).setDepth(152);
                const catLabel = this.add.text(480, 590, "Cat", { fontSize: "18px", fontFamily: "Arial Black", color: "#ffffff" }).setOrigin(0.5).setDepth(152);

                let selectedType = null;

                dogBtnBg.on("pointerdown", () => {
                    selectedType = "dog";
                    dogBtnBg.setFillStyle(0x00ccff).setStrokeStyle(3, 0x00ff88);
                    catBtnBg.setFillStyle(0x333333).setStrokeStyle(2, 0xffffff);
                    dogLabel.setColor("#000000");
                    catLabel.setColor("#ffffff");
                });

                catBtnBg.on("pointerdown", () => {
                    selectedType = "cat";
                    catBtnBg.setFillStyle(0x00ccff).setStrokeStyle(3, 0x00ff88);
                    dogBtnBg.setFillStyle(0x333333).setStrokeStyle(2, 0xffffff);
                    catLabel.setColor("#000000");
                    dogLabel.setColor("#ffffff");
                });

                // Confirm Button
                const confirmBtnBg = this.add.rectangle(280, 695, 180, 50, 0x00ff88, 0.95).setStrokeStyle(2, 0xffffff).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(151);
                const confirmBtn = this.add.text(280, 695, "Create", { fontSize: "24px", fontFamily: "Arial Black", color: "#000000" }).setOrigin(0.5).setDepth(152);

                confirmBtnBg.on("pointerover", () => confirmBtnBg.setFillStyle(0x00ffaa));
                confirmBtnBg.on("pointerout", () => confirmBtnBg.setFillStyle(0x00ff88));

                confirmBtnBg.on("pointerdown", () => {
                    const el = document.getElementById("petNameInput");
                    const name = el ? el.value.trim() : "";
                    if (name && selectedType) {
                        GameData.addPet(name, selectedType);
                        GameData.save();
                        this.registry.events.emit("update-stats", { coins: GameData.coins, gems: GameData.gems });
                        this.registry.events.emit("pet-added", { name, type: selectedType });
                        [aOverlay, aPanel, aTitle, nameLabel, inputBg, nameInput, typeLabel, dogBtnBg, dogEmoji, dogLabel, catBtnBg, catEmoji, catLabel, confirmBtnBg, confirmBtn, cancelBtnBg, cancelBtn].forEach(x => x.destroy());
                    } else {
                        this.cameras.main.shake(200, 0.01);
                    }
                });

                // Cancel Button
                const cancelBtnBg = this.add.rectangle(440, 695, 180, 50, 0x444444, 0.95).setStrokeStyle(2, 0xffffff).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(151);
                const cancelBtn = this.add.text(440, 695, "Cancel", { fontSize: "24px", fontFamily: "Arial Black", color: "#ffffff" }).setOrigin(0.5).setDepth(152);

                cancelBtnBg.on("pointerover", () => cancelBtnBg.setFillStyle(0x555555));
                cancelBtnBg.on("pointerout", () => cancelBtnBg.setFillStyle(0x444444));

                cancelBtnBg.on("pointerdown", () => {
                    [aOverlay, aPanel, aTitle, nameLabel, inputBg, nameInput, typeLabel, dogBtnBg, dogEmoji, dogLabel, catBtnBg, catEmoji, catLabel, confirmBtnBg, confirmBtn, cancelBtnBg, cancelBtn].forEach(x => x.destroy());
                });

            });

            elements.push(addBtn);
        }

        const closeBtn = this.add.text(360, 700, "Close", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#444",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

        closeBtn.on("pointerdown", () => {
            [overlay, panel, title, closeBtn, ...elements].forEach(el => el.destroy());
        });

        elements.push(closeBtn);
    }

}