class ShopScreen extends Phaser.Scene {
    constructor() {
        super("ShopScreen");
    }

    preload() {
        this.load.image("button", "assets/icons/button.png");
        this.load.image("pizza", "assets/icons/pizza.png");
        this.load.image("meat", "assets/ui/meat_without_bg_2.png");
        this.load.image("apple", "assets/ui/apple_without_bg.png");
        this.load.image("shop_bg", "assets/backgrounds/shop_background.jpeg");
        this.load.image("fish", "assets/ui/fish_without_bg.png");
    }

    create() {

        this.data = GameData.load();

        this.registry.set("coins", this.data.coins);

        // Ensure inventory exists
        if (!this.data.inventory) this.data.inventory = {};

        this.add.image(360, 640, "shop_bg").setOrigin(0.5);

        this.add.text(360, 80, "Shop", {
            fontSize: "48px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const foods = [
<<<<<<< HEAD
            {key: "pizza", label: "Pizza", cost: 15},
            {key: "meat", label: "Meat", cost: 20},
            {key: "apple", label: "Apple", cost: 5},
            {key: "fish", label: "Fish", cost: 10}
=======
            { key: "pizza", label: "Pizza", cost: 15 },
            { key: "meat", label: "Meat", cost: 20 },
            { key: "apple", label: "Apple", cost: 5 },
            { key: "fish", label: "Fish", cost: 10 }
>>>>>>> 0f1631a29bd925b602420cf5c383e22f40fa870c
        ];

        foods.forEach((food, i) => {
            const y = 200 + i * 260;

            // Ensure each item is initialized in inventory
            if (!this.data.inventory[food.key]) this.data.inventory[food.key] = 0;

            this.add.image(115, y, food.key).setScale(0.6).setOrigin(0.5);

            this.add.text(200, y - 15, food.label, {
                fontSize: "36px",
                color: "#ffffff"
            });

            this.add.text(200, y + 20, `Cost: ${food.cost} coins`, {
                fontSize: "28px",
                color: "#ffff66"
            });

            const ownedText = this.add.text(200, y + 50, `Owned: ${this.data.inventory[food.key]}`, {
                fontSize: "24px",
                color: "#ffffff"
            });

            const buyBtn = this.add.image(550, y, "button")
                .setScale(1)
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5);

            this.add.text(520, y - 20, "Buy", {
                fontSize: "32px",
                color: "#ffffff"
            });

            buyBtn.on("pointerdown", () => {
                // Animate button press
                this.tweens.add({
                    targets: buyBtn,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    duration: 80,
                    yoyo: true,
                    ease: "Quad.easeInOut"
                });

                if (this.data.coins >= food.cost) {
                    this.data.coins -= food.cost;
                    this.data.inventory[food.key]++;
                    GameData.save(this.data);

                    ownedText.setText(`Owned: ${this.data.inventory[food.key]}`);
                    this.registry.set("coins", this.data.coins);
                }
            });
            buyBtn.on("pointerover", () => {
                this.tweens.add({
                    targets: buyBtn,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 150,
                    ease: "Power2"
                });
            });

            buyBtn.on("pointerout", () => {
                this.tweens.add({
                    targets: buyBtn,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150,
                    ease: "Power2"
                });
            });


        });

        const backBtn = this.add.image(360, 1200, "button")
            .setInteractive({ useHandCursor: true })
            .setScale(1.2)
            .setOrigin(0.5);

        this.add.text(310, 1170, "Back", {
            fontSize: "40px",
            color: "#ffffff"
        });

        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
    }
}
