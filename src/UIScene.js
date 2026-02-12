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

        const title = this.add.text(360, 300, "Your Pets", {
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
                GameData.save();
                GameData.switchToPet(i);
                this.scene.get("HomeScreen").loadPet();
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
                [overlay, panel, title, ...elements].forEach(el => el.destroy());
                this.scene.get("HomeScreen").showRemovePetDialog(i);
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
                this.scene.get("HomeScreen").showAddPetDialog();
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