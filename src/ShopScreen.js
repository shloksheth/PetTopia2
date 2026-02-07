class ShopScreen extends Phaser.Scene {
    constructor() {
        super("ShopScreen");
    }

    preload() {
        this.load.image("button", "assets/icons/button.png");
        this.load.image("left_arrow", "assets/icons/left_arrow.png");
        this.load.image("right_arrow", "assets/icons/right_arrow.png");

        this.load.image("pizza", "assets/icons/pizza.png");
        this.load.image("meat", "assets/ui/meat_without_bg_2.png");
        this.load.image("apple", "assets/ui/apple_without_bg.png");
        this.load.image("fish", "assets/ui/fish_without_bg.png");
        this.load.image("shop_bg", "assets/backgrounds/shop_background.jpeg");
    }

    create() {
        GameData.load();
        this.data = GameData;

        if (typeof this.data.coins !== "number") this.data.coins = 0;
        if (typeof this.data.gems !== "number") this.data.gems = 0;
        if (!this.data.inventory) this.data.inventory = {};

        this.registry.set("coins", this.data.coins);


        if (!this.data.inventory) this.data.inventory = {};

        this.add.image(360, 640, "shop_bg").setOrigin(0.5);

        this.add.text(360, 80, "Shop", {
            fontSize: "48px",
            color: "#ffffff"
        }).setOrigin(0.5);


        this.foods = [
            { key: "pizza", label: "Pizza", cost: 15, desc: "A cheesy slice of pizza." },
            { key: "meat", label: "Meat", cost: 20, desc: "A hearty chunk of meat." },
            { key: "apple", label: "Apple", cost: 5, desc: "A fresh, juicy apple." },
            { key: "fish", label: "Fish", cost: 10, desc: "A tasty fish treat." }
        ];

        this.currentIndex = 0;
        this.displayedElements = [];

        this.createItemDisplay(this.foods[this.currentIndex]);

        // Arrows
        this.leftArrow = this.add.image(600, 1050, "left_arrow")
            .setInteractive({ useHandCursor: true })
            .setScale(0.4)
            .setDepth(10)
            .setOrigin(0.5);

        this.rightArrow = this.add.image(120, 1050, "right_arrow")
            .setInteractive({ useHandCursor: true })
            .setScale(0.4)
            .setDepth(10)
            .setOrigin(0.5);

        this.leftArrow.on("pointerdown", () => this.changeItem(-1));
        this.rightArrow.on("pointerdown", () => this.changeItem(1));

        // Back button
        const backBtn = this.add.image(360, 1180, "button")
            .setInteractive({ useHandCursor: true })
            .setScale(1)
            .setOrigin(0.5);

        this.add.text(360, 1180, "Back", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
    }

    createItemDisplay(food) {
        this.clearDisplay();

        const centerX = 360;
        const centerY = 640;

        if (!this.data.inventory[food.key]) this.data.inventory[food.key] = 0;

        const icon = this.add.image(centerX, centerY - 150, food.key)
            .setScale(0.6)
            .setOrigin(0.5);

        const name = this.add.text(centerX, centerY + 60, food.label, {
            fontSize: "40px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const desc = this.add.text(centerX, centerY + 110, food.desc, {
            fontSize: "24px",
            color: "#ffffcc",
            wordWrap: { width: 500, useAdvancedWrap: true },
            align: "center"
        }).setOrigin(0.5);

        const cost = this.add.text(centerX, centerY + 170, `Cost: ${food.cost} coins`, {
            fontSize: "28px",
            color: "#ffff66"
        }).setOrigin(0.5);

        const ownedText = this.add.text(centerX, centerY + 210, `Owned: ${this.data.inventory[food.key]}`, {
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const buyBtn = this.add.image(centerX, centerY + 280, "button")
            .setScale(0.8)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        const buyLabel = this.add.text(centerX, centerY + 280, "Buy", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);
        buyBtn.on("pointerdown", () => {
            // 1. Success Path
            if (this.data.coins >= food.cost) {
                // Simple success animation (shrink/grow)
                this.tweens.add({
                    targets: buyBtn,
                    scaleX: 0.75,
                    scaleY: 0.75,
                    duration: 80,
                    yoyo: true,
                    ease: "Quad.easeInOut"
                });

                this.data.coins -= food.cost;
                this.data.inventory[food.key]++;

                // Sync global data and persist
                GameData.coins = this.data.coins;
                GameData.save();

                // Update UI
                ownedText.setText(`Owned: ${this.data.inventory[food.key]}`);
                this.registry.set("coins", this.data.coins);

            } else {
                // 2. Failure Path: Shake and Red Tint

                // Shake the main camera
                // Parameters: (duration in ms, intensity)
                this.cameras.main.shake(200, 0.01);

                // Flash the button red
                buyBtn.setTint(0xff0000);

                // Clear the red tint after a short delay
                this.time.delayedCall(300, () => {
                    buyBtn.clearTint();
                });

                // Optional: Add a subtle horizontal "No" shake just to the button
                this.tweens.add({
                    targets: buyBtn,
                    x: buyBtn.x + 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => { buyBtn.x = 360; } // Reset to center
                });
            }
        });
        

        this.displayedElements.push(icon, name, desc, cost, ownedText, buyBtn, buyLabel);
    }

    changeItem(direction) {
        this.currentIndex += direction;
        if (this.currentIndex < 0) this.currentIndex = this.foods.length - 1;
        if (this.currentIndex >= this.foods.length) this.currentIndex = 0;
        this.createItemDisplay(this.foods[this.currentIndex]);
    }

    clearDisplay() {
        this.displayedElements.forEach(el => el.destroy());
        this.displayedElements = [];
    }
}
window.ShopScreen = ShopScreen;

