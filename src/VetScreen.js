class VetScreen extends Phaser.Scene {
    constructor() {
        super("VetScreen");
    }

    preload() {
        this.load.image('vet_bg', 'assets/backgrounds/vet_background.png');
        if (!this.textures.exists('button')) this.load.image('button', 'assets/icons/button.png');

        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
            this.load.image('idle_cat' + i, `assets/sprites/pets/idle cat animation/idle ${i}.png`);
        }
    }

    create() {
                    // Set bottom bar color for vet screen (orange) before UIScene
                    this.registry.set('bottomBarColor', 0xFF9000);
                    if (!this.scene.isActive('UIScene')) {
                        this.scene.launch('UIScene');
                    }
                    this.scene.bringToTop('UIScene');
            // Set bottom bar color for vet screen (orange)
            this.registry.set('bottomBarColor', 0xFF9000);
        const topBarHeight = 77;
        const petData = GameData.getActivePet(); 
        const isCat = petData.type === "cat";

        const bg = this.add.image(0, topBarHeight, 'vet_bg').setOrigin(0, 0);
        bg.setDisplaySize(this.scale.width, this.scale.height - topBarHeight);

        this.createAnimations();

        const spriteKey = isCat ? "idle_cat1" : "idle1";
        const animKey = isCat ? "cat_idle" : "dog_idle";

        this.pet = this.add.sprite(330, 660, spriteKey);
        
        if (isCat) {
            this.pet.setScale(0.85); 
        } else {
            this.pet.setScale(0.7);
        }

        this.pet.play(animKey);

        // Title
        this.add.text(360, 200, "Vet Checkup 🏥", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // Health display
        const health = petData.health !== undefined ? petData.health : 100;
        this.healthText = this.add.text(360, 280, `Health: ${Math.round(health)}/100`, {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: health > 70 ? "#00ff00" : (health > 40 ? "#ffff00" : "#ff0000"),
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        // Checkup button
        const checkupBtn = this.add.image(360, 400, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setScale(0.9);

        this.add.text(360, 400, "Start Checkup", {
            fontSize: "28px",
            color: "#ffffff"
        }).setOrigin(0.5);

        checkupBtn.on("pointerdown", () => {
            if (!this.checkupActive) {
                this.startCheckup();
            }
        });

        // Heal button (if sick)
        if (petData.isSick || health < 100) {
            const healBtn = this.add.image(360, 500, "button")
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5)
                .setScale(0.9);

            const healCost = 20;
            this.add.text(360, 500, `Heal (${healCost} coins)`, {
                fontSize: "28px",
                color: "#ffffff"
            }).setOrigin(0.5);

            healBtn.on("pointerdown", () => {
                if (GameData.coins >= healCost) {
                    GameData.coins -= healCost;
                    petData.health = 100;
                    petData.isSick = false;
                    GameData.stats.totalCoinsSpent += healCost;
                    GameData.save();
                    this.healthText.setText(`Health: 100/100`);
                    this.healthText.setColor("#00ff00");
                    healBtn.destroy();
                    this.add.text(360, 500, "✓ Healed!", {
                        fontSize: "28px",
                        color: "#00ff00"
                    }).setOrigin(0.5);
                } else {
                    this.cameras.main.shake(200, 0.01);
                }
            });
        }

        const backBtn = this.add.image(360, 1100, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        this.add.text(360, 1100, "Back", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });

        this.checkupActive = false;
    }

    startCheckup() {
        this.checkupActive = true;

        // Mini-game: Tap the heart when it appears
        this.checkupScore = 0;
        this.checkupTarget = 5;

        this.checkupText = this.add.text(360, 600, "Tap the heart! ❤️", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        this.heart = this.add.text(
            Phaser.Math.Between(200, 520),
            Phaser.Math.Between(700, 900),
            "❤️",
            { fontSize: "60px" }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.heart.on("pointerdown", () => {
            this.checkupScore++;
            this.heart.destroy();
            
            if (this.checkupScore >= this.checkupTarget) {
                this.completeCheckup();
            } else {
                // Spawn new heart
                this.heart = this.add.text(
                    Phaser.Math.Between(200, 520),
                    Phaser.Math.Between(700, 900),
                    "❤️",
                    { fontSize: "60px" }
                ).setOrigin(0.5).setInteractive({ useHandCursor: true });
                
                this.heart.on("pointerdown", () => {
                    this.checkupScore++;
                    this.heart.destroy();
                    if (this.checkupScore >= this.checkupTarget) {
                        this.completeCheckup();
                    } else {
                        this.heart = this.add.text(
                            Phaser.Math.Between(200, 520),
                            Phaser.Math.Between(700, 900),
                            "❤️",
                            { fontSize: "60px" }
                        ).setOrigin(0.5).setInteractive({ useHandCursor: true });
                    }
                });
            }
        });

        // Auto-move heart
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => {
                if (this.heart && this.heart.active) {
                    this.tweens.add({
                        targets: this.heart,
                        x: Phaser.Math.Between(200, 520),
                        y: Phaser.Math.Between(700, 900),
                        duration: 800,
                        ease: "Sine.easeInOut"
                    });
                }
            }
        });
    }

    completeCheckup() {
        this.checkupActive = false;
        if (this.heart) this.heart.destroy();
        if (this.checkupText) this.checkupText.destroy();

        const pet = GameData.getActivePet();
        pet.health = Math.min(100, pet.health + 20);
        pet.isSick = false;
        GameData.addXP(pet, 5);
        GameData.save();

        this.healthText.setText(`Health: ${Math.round(pet.health)}/100`);
        this.healthText.setColor(pet.health > 70 ? "#00ff00" : (pet.health > 40 ? "#ffff00" : "#ff0000"));

        const successText = this.add.text(360, 600, "Checkup Complete! +20 Health", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#00ff00",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            successText.destroy();
        });
    }

    createAnimations() {
        if (!this.anims.exists("dog_idle")) {
            this.anims.create({
                key: "dog_idle",
                frames: [...Array(8)].map((_, i) => ({ key: "idle" + (i + 1) })),
                frameRate: 4,
                repeat: -1
            });
        }
        if (!this.anims.exists("cat_idle")) {
            this.anims.create({
                key: "cat_idle",
                frames: [...Array(8)].map((_, i) => ({ key: "idle_cat" + (i + 1) })),
                frameRate: 4,
                repeat: -1
            });
        }
    }
}