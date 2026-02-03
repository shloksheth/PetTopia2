class HomeScreen extends Phaser.Scene {
    constructor() {
        super("HomeScreen");
    }

    preload() {
        // Background
        this.load.image("home_bg", "assets/backgrounds/home_screen_bg.png");

        // UI icons
        this.load.image("coin_icon", "assets/ui/coin_icon.png");
        this.load.image("gem_icon", "assets/icons/gems.png");

        // Button
        this.load.image("button", "assets/icons/button.png");

        // Pet idle animation frames
        this.load.image("idle1", "assets/sprites/pets/idle dog animation/idle 1.png");
        this.load.image("idle2", "assets/sprites/pets/idle dog animation/idle 2.png");
        this.load.image("idle3", "assets/sprites/pets/idle dog animation/idle 3.png");
        this.load.image("idle4", "assets/sprites/pets/idle dog animation/idle 4.png");
        this.load.image("idle5", "assets/sprites/pets/idle dog animation/idle 5.png");
        this.load.image("idle6", "assets/sprites/pets/idle dog animation/idle 6.png");
        this.load.image("idle7", "assets/sprites/pets/idle dog animation/idle 7.png");
        this.load.image("idle8", "assets/sprites/pets/idle dog animation/idle 8.png");
    }

    create() {
        // Background
        this.add.image(0, 0, "home_bg").setOrigin(0);

        // Top bar background
        this.add.rectangle(0, 0, 720, 120, 0x000000, 0.4).setOrigin(0);

        // Coin icon + text
        this.add.image(50, 60, "coin_icon").setScale(0.4);
        this.add.text(100, 45, "100", {
            fontSize: "40px",
            color: "#ffffff"
        });

        // Gem icon + text
        this.add.image(200, 60, "gem_icon").setScale(0.4);
        this.add.text(250, 45, "5", {
            fontSize: "40px",
            color: "#ffffff"
        });

        // Pet idle animation
        this.pet = this.add.sprite(360, 700, "idle1").setScale(1.2);

        this.anims.create({
            key: "dog_idle",
            frames: [
                { key: "idle1" },
                { key: "idle2" },
                { key: "idle3" },
                { key: "idle4" },
                { key: "idle5" },
                { key: "idle6" },
                { key: "idle7" },
                { key: "idle8" }
            ],
            frameRate: 6,
            repeat: -1
        });

        this.pet.play("dog_idle");

        // Shop button
        const shopBtn = this.add.image(360, 1100, "button")
            .setInteractive({ useHandCursor: true })
            .setScale(1.2);

        this.add.text(300, 1070, "Shop", {
            fontSize: "40px",
            color: "#ffffff"
        });

        shopBtn.on("pointerdown", () => {
            this.scene.start("ShopScreen");
        });
    }
}
