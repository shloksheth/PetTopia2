class ShopScreen extends Phaser.Scene {
    constructor() {
        super("ShopScreen");
    }

    preload() {
        this.load.image("button", "assets/icons/button.png");
        this.load.image("pizza", "assets/icons/pizza.png");
        this.load.image("meat_single", "assets/ui/meat_without_bg_2.png");
        this.load.image("apple", "assets/ui/apple_without_bg.png");
        this.load.image("shop_bg", "assets/backgrounds/shop_background.jpeg");
        this.load.image('fish', "assets/ui/fish_without_bg.png");
    }

    create() {
        this.data = GameData.load();

        this.add.image(500, 600, 'shop_bg').setOrigin(0.5);

        this.add.text(360, 80, "Shop", {
            fontSize: "48px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const foods = [
            {key: "pizza", label: "Pizza", cost: 15},
            {key: "meat_single", label: "Meat", cost: 20},
            {key: "apple", label: "Apple", cost: 5},
            {key: "fish", label: "Fish", cost: 10}
        ];

        foods.forEach((food, i) => {
            const y = 200 + i * 180;

            this.add.image(120, y, food.key).setScale(0.6).setOrigin(0.5);
            this.add.text(200, y - 30, food.label, {
                fontSize: "36px",
                color: "#ffffff"
            });

            this.add.text(200, y + 20, `Cost: ${food.cost} coins`, {
                fontSize: "28px",
                color: "#ffff66"
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
                if (this.data.coins >= food.cost) {
                    this.data.coins -= food.cost;
                    this.data.inventory[food.key]++;
                    GameData.save(this.data);
                }
            });
        });

        const backBtn = this.add.image(360, 1100, "button")
            .setInteractive({ useHandCursor: true })
            .setScale(1.2)
            .setOrigin(0.5);

        this.add.text(310, 1070, "Back", {
            fontSize: "40px",
            color: "#ffffff"
        });

        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
        console.log("Loaded data:", this.data);

    }
}
