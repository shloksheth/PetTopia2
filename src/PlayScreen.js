class PlayScreen extends Phaser.Scene {
    constructor() {
        super("PlayScreen");
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        this.load.image("HomeScreenDay", "assets/backgrounds/HomeScreenDay.png");
        
        // Load pet animations
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
        this.add.text(360, 100, "Play Time! 🎾", {
            fontSize: "48px",
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
                frameRate: 8,
                repeat: -1
            });
        }
        if (!this.anims.exists("cat_idle")) {
            this.anims.create({
                key: "cat_idle",
                frames: [...Array(8)].map((_, i) => ({ key: "idle_cat" + (i + 1) })),
                frameRate: 8,
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

        // Mini-game: Tap the ball
        this.ball = this.add.circle(360, 700, 30, 0xff6600)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);

        this.ballText = this.add.text(360, 700, "⚽", {
            fontSize: "40px"
        }).setOrigin(0.5);

        this.score = 0;
        this.scoreText = this.add.text(360, 200, "Score: 0", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        this.timeRemaining = 30;
        this.timerText = this.add.text(360, 250, `Time: ${this.timerText}s`, {
            fontSize: "28px",
            fontFamily: "Arial",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5);

        this.gameActive = true;

        // Ball click handler
        this.ball.on("pointerdown", () => {
            if (!this.gameActive) return;
            
            this.score++;
            this.scoreText.setText(`Score: ${this.score}`);
            
            // Animate ball
            this.tweens.add({
                targets: [this.ball, this.ballText],
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 100,
                yoyo: true
            });

            // Move ball to random position
            this.tweens.add({
                targets: [this.ball, this.ballText],
                x: Phaser.Math.Between(100, 620),
                y: Phaser.Math.Between(400, 900),
                duration: 300,
                ease: "Back.easeOut"
            });

            // Pet animation
            this.pet.setScale(this.pet.scaleX * 1.1);
            this.time.delayedCall(100, () => {
                this.pet.setScale(isCat ? 1.2 : 1.0);
            });
        });

        // Timer
        this.timer = this.time.addEvent({
            delay: 1000,
            repeat: 29,
            callback: () => {
                this.timeRemaining--;
                this.timerText.setText(`Time: ${this.timeRemaining}s`);
                
                if (this.timeRemaining <= 0) {
                    this.endGame();
                }
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
            if (this.gameActive) {
                this.endGame();
            }
            this.scene.start("HomeScreen");
        });
    }

    endGame() {
        this.gameActive = false;
        
        // Calculate rewards based on score
        const happinessBoost = Math.min(30, Math.floor(this.score / 2));
        const xpGain = Math.floor(this.score / 3);
        const coinReward = Math.floor(this.score / 5); // 1 coin per 5 points
        
        const pet = GameData.getActivePet();
        pet.happiness = Math.min(100, pet.happiness + happinessBoost);
        GameData.addXP(pet, xpGain);
        GameData.coins += coinReward;
        GameData.stats.totalCoinsEarned += coinReward;
        GameData.save();

        // Show results
        const overlay = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.7)
            .setDepth(100);

        const panel = this.add.rectangle(360, 640, 500, 400, 0x222222, 0.95)
            .setStrokeStyle(4, 0xffffff)
            .setDepth(101);

        const title = this.add.text(360, 500, "Game Over!", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5).setDepth(102);

        const scoreDisplay = this.add.text(360, 560, `Final Score: ${this.score}`, {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffff00"
        }).setOrigin(0.5).setDepth(102);

        const rewardText = this.add.text(360, 620, `+${happinessBoost} Happiness\n+${xpGain} XP\n+${coinReward} Coins`, {
            fontSize: "28px",
            fontFamily: "Arial",
            color: "#00ff88",
            align: "center"
        }).setOrigin(0.5).setDepth(102);

        const continueBtn = this.add.text(360, 720, "Continue", {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#00ccff",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

        continueBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
    }
}

window.PlayScreen = PlayScreen;
