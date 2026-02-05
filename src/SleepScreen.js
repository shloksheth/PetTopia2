class SleepScreen extends Phaser.Scene {
    constructor() {
        super("SleepScreen");
    }

    preload() {
        this.load.image("sleep_bg", "assets/backgrounds/sleep_bg.png"); 
        this.load.image("button", "assets/icons/button.png");

        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
            this.load.image("idle_cat" + i, `assets/sprites/pets/idle cat animation/idle ${i}.png`);
        }
    }

    create() {
        const topBarHeight = 77;
        const petData = GameData.getActivePet();
        const isCat = petData.type === "cat";

        const bg = this.add.image(0, topBarHeight, "sleep_bg").setOrigin(0, 0);
        bg.setDisplaySize(this.scale.width, this.scale.height - topBarHeight);

        const spriteKey = isCat ? "idle_cat1" : "idle1";
        const animKey = isCat ? "cat_idle" : "dog_idle";
        const petScale = isCat ? 0.75 : 0.6; // Cat needs a bit more boost to match dog size

        this.pet = this.add.sprite(360, 700, spriteKey).setScale(petScale);

        this.createAnimations();

        this.pet.play(animKey);

        this.sleepText = this.add.text(360, 300, "Sleeping...", {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        const backBtn = this.add.image(360, 1100, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        this.add.text(360, 1100, "Wake Up", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        backBtn.on("pointerdown", () => {
            const pet = GameData.getActivePet();
            pet.energy = Math.min(100, (pet.energy || 0) + 30); 
            GameData.save();
            this.scene.start("HomeScreen");
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
window.SleepScreen = SleepScreen;