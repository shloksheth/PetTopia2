class StarterPetScreen extends Phaser.Scene {
    constructor() {
        super("StarterPetScreen");
    }

    preload() {
        this.load.image("HomeScreenDay", "assets/backgrounds/HomeScreenDay.png");
        
        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
            this.load.image('idle_cat' + i, `assets/sprites/pets/idle cat animation/idle ${i}.png`);
        }
    }

    create() {
        // Only show if no pets exist
        GameData.load();

        // Listen for language changes
        this._onLanguageChanged = () => {
            setTimeout(() => this.scene.restart(), 60);
        };
        this.game.events.on("language-changed", this._onLanguageChanged);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this._onLanguageChanged) this.game.events.off("language-changed", this._onLanguageChanged);
        });
        if (GameData.pets.length > 0) {
            this.scene.start("HomeScreen");
            return;
        }

        // Account for top and bottom bars
        const bottomBarHeight = this.registry.get('bottomBarHeight') || 140;
        const topBarHeight = this.registry.get('topBarHeight') || 120;
        const usableHeight = this.scale.height - topBarHeight - bottomBarHeight;
        const centerX = this.scale.width / 2;
        const topOffset = topBarHeight;

        // Background
        const bg = this.add.image(-32.5, topOffset, "HomeScreenDay").setOrigin(0);
        bg.setDisplaySize(this.scale.width + 75, usableHeight);

        // Title
        const titleY = topOffset + Math.round(usableHeight * 0.06);
        this.add.text(centerX, titleY, "Choose Your Starter Pet! 🐾", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(5);

        // Instructions
        this.add.text(centerX, titleY + 65, "Select a dog or cat to begin your journey", {
            fontSize: "24px",
            fontFamily: "Arial",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(5);

        // Create animations
        if (!this.anims.exists("dog_idle")) {
            this.anims.create({
                key: "dog_idle",
                frames: [...Array(8)].map((_, i) => ({ key: "idle" + (i + 1) })),
                frameRate: 6,
                repeat: -1
            });
        }
        if (!this.anims.exists("cat_idle")) {
            this.anims.create({
                key: "cat_idle",
                frames: [...Array(8)].map((_, i) => ({ key: "idle_cat" + (i + 1) })),
                frameRate: 6,
                repeat: -1
            });
        }

        // Pet selection area
        const spriteY = topOffset + Math.round(usableHeight * 0.25);
        const cardY = topOffset + Math.round(usableHeight * 0.42);

        // Dog option
        const dogSprite = this.add.sprite(centerX - 160, spriteY, "idle1");
        dogSprite.setScale(0.5);
        dogSprite.play("dog_idle");
        dogSprite.setDepth(5);
        dogSprite.setInteractive({ useHandCursor: true });

        const dogCardBg = this.add.rectangle(centerX - 160, cardY, 280, 160, 0x2a5aa0, 0.85)
            .setStrokeStyle(3, 0xffffff)
            .setOrigin(0.5)
            .setDepth(5);

        const dogBtn = this.add.zone(centerX - 160, cardY, 280, 160)
            .setInteractive({ useHandCursor: true })
            .setDepth(6);

        this.add.text(centerX - 160, cardY - 50, "🐕 Dog", {
            fontSize: "40px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(6);

        this.add.text(centerX - 160, cardY + 20, "Loyal & Friendly", {
            fontSize: "22px",
            fontFamily: "Arial",
            color: "#e0e0e0"
        }).setOrigin(0.5).setDepth(6);

        dogBtn.on("pointerover", () => {
            this.tweens.add({ targets: dogCardBg, scaleX: 1.08, scaleY: 1.08, duration: 200, ease: "Quad.easeOut" });
            dogCardBg.setFillStyle(0x3d74c8);
        });
        dogBtn.on("pointerout", () => {
            this.tweens.add({ targets: dogCardBg, scaleX: 1, scaleY: 1, duration: 200, ease: "Quad.easeOut" });
            if (this.selectedType !== "dog") dogCardBg.setFillStyle(0x2a5aa0);
        });

        const selectDog = () => {
            this.selectedType = "dog";
            dogCardBg.setStrokeStyle(4, 0x00ff00);
            catCardBg.setStrokeStyle(3, 0xffffff);
        };
        dogBtn.on("pointerdown", selectDog);
        dogSprite.on("pointerdown", selectDog);

        // Cat option
        const catSprite = this.add.sprite(centerX + 160, spriteY, "idle_cat1");
        catSprite.setScale(0.6);
        catSprite.play("cat_idle");
        catSprite.setDepth(5);
        catSprite.setInteractive({ useHandCursor: true });

        const catCardBg = this.add.rectangle(centerX + 160, cardY, 280, 160, 0xa02a5a, 0.85)
            .setStrokeStyle(3, 0xffffff)
            .setOrigin(0.5)
            .setDepth(5);

        const catBtn = this.add.zone(centerX + 160, cardY, 280, 160)
            .setInteractive({ useHandCursor: true })
            .setDepth(6);

        this.add.text(centerX + 160, cardY - 50, "🐱 Cat", {
            fontSize: "40px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(6);

        this.add.text(centerX + 160, cardY + 20, "Independent & Playful", {
            fontSize: "22px",
            fontFamily: "Arial",
            color: "#e0e0e0"
        }).setOrigin(0.5).setDepth(6);

        catBtn.on("pointerover", () => {
            this.tweens.add({ targets: catCardBg, scaleX: 1.08, scaleY: 1.08, duration: 200, ease: "Quad.easeOut" });
            catCardBg.setFillStyle(0xc83d74);
        });
        catBtn.on("pointerout", () => {
            this.tweens.add({ targets: catCardBg, scaleX: 1, scaleY: 1, duration: 200, ease: "Quad.easeOut" });
            if (this.selectedType !== "cat") catCardBg.setFillStyle(0xa02a5a);
        });

        const selectCat = () => {
            this.selectedType = "cat";
            catCardBg.setStrokeStyle(4, 0x00ff00);
            dogCardBg.setStrokeStyle(3, 0xffffff);
        };
        catBtn.on("pointerdown", selectCat);
        catSprite.on("pointerdown", selectCat);

        this.selectedType = null;

        // Name input section
        const inputY = topOffset + Math.round(usableHeight * 0.70);
        this.add.text(centerX, inputY - 50, "Name your pet:", {
            fontSize: "26px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(5);

        this.nameInput = this.add.dom(centerX+155, inputY+300).createFromHTML(`
            <input type="text" id="petNameInput" name="petNameInput" placeholder="Pet Name" style="
                font-size: 24px;
                padding: 0px;
                width: 280px;
                height: 60px;
                border-radius: 8px;
                border: 3px solid #00ccff;
                text-align: center;
                background-color: #111;
                color: #fff;
            ">
        `).setDepth(10);

        // Confirm button
        const confirmBtnY = topOffset + Math.round(usableHeight * 0.85);
        const confirmBtn = this.add.rectangle(centerX, confirmBtnY, 220, 70, 0x00ccff, 0.9)
            .setStrokeStyle(3, 0xffffff)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);

        this.add.text(centerX, confirmBtnY, "Start!", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#000000",
            stroke: "#ffffff",
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(6);

        confirmBtn.on("pointerover", () => {
            confirmBtn.setFillStyle(0x00e6ff);
        });
        confirmBtn.on("pointerout", () => {
            confirmBtn.setFillStyle(0x00ccff);
        });

        confirmBtn.on("pointerdown", () => {
            const inputElement = document.getElementById("petNameInput");
            if (!inputElement) {
                this.showError("Input field not found!");
                return;
            }
            const name = inputElement.value.trim();
            
            if (!name) {
                this.showError("Please enter a name!");
                return;
            }

            if (this.selectedType) {
                const success = GameData.addPet(name, this.selectedType);
                if (success) {
                    GameData.activePetIndex = 0;
                    GameData.save();
                    this.scene.start("HomeScreen");
                } else {
                    this.showError("Failed to create pet!");
                }
            } else {
                this.showError("Please select a pet type!");
            }
        });
    }

    showError(text) {
        const bottomBarHeight = this.registry.get('bottomBarHeight') || 140;
        const topBarHeight = this.registry.get('topBarHeight') || 120;
        const usableHeight = this.scale.height - topBarHeight - bottomBarHeight;
        const centerX = this.scale.width / 2;
        const topOffset = topBarHeight;

        const errorY = topOffset + usableHeight - 50;
        const error = this.add.text(centerX, errorY, text, {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#ff4444",
            backgroundColor: "#000000",
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setDepth(20);

        this.time.delayedCall(2000, () => {
            error.destroy();
        });
    }
}

window.StarterPetScreen = StarterPetScreen;
