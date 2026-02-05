class VetScreen extends Phaser.Scene {
    constructor() {
        super("VetScreen");
    }

    preload() {
        this.load.image('vet_bg', 'assets/backgrounds/vet_background.png');
        this.load.image('button', 'assets/icons/button.png');

        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
            this.load.image('idle_cat' + i, `assets/sprites/pets/idle cat animation/idle ${i}.png`);
        }
    }

    create() {
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