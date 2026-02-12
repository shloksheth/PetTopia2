class BathingScreen extends Phaser.Scene {
    constructor() {
        super("BathingScreen");
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        this.load.image("BathroomScreenDay", "assets/backgrounds/bathroom_day_bg.png");
        this.load.image("BathroomScreenNight", "assets/backgrounds/bathroom_night_bg.png");

        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
            this.load.image('idle_cat' + i, `assets/sprites/pets/idle cat animation/idle ${i}.png`);
        }
    }

    create() {
        GameData.load();
        // Choose background and set bottom bar color
        const bgKey = GameData.isNightTime() ? "BathroomScreenNight" : "BathroomScreenDay";
        const dayBarColor = 0xe6c17a;
        const nightBarColor = 0x1a237e;
        this.registry.set('bottomBarColor', bgKey === "BathroomScreenDay" ? dayBarColor : nightBarColor);
        // --- Ensure UIScene is running and on top (for header/footer) ---
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }
        this.scene.bringToTop('UIScene');

        this.petData = GameData.getActivePet();
        const isCat = this.petData.type === "cat";
        const spriteKey = isCat ? 'idle_cat1' : 'idle1';

        // Set background
        const bg = this.add.image(360, 640, bgKey).setOrigin(0.5);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        // Title
        this.add.text(360, 100, "Bathing & Grooming 🛁", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // Pet sprite

        const animKey = isCat ? "cat_idle" : "dog_idle";

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

        this.pet = this.add.sprite(360, 520, spriteKey);
        if (isCat) {
            this.pet.setScale(1.2);
        } else {
            this.pet.setScale(1.0);
        }
        this.pet.play(animKey);

        // Cleanliness display
        const cleanliness = this.petData.cleanliness !== undefined ? this.petData.cleanliness : 100;
        this.cleanlinessText = this.add.text(360, 200, `Cleanliness: ${Math.round(cleanliness)}/100`, {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        // Action buttons
        const centerX = 360;
        let yPos = 900;

        // Shower button
        const showerBtn = this.add.rectangle(centerX - 130, yPos, 100, 80, 0x3498db, 0.85)
            .setStrokeStyle(3, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        this.add.text(centerX - 130, yPos - 12, "🚿", {
            fontSize: "40px"
        }).setOrigin(0.5);

        this.add.text(centerX - 130, yPos + 22, "Shower", {
            fontSize: "16px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5);

        showerBtn.on("pointerover", () => showerBtn.setFillStyle(0x5dade2));
        showerBtn.on("pointerout", () => showerBtn.setFillStyle(0x3498db));

        showerBtn.on("pointerdown", () => {
            this.performAction("shower", 30);
        });

        // Brush button
        const brushBtn = this.add.rectangle(centerX, yPos, 100, 80, 0x2ecc71, 0.85)
            .setStrokeStyle(3, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        this.add.text(centerX, yPos - 12, "🪮", {
            fontSize: "40px"
        }).setOrigin(0.5);

        this.add.text(centerX, yPos + 22, "Brush", {
            fontSize: "16px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5);

        brushBtn.on("pointerover", () => brushBtn.setFillStyle(0x58d68d));
        brushBtn.on("pointerout", () => brushBtn.setFillStyle(0x2ecc71));

        brushBtn.on("pointerdown", () => {
            this.performAction("brush", 20);
        });

        // Full Clean button
        const fullCleanBtn = this.add.rectangle(centerX + 130, yPos, 100, 80, 0xe74c3c, 0.85)
            .setStrokeStyle(3, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        this.add.text(centerX + 130, yPos - 12, "✨", {
            fontSize: "40px"
        }).setOrigin(0.5);

        this.add.text(centerX + 130, yPos + 22, "Full Clean", {
            fontSize: "14px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5);

        fullCleanBtn.on("pointerover", () => fullCleanBtn.setFillStyle(0xec7063));
        fullCleanBtn.on("pointerout", () => fullCleanBtn.setFillStyle(0xe74c3c));

        fullCleanBtn.on("pointerdown", () => {
            if (GameData.inventory.cleaningSupply > 0) {
                GameData.inventory.cleaningSupply--;
                this.performAction("full", 50);
                GameData.save();
            } else {
                this.showMessage("Need cleaning supplies from shop!");
            }
        });

        // Back button removed
    }

    performAction(action, amount) {
        const pet = GameData.getActivePet();
        let cleanliness = pet.cleanliness || 100;

        const oldValue = cleanliness;
        cleanliness = Math.min(100, cleanliness + amount);
        pet.cleanliness = cleanliness;
        pet.isDirty = false;

        // Animate pet
        this.tweens.add({
            targets: this.pet,
            scaleX: this.pet.scaleX * 1.15,
            scaleY: this.pet.scaleY * 1.15,
            duration: 200,
            yoyo: true
        });

        // Update display
        this.cleanlinessText.setText(`Cleanliness: ${Math.round(cleanliness)}/100`);

        // Add sparkles effect
        for (let i = 0; i < 5; i++) {
            const sparkle = this.add.text(
                Phaser.Math.Between(300, 420),
                Phaser.Math.Between(450, 550),
                "✨",
                { fontSize: "24px" }
            );
            this.tweens.add({
                targets: sparkle,
                y: sparkle.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => sparkle.destroy()
            });
        }

        GameData.addXP(pet, 2);
        GameData.save();
    }

    showMessage(text) {
        const msg = this.add.text(360, 300, text, {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#ff4444",
            backgroundColor: "#000000",
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            msg.destroy();
        });
    }
}

window.BathingScreen = BathingScreen;
