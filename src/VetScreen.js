class VetScreen extends Phaser.Scene {
    constructor() {
        super("VetScreen");
    }

    preload() {
        this.load.image('vet_bg', 'assets/backgrounds/vet_background.png');
        this.load.image('button', 'assets/icons/button.png');

        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
        }
    }

    create() {
        const topBarHeight = 77;

        // Background image resized and offset to avoid top bar
        const bg = this.add.image(0, topBarHeight, 'vet_bg')
            .setOrigin(0, 0);
        bg.setDisplaySize(this.scale.width, this.scale.height - topBarHeight);

        // Pet sprite
        this.pet = this.add.sprite(330, 660, "idle1").setScale(0.7);

        if (!this.anims.exists("dog_idle")) {
            this.anims.create({
                key: "dog_idle",
                frames: [...Array(8)].map((_, i) => ({ key: "idle" + (i + 1) })),
                frameRate: 6,
                repeat: -1
            });
        }
        this.pet.play("dog_idle");

        // Back button
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
    }
}
