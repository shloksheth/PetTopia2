class CustomizationScreen extends Phaser.Scene {
    constructor() {
        super("CustomizationScreen");
        this.hatEmoji = null;
        this.collarEmoji = null;
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        this.load.image("HomeScreenDay", "assets/backgrounds/HomeScreenDay.png");
    }

    create() {
        GameData.load();
        const pet = GameData.getActivePet();
        if (!pet.customization) {
            pet.customization = { hat: null, collar: null, skin: "default" };
        }

        // Background
        const bg = this.add.image(360, 640, "HomeScreenDay").setOrigin(0.5);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        // Title
        this.add.text(360, 80, getString('petStyling'), {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // Display pet preview with styling
        this.petPreviewX = 360;
        this.petPreviewY = 350;
        
        // Pet circle background
        this.add.circle(this.petPreviewX, this.petPreviewY, 120, 0x6b46c1, 0.8)
            .setStrokeStyle(4, 0xffffff);

        // Display pet emoji as large preview
        const petEmoji = pet.type === "cat" ? "🐱" : "🐶";
        const petDisplay = this.add.text(this.petPreviewX, this.petPreviewY, petEmoji, {
            fontSize: "96px"
        }).setOrigin(0.5);

        // Create the style dialog box
        this.createStyleDialog(pet);

        // Back button at bottom
        const backBtn = this.add.rectangle(360, 1200, 200, 50, 0xe74c3c, 1)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);

        this.add.text(360, 1200, "← " + getString('back'), {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5);

        backBtn.on("pointerover", () => backBtn.setFillStyle(0xec7063));
        backBtn.on("pointerout", () => backBtn.setFillStyle(0xe74c3c));

        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });

        // Listen for language changes
        this._onLanguageChanged = () => {
            setTimeout(() => this.scene.restart(), 60);
        };
        this.game.events.on("language-changed", this._onLanguageChanged);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this._onLanguageChanged) this.game.events.off("language-changed", this._onLanguageChanged);
        });

        this.updateHatDisplay();
    }

    createStyleDialog(pet) {
        const dialogWidth = 600;
        const dialogHeight = 600;
        const dialogX = 360;
        const dialogY = 750;

        // Dialog background
        const dialog = this.add.rectangle(dialogX, dialogY, dialogWidth, dialogHeight, 0x1a1a1a, 0.95)
            .setStrokeStyle(4, 0x00ff88)
            .setOrigin(0.5);

        let yOffset = dialogY - dialogHeight / 2 + 40;

        // Hats Section
        this.add.text(dialogX, yOffset, "🎩 " + getString('selectHat'), {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5);
        yOffset += 45;

        const hats = ["None", "Cap", "Crown", "Beanie"];
        const hatEmojis = ["❌", "🧢", "👑", "🎿"];

        for (let i = 0; i < hats.length; i++) {
            const hat = hats[i];
            const hatEmoji = hatEmojis[i];
            const isSelected = pet.customization.hat === hat || (pet.customization.hat === null && hat === "None");

            const hatBtn = this.add.rectangle(
                dialogX - 120 + (i % 2) * 120,
                yOffset + Math.floor(i / 2) * 50,
                100,
                40,
                isSelected ? 0x00ff88 : 0x333333,
                1
            )
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, isSelected ? 0xffffff : 0x666666);

            this.add.text(
                dialogX - 120 + (i % 2) * 120,
                yOffset + Math.floor(i / 2) * 50,
                hatEmoji,
                { fontSize: "24px" }
            ).setOrigin(0.5);

            hatBtn.on("pointerover", () => {
                if (!isSelected) hatBtn.setFillStyle(0x444444);
            });

            hatBtn.on("pointerout", () => {
                if (!isSelected) hatBtn.setFillStyle(0x333333);
            });

            hatBtn.on("pointerdown", () => {
                pet.customization.hat = hat === "None" ? null : hat;
                GameData.save();
                this.updateHatDisplay();
                // Re-create dialog to update selected state
                this.scene.restart();
            });
        }

        yOffset += 120;

        // Collars Section
        this.add.text(dialogX, yOffset, "⭕ " + getString('selectCollar'), {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#00ff88",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5);
        yOffset += 45;

        const collars = ["None", "Red", "Blue", "Gold"];
        const collarEmojis = ["❌", "🔴", "🔵", "🟡"];

        for (let i = 0; i < collars.length; i++) {
            const collar = collars[i];
            const collarEmoji = collarEmojis[i];
            const isSelected = pet.customization.collar === collar || (pet.customization.collar === null && collar === "None");

            const collarBtn = this.add.rectangle(
                dialogX - 120 + (i % 2) * 120,
                yOffset + Math.floor(i / 2) * 50,
                100,
                40,
                isSelected ? 0x00ff88 : 0x333333,
                1
            )
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, isSelected ? 0xffffff : 0x666666);

            this.add.text(
                dialogX - 120 + (i % 2) * 120,
                yOffset + Math.floor(i / 2) * 50,
                collarEmoji,
                { fontSize: "24px" }
            ).setOrigin(0.5);

            collarBtn.on("pointerover", () => {
                if (!isSelected) collarBtn.setFillStyle(0x444444);
            });

            collarBtn.on("pointerout", () => {
                if (!isSelected) collarBtn.setFillStyle(0x333333);
            });

            collarBtn.on("pointerdown", () => {
                pet.customization.collar = collar === "None" ? null : collar;
                GameData.save();
                this.scene.restart();
            });
        }
    }

    updateHatDisplay() {
        // Remove previous hat if exists
        if (this.hatEmoji) {
            this.hatEmoji.destroy();
        }

        const pet = GameData.getActivePet();
        if (pet.customization && pet.customization.hat) {
            const hatEmojis = {
                "Cap": "🧢",
                "Crown": "👑",
                "Beanie": "🎿"
            };

            const hatEmoji = hatEmojis[pet.customization.hat];
            if (hatEmoji) {
                // Position hat above the pet's head
                this.hatEmoji = this.add.text(
                    this.petPreviewX,
                    this.petPreviewY - 100,
                    hatEmoji,
                    { fontSize: "60px" }
                ).setOrigin(0.5);
            }
        }
    }
}

window.CustomizationScreen = CustomizationScreen;
