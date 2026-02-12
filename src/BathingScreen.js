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
        const bgKey = GameData.isNightTime() ? "BathroomScreenNight" : "BathroomScreenDay";
        const dayBarColor = 0xe6c17a;
        const nightBarColor = 0x1a237e;
        this.registry.set('bottomBarColor', bgKey === "BathroomScreenDay" ? dayBarColor : nightBarColor);
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }
        this.scene.bringToTop('UIScene');

        this.petData = GameData.getActivePet();
        const isCat = this.petData.type === "cat";
        const spriteKey = isCat ? 'idle_cat1' : 'idle1';

        const bg = this.add.image(360, 640, bgKey).setOrigin(0.5);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        this.add.text(360, 100, "Bathing Ritual", {
            fontSize: "46px",
            fontFamily: "Impact",
            color: "#ffffff",
            stroke: "#0b1116",
            strokeThickness: 5
        }).setOrigin(0.5);

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
        this.pet.setScale(isCat ? 1.2 : 1.0);
        this.pet.play(animKey);

        const cleanliness = this.petData.cleanliness !== undefined ? this.petData.cleanliness : 100;
        this.cleanlinessText = this.add.text(360, 200, `Cleanliness: ${Math.round(cleanliness)}/100`, {
            fontSize: "28px",
            fontFamily: "Trebuchet MS",
            color: "#eaf6ff",
            stroke: "#0b1116",
            strokeThickness: 3
        }).setOrigin(0.5);

        this.bathStepSequence = [];
        this.expectedBathSequence = ["Shower", "Shampoo", "Shower", "Dry"];
        this.bathBlinkTween = null;
        this.bathBlinkTarget = null;

        const centerX = 360;
        const yPos = 900;
        const spacing = 150;

        this.showerButton = this.createBathButton(centerX - spacing, yPos, "Shower", "🚿", 0x2a9dff, 0x9dd9ff);
        this.shampooButton = this.createBathButton(centerX, yPos, "Shampoo", "🫧", 0x2ad38a, 0x9cffd7);
        this.dryButton = this.createBathButton(centerX + spacing, yPos, "Dry", "🌬️", 0xff8a3d, 0xffc18f);

        this.bathButton = this.createBathButton(centerX, yPos, "Bath", "🛁", 0x2a2f3a, 0x7bdfff);
        this.bathButton.container.setDepth(30);

        this.showerButton.hit.on("pointerdown", () => {
            this.playBathAnimation();
            this.recordBathStep("Shower");
        });

        this.shampooButton.hit.on("pointerdown", () => {
            const soapCount = GameData.inventory.soap || 0;
            if (soapCount < 5) {
                this.showMessage("Not enough shampoo");
                return;
            }
            GameData.inventory.soap = soapCount - 5;
            GameData.save();
            this.playBathAnimation();
            this.recordBathStep("Shampoo");
        });

        this.dryButton.hit.on("pointerdown", () => {
            this.playBathAnimation();
            this.recordBathStep("Dry");
        });

        this.bathButton.hit.on("pointerdown", () => {
            if (this.bathButton.label.text === "Done") {
                this.scene.start("HomeScreen");
                return;
            }
            this.setBathButtonsVisible(true);
            this.setBathButtonVisible(false);
            this.updateBathHint();
        });

        this.setBathButtonsVisible(false);
        this.setBathButtonVisible(true);
    }

    createBathButton(x, y, label, emoji, color, glow) {
        const container = this.add.container(0, 0).setDepth(20);
        const shadow = this.add.rectangle(x + 4, y + 5, 130, 90, 0x000000, 0.25).setOrigin(0.5);
        const bg = this.add.rectangle(x, y, 130, 90, color, 0.95)
            .setStrokeStyle(2, glow)
            .setOrigin(0.5);
        const icon = this.add.text(x, y - 12, emoji, {
            fontSize: "38px"
        }).setOrigin(0.5);
        const text = this.add.text(x, y + 24, label, {
            fontSize: "16px",
            fontFamily: "Trebuchet MS",
            color: "#ffffff",
            stroke: "#0b1116",
            strokeThickness: 2
        }).setOrigin(0.5);

        container.add([shadow, bg, icon, text]);

        const hit = this.add.rectangle(x, y, 130, 90, 0x000000, 0)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(40);

        return { container, bg, icon, label: text, hit };
    }

    setBathButtonsVisible(visible) {
        [this.showerButton, this.shampooButton, this.dryButton].forEach(btn => {
            btn.container.setVisible(visible).setActive(visible);
            btn.hit.setVisible(visible).setActive(visible);
            if (visible) {
                btn.hit.setInteractive({ useHandCursor: true });
            } else {
                btn.hit.disableInteractive();
            }
        });

        if (!visible) {
            this.stopBathHint();
        }
    }

    setBathButtonVisible(visible, labelText) {
        this.bathButton.container.setVisible(visible).setActive(visible);
        this.bathButton.hit.setVisible(visible).setActive(visible);
        if (visible) {
            if (labelText) this.bathButton.label.setText(labelText);
            this.bathButton.hit.setInteractive({ useHandCursor: true });
        } else {
            this.bathButton.hit.disableInteractive();
        }
    }

    recordBathStep(step) {
        const expectedIndex = this.bathStepSequence.length;
        if (this.expectedBathSequence[expectedIndex] !== step) {
            this.showMessage("You are doing wrong");
            this.bathStepSequence = [];
            this.updateBathHint();
            return;
        }

        this.bathStepSequence.push(step);

        const matches = this.bathStepSequence.length === this.expectedBathSequence.length
            && this.expectedBathSequence.every((value, index) => this.bathStepSequence[index] === value);

        if (matches) {
            this.showMessage("Bath Complete");
            this.bathStepSequence = [];
            this.setBathButtonsVisible(false);
            this.setBathButtonVisible(true, "Done");
            this.stopBathHint();
            this.showBathRewards();
        } else {
            this.updateBathHint();
        }
    }

    updateBathHint() {
        const nextStep = this.expectedBathSequence[this.bathStepSequence.length];
        let target = null;
        if (nextStep === "Shower") target = this.showerButton.container;
        if (nextStep === "Shampoo") target = this.shampooButton.container;
        if (nextStep === "Dry") target = this.dryButton.container;

        if (!target || this.bathBlinkTarget === target) return;

        this.stopBathHint();
        this.bathBlinkTarget = target;
        this.bathBlinkTween = this.tweens.add({
            targets: target,
            scale: 1.06,
            alpha: 0.75,
            duration: 260,
            yoyo: true,
            repeat: -1
        });
    }

    stopBathHint() {
        if (this.bathBlinkTween) {
            this.bathBlinkTween.stop();
            this.bathBlinkTween = null;
        }
        if (this.bathBlinkTarget) {
            this.bathBlinkTarget.setScale(1).setAlpha(1);
            this.bathBlinkTarget = null;
        }
    }

    playBathAnimation() {
        this.tweens.add({
            targets: this.pet,
            scaleX: this.pet.scaleX * 1.1,
            scaleY: this.pet.scaleY * 1.1,
            duration: 140,
            yoyo: true
        });

        for (let i = 0; i < 3; i++) {
            const sparkle = this.add.text(
                Phaser.Math.Between(300, 420),
                Phaser.Math.Between(450, 550),
                "✨",
                { fontSize: "20px" }
            );
            this.tweens.add({
                targets: sparkle,
                y: sparkle.y - 40,
                alpha: 0,
                duration: 800,
                onComplete: () => sparkle.destroy()
            });
        }
    }

    showBathRewards() {
        const pet = GameData.getActivePet();
        if (!pet) return;

        pet.cleanliness = 100;
        GameData.addXP(pet, 10);
        GameData.coins += 15;
        if (GameData.stats) {
            GameData.stats.totalCoinsEarned = (GameData.stats.totalCoinsEarned || 0) + 15;
        }
        GameData.save();
        this.registry.events.emit("update-stats");
        this.cleanlinessText.setText(`Cleanliness: ${Math.round(pet.cleanliness)}/100`);

        const overlay = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.65)
            .setDepth(210)
            .setInteractive();

        const panel = this.add.rectangle(360, 640, 540, 360, 0x15222b, 0.97)
            .setStrokeStyle(3, 0x7bdfff)
            .setDepth(211);

        const title = this.add.text(360, 520, "Bath Complete", {
            fontSize: "40px",
            fontFamily: "Impact",
            color: "#ffffff",
            stroke: "#0b1116",
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(212);

        const rewardText = this.add.text(360, 600, "+100 Cleanliness\n+10 XP\n+15 Coins", {
            fontSize: "28px",
            fontFamily: "Trebuchet MS",
            color: "#9fffe0",
            align: "center"
        }).setOrigin(0.5).setDepth(212);

        const continueBtn = this.add.text(360, 720, "Continue", {
            fontSize: "30px",
            fontFamily: "Trebuchet MS",
            color: "#0b141a",
            backgroundColor: "#7bdfff",
            padding: { x: 22, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(212);

        continueBtn.on("pointerdown", () => {
            [overlay, panel, title, rewardText, continueBtn].forEach(el => el.destroy());
        });
    }

    showMessage(text) {
        if (this.messageText) {
            this.messageText.destroy();
            this.messageText = null;
        }

        const msg = this.add.text(360, 300, text, {
            fontSize: "24px",
            fontFamily: "Trebuchet MS",
            color: "#ffffff",
            backgroundColor: "#0b141a",
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setDepth(200);

        this.messageText = msg;

        this.tweens.add({
            targets: msg,
            alpha: 0,
            delay: 1600,
            duration: 300,
            onComplete: () => {
                msg.destroy();
                if (this.messageText === msg) {
                    this.messageText = null;
                }
            }
        });
    }
}

window.BathingScreen = BathingScreen;
