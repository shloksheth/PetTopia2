class BathingScreen extends Phaser.Scene {
    constructor() {
        super("BathingScreen");
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        this.load.image("HomeScreenDay", "assets/backgrounds/HomeScreenDay.png");
        
        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
            this.load.image('idle_cat' + i, `assets/sprites/pets/idle cat animation/idle ${i}.png`);
        }
    }

    create() {
        GameData.load();
        const pet = GameData.getActivePet();
        const isCat = pet.type === "cat";

        // Background
        const bg = this.add.image(360, 640, "HomeScreenDay").setOrigin(0.5);
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
        const spriteKey = isCat ? "idle_cat1" : "idle1";
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

        this.pet = this.add.sprite(360, 500, spriteKey);
        if (isCat) {
            this.pet.setScale(1.2);
        } else {
            this.pet.setScale(1.0);
        }
        this.pet.play(animKey);

        // Cleanliness display
        const cleanliness = pet.cleanliness !== undefined ? pet.cleanliness : 100;
        this.cleanlinessText = this.add.text(360, 200, `Cleanliness: ${Math.round(cleanliness)}/100`, {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        // Action buttons
        const centerX = 360;
        let yPos = 700;

        // Shower button
        const showerBtn = this.add.image(centerX - 120, yPos, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setScale(0.9);

        this.add.text(centerX - 120, yPos, "🚿 Shower", {
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0.5);

        showerBtn.on("pointerdown", () => {
            this.performAction("shower", 30);
        });

        // Brush button
        const brushBtn = this.add.image(centerX, yPos, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setScale(0.9);

        this.add.text(centerX, yPos, "🪮 Brush", {
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0.5);

        brushBtn.on("pointerdown", () => {
            this.performAction("brush", 20);
        });

        // Full Clean button
        const fullCleanBtn = this.add.image(centerX + 120, yPos, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setScale(0.9);

        this.add.text(centerX + 120, yPos, "✨ Full Clean", {
            fontSize: "22px",
            color: "#ffffff"
        }).setOrigin(0.5);

        fullCleanBtn.on("pointerdown", () => {
            if (GameData.inventory.cleaningSupply > 0) {
                GameData.inventory.cleaningSupply--;
                this.performAction("full", 50);
                GameData.save();
            } else {
                this.showMessage("Need cleaning supplies from shop!");
            }
        });

        // Back button
        const backBtn = this.add.image(360, 1150, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        this.add.text(360, 1150, "Back", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
    }

    performAction(action, amount) {
        const pet = GameData.getActivePet();
        if (!pet.cleanliness) pet.cleanliness = 100;
        
        const oldValue = pet.cleanliness;
        pet.cleanliness = Math.min(100, pet.cleanliness + amount);
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
        this.cleanlinessText.setText(`Cleanliness: ${Math.round(pet.cleanliness)}/100`);
        
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
