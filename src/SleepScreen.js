class SleepScreen extends Phaser.Scene {
    constructor() {
        super("SleepScreen");
    }

    preload() {
        this.load.image("sleep_bg", "assets/backgrounds/sleep_bg.png"); // your bed image
        this.load.image("button", "assets/icons/button.png");

        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
        }
    }

    create() {
        const topBarHeight = 77;

        // Background with offset
        const bg = this.add.image(0, topBarHeight, "sleep_bg").setOrigin(0, 0);
        bg.setDisplaySize(this.scale.width, this.scale.height - topBarHeight);

        // Pet sprite sleeping
        this.pet = this.add.sprite(360, 700, "idle1").setScale(0.6);
        if (!this.anims.exists("dog_idle")) {
            this.anims.create({
                key: "dog_idle",
                frames: [...Array(8)].map((_, i) => ({ key: "idle" + (i + 1) })),
                frameRate: 4,
                repeat: -1
            });
        }
        this.pet.play("dog_idle");

        // Sleep message
        this.sleepText = this.add.text(360, 300, "Sleeping...", {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // Back button
        const backBtn = this.add.image(360, 1100, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        this.add.text(360, 1100, "Wake Up", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        backBtn.on("pointerdown", () => {
            const pet = GameData.getActivePet();
            pet.energy = Math.min(100, pet.energy + 30); // restore energy
            GameData.save();
            this.scene.start("HomeScreen");
        });
    }
}

window.SleepScreen = SleepScreen;
