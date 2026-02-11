class UIScene extends Phaser.Scene {
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
    }

    createBottomNav() {
        const { width, height } = this.scale;

        const navBarHeight = 130; // Total height of the black area
        const navBg = this.add.rectangle(
            width / 2,
            height - (navBarHeight / 2),
            width,
            navBarHeight,
            0x000000,
            0.85 // 85% opacity
        )
            .setOrigin(0.5)
            .setDepth(1000) // Lower than buttons (1001), but higher than other scenes
            .setInteractive(); // Prevents clicking "through" the bar to the scene below

        // Add a thin white border line at the top of the bar for style
        this.add.line(0, 0, 0, height - navBarHeight, width, height - navBarHeight, 0xffffff, 8)
            .setOrigin(0)
            .setDepth(8001);
        // 1. Layout Constants

        const bottomPadding = -10;   // Space between the bottom of the screen and the labels
        const iconLift = 85;        // How high the icons sit from the bottom
        const labelLift = 35;       // How high the labels sit from the bottom


        // 3. Reordered Buttons (Home is now index 2 - the exact middle)
        const buttons = [
            { icon: "🐾", label: "Pets", action: () => this.openPetSwitcher() },
            { icon: "🛒", label: "Shop", action: () => {
                // List of all main content scenes except UIScene
                const mainScenes = [
                    "HomeScreen",
                    "BathingScreen",
                    "WardrobeScreen",
                    "PlayScreen",
                    "StatsScreen",
                    "SleepScreen",
                    "VetScreen",
                    "CustomizationScreen",
                    // Add any other main scenes here
                ];
                mainScenes.forEach(sceneKey => {
                    if (this.scene.isActive(sceneKey)) {
                        this.scene.stop(sceneKey);
                    }
                });
                this.scene.start("ShopScreen");
            } },
            {
                icon: "🏠",
                label: "Home",
                action: () => {
                    // List of all main content scenes except UIScene
                    const mainScenes = [
                        "ShopScreen",
                        "BathingScreen",
                        "WardrobeScreen",
                        "PlayScreen",
                        "StatsScreen",
                        "SleepScreen",
                        "VetScreen",
                        "CustomizationScreen",
                        // Add any other main scenes here
                    ];
                    mainScenes.forEach(sceneKey => {
                        if (this.scene.isActive(sceneKey)) {
                            this.scene.stop(sceneKey);
                        }
                    });
                    this.scene.start("HomeScreen");
                }
            }, // Center
            { icon: "🛁", label: "Bath", action: () => this.scene.start("BathingScreen") },
            { icon: "👚", label: "Closet", action: () => this.scene.start("WardrobeScreen") }
        ];

        buttons.forEach((btn, i) => {
            const x = (width / buttons.length) * (i + 0.5);
            const iconY = height - iconLift - bottomPadding;
            const labelY = height - labelLift - bottomPadding;

            // --- Visual Elements ---

            // Circular Backdrop
            const circle = this.add.circle(x, iconY, 42, 0xffffff, 0.1)
                .setDepth(1001)
                .setInteractive({ useHandCursor: true });

            // Icon Text
            const iconTxt = this.add.text(x, iconY, btn.icon, { fontSize: "48px" })
                .setOrigin(0.5)
                .setDepth(1002);

            // Label Text
            const labelTxt = this.add.text(x, labelY, btn.label.toUpperCase(), {
                fontSize: "12px",
                fontFamily: "Arial Black",
                color: "#ffffff"
            })
                .setOrigin(0.5)
                .setDepth(1002);

            // --- Interactions ---

            circle.on("pointerover", () => {
                circle.setFillStyle(0xffffff, 0.2);
                this.tweens.add({
                    targets: [iconTxt, circle],
                    y: iconY - 12, // Move up on hover
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