class SleepScreen extends Phaser.Scene {
    constructor() {
        super("SleepScreen");
        this.isSleeping = false;
        this.sleepTween = null;

    }

    preload() {
        this.load.image("sleep_bg", "assets/backgrounds/sleep_bg.png");
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        this.load.image("dog_sleep", "assets/sprites/pets/sleep/dog_sleep.png");
        this.load.image("cat_sleep", "assets/sprites/pets/sleep/cat_sleep.png");
    }

    create() {
        const topBarHeight = 77;
        const petData = GameData.getActivePet();
        const isCat = petData.type === "cat";

        const bg = this.add.image(0, topBarHeight, "sleep_bg")
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height - topBarHeight);

        const sleepKey = isCat ? "cat_sleep" : "dog_sleep";
        const pet = this.add.image(this.scale.width / 2, 760, sleepKey).setOrigin(0.5);
        pet.setScale((this.scale.width * 0.32) / pet.width);

        this.sleepText = this.add.text(this.scale.width / 2, 280, "", {
            fontSize: "46px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        this.countdownText = this.add.text(this.scale.width / 2, 330, "", {
            fontSize: "28px",
            color: "#ffffff"
        }).setOrigin(0.5).setVisible(false);

        // Sleep/Wake button
        this.sleepBtn = this.add.image(this.scale.width / 2, 1000, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setDepth(5);

        this.sleepBtnLabel = this.add.text(this.scale.width / 2, 1000, "Sleep", {
            fontSize: "32px",
            color: "#ffffff"
            
        }).setOrigin(0.5).setDepth(6);

        this.sleepBtn.on("pointerdown", (p, x, y, e) => {
            e.stopPropagation();
            if (this.isSleeping) {
                this.cancelSleep();
            } else {
                if (GameData.isNightTime()) {
                    this.startSleep();
                } else {
                    this.showError("You can’t sleep during the day.\nCome back at night 🌙");
                }
            }
        });

        // Home button below Sleep/Wake
        const homeBtn = this.add.text(this.scale.width / 2, 1145, "🏠 Home", {
            fontSize: "80px",
            padding: { x: 14, y: 6 },
            color: "#ffffff"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

        homeBtn.on("pointerdown", (p, x, y, e) => {
            e.stopPropagation();
            this.scene.start("HomeScreen");
        });

        this.progressBg = this.add.rectangle(this.scale.width / 2, 900, 420, 22, 0x222222)
            .setOrigin(0.5)
            .setVisible(false);

        this.progressFill = this.add.rectangle(this.scale.width / 2 - 210, 900, 0, 22, 0x00cc66)
            .setOrigin(0, 0.5)
            .setVisible(false);

        this.errorGroup = this.add.container(this.scale.width / 2, 420).setVisible(false);
        const errorBg = this.add.rectangle(0, 0, 520, 170, 0x000000, 0.85)
            .setStrokeStyle(3, 0xffffff)
            .setOrigin(0.5);
        this.errorText = this.add.text(0, -25, "", {
            fontSize: "26px",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: 480 }
        }).setOrigin(0.5);
        const errorHome = this.add.text(0, 50, "🏠 Home", {
            fontSize: "24px",
            backgroundColor: "#ffffff22",
            padding: { x: 14, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        errorHome.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
        this.errorGroup.add([errorBg, this.errorText, errorHome]);
    }

    startSleep() {
        this.isSleeping = true;

        const duration = 30;
        let remaining = duration;

        this.sleepText.setText("Sleeping… 😴");
        this.countdownText.setText("30s remaining");
        this.countdownText.setVisible(true);

        this.progressBg.setVisible(true);
        this.progressFill.setVisible(true);
        this.progressFill.width = 0;

        this.sleepBtnLabel.setText("⏰ Wake Up");

        // Kill any existing tween
        if (this.sleepTween) {
            this.sleepTween.stop();
            this.sleepTween = null;
        }

        // Start new tween
        this.sleepTween = this.tweens.add({
            targets: this.progressFill,
            width: 420,
            duration: duration * 1000,
            ease: "Linear"
        });

        // Kill existing timer if needed
        if (this.timerEvent) {
            this.timerEvent.remove(false);
        }

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            repeat: duration - 1,
            callback: () => {
                remaining--;
                this.countdownText.setText(`${remaining}s remaining`);
            },
            callbackScope: this,
            onComplete: () => {
                GameData.setDay();
                GameData.addEnergy(30);
                this.registry.events.emit("update-stats");
                this.scene.start("HomeScreen");
            }
        });
    }


    cancelSleep() {
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }

        if (this.sleepTween) {
            this.sleepTween.stop();
            this.sleepTween = null;
        }

        this.isSleeping = false;
        this.sleepText.setText("");
        this.countdownText.setVisible(false);
        this.progressBg.setVisible(false);
        this.progressFill.setVisible(false);
        this.progressFill.width = 0;
        this.sleepBtnLabel.setText("Sleep");
    }


    showError(msg) {
        this.errorText.setText(msg);
        this.errorGroup.setAlpha(0).setVisible(true);

        this.tweens.add({
            targets: this.errorGroup,
            alpha: 1,
            duration: 250
        });

        this.time.delayedCall(3500, () => {
            this.tweens.add({
                targets: this.errorGroup,
                alpha: 0,
                duration: 250,
                onComplete: () => this.errorGroup.setVisible(false)
            });
        });
    }
}

window.SleepScreen = SleepScreen;
