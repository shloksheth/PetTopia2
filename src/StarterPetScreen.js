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
        if (GameData.pets.length > 0) {
            this.scene.start("HomeScreen");
            return;
        }

        // Background
        const bg = this.add.image(360, 640, "HomeScreenDay").setOrigin(0.5);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        // Title
        this.add.text(360, 150, "Choose Your Starter Pet! 🐾", {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // Instructions
        this.add.text(360, 250, "Select a dog or cat to begin your journey", {
            fontSize: "28px",
            fontFamily: "Arial",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5);

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

        // Dog option
        const dogSprite = this.add.sprite(200, 500, "idle1");
        dogSprite.setScale(1.2);
        dogSprite.play("dog_idle");

        const dogBtn = this.add.rectangle(200, 650, 250, 150, 0x4444aa, 0.8)
            .setStrokeStyle(4, 0xffffff)
            .setInteractive({ useHandCursor: true });

        this.add.text(200, 620, "🐕 Dog", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(200, 680, "Loyal & Friendly", {
            fontSize: "24px",
            fontFamily: "Arial",
            color: "#cccccc"
        }).setOrigin(0.5);

        dogBtn.on("pointerdown", () => {
            this.selectPet("dog");
        });

        // Cat option
        const catSprite = this.add.sprite(520, 500, "idle_cat1");
        catSprite.setScale(1.4);
        catSprite.play("cat_idle");

        const catBtn = this.add.rectangle(520, 650, 250, 150, 0xaa44aa, 0.8)
            .setStrokeStyle(4, 0xffffff)
            .setInteractive({ useHandCursor: true });

        this.add.text(520, 620, "🐱 Cat", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(520, 680, "Independent & Playful", {
            fontSize: "24px",
            fontFamily: "Arial",
            color: "#cccccc"
        }).setOrigin(0.5);

        catBtn.on("pointerdown", () => {
            this.selectPet("cat");
        });

        // Name input
        this.add.text(360, 800, "Enter your pet's name:", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5);

        this.nameInput = this.add.dom(360, 860).createFromHTML(`
            <input type="text" id="petNameInput" placeholder="Pet Name" style="
                font-size: 28px;
                padding: 12px;
                width: 300px;
                border-radius: 8px;
                border: 3px solid #00ccff;
                text-align: center;
                background-color: #111;
                color: #fff;
            ">
        `).setDepth(100);

        // Confirm button
        const confirmBtn = this.add.rectangle(360, 950, 200, 80, 0x00ccff, 0.9)
            .setStrokeStyle(3, 0xffffff)
            .setInteractive({ useHandCursor: true });

        this.add.text(360, 950, "Start!", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#000000"
        }).setOrigin(0.5);

        confirmBtn.on("pointerdown", () => {
            const inputElement = this.nameInput.getChildByName("petNameInput");
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

        this.selectedType = null;
        dogBtn.on("pointerover", () => dogBtn.setFillStyle(0x6666cc));
        dogBtn.on("pointerout", () => dogBtn.setFillStyle(0x4444aa));
        catBtn.on("pointerover", () => catBtn.setFillStyle(0xcc66cc));
        catBtn.on("pointerout", () => catBtn.setFillStyle(0xaa44aa));

        // Update selection
        const updateSelection = (type) => {
            this.selectedType = type;
            if (type === "dog") {
                dogBtn.setStrokeStyle(6, 0x00ff00);
                catBtn.setStrokeStyle(4, 0xffffff);
            } else {
                catBtn.setStrokeStyle(6, 0x00ff00);
                dogBtn.setStrokeStyle(4, 0xffffff);
            }
        };

        dogBtn.on("pointerdown", () => updateSelection("dog"));
        catBtn.on("pointerdown", () => updateSelection("cat"));
    }

    showError(text) {
        const error = this.add.text(360, 1020, text, {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#ff4444",
            backgroundColor: "#000000",
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            error.destroy();
        });
    }
}

window.StarterPetScreen = StarterPetScreen;
