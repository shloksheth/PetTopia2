class ShopScreen extends Phaser.Scene {
    constructor() {
        super("ShopScreen");
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
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


        this.items = [
            { key: "pizza", label: "Pizza", cost: 15, desc: "A cheesy slice of pizza.", icon: "🍕" },
            { key: "meat", label: "Meat", cost: 20, desc: "A hearty chunk of meat.", icon: "🍖" },
            { key: "apple", label: "Apple", cost: 5, desc: "A fresh, juicy apple.", icon: "🍎" },
            { key: "fish", label: "Fish", cost: 10, desc: "A tasty fish treat.", icon: "🐟" },
            { key: "water", label: "Water", cost: 8, desc: "Fresh water for your pet.", icon: "💧" },
            { key: "toy", label: "Toy", cost: 25, desc: "A fun toy to play with.", icon: "🎾" },
            { key: "cleaningSupply", label: "Cleaning Supply", cost: 30, desc: "For deep cleaning your pet.", icon: "🧼" }
        ];

        this.currentIndex = 0;
        this.displayedElements = [];
        this.currentCategory = "items"; // "items" or "pets"

        // Category buttons
        const itemsBtn = this.add.text(200, 150, "Items", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#00ccff",
            backgroundColor: "#000000",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const petsBtn = this.add.text(520, 150, "Pets", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#444444",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        itemsBtn.on("pointerdown", () => {
            this.currentCategory = "items";
            this.currentIndex = 0;
            itemsBtn.setBackgroundColor("#000000");
            itemsBtn.setColor("#00ccff");
            petsBtn.setBackgroundColor("#444444");
            petsBtn.setColor("#ffffff");
            this.createItemDisplay(this.items[this.currentIndex]);
        });

        petsBtn.on("pointerdown", () => {
            this.currentCategory = "pets";
            petsBtn.setBackgroundColor("#000000");
            petsBtn.setColor("#00ccff");
            itemsBtn.setBackgroundColor("#444444");
            itemsBtn.setColor("#ffffff");
            this.scene.start("PetPurchaseScreen");
        });

        this.createItemDisplay(this.items[this.currentIndex]);

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

    createItemDisplay(item) {
        this.clearDisplay();

        const centerX = 360;
        const centerY = 640;

        if (!this.data.inventory[item.key]) this.data.inventory[item.key] = 0;

        // Use emoji if available, otherwise try to load image
        let icon;
        if (item.icon) {
            icon = this.add.text(centerX, centerY - 150, item.icon, {
                fontSize: "80px"
            }).setOrigin(0.5);
        } else {
            icon = this.add.image(centerX, centerY - 150, item.key)
                .setScale(0.6)
                .setOrigin(0.5);
        }

        const name = this.add.text(centerX, centerY + 60, item.label, {
            fontSize: "40px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const desc = this.add.text(centerX, centerY + 110, item.desc, {
            fontSize: "24px",
            color: "#ffffcc",
            wordWrap: { width: 500, useAdvancedWrap: true },
            align: "center"
        }).setOrigin(0.5);

        const cost = this.add.text(centerX, centerY + 170, `Cost: ${item.cost} coins`, {
            fontSize: "28px",
            color: "#ffff66"
        }).setOrigin(0.5);

        const ownedText = this.add.text(centerX, centerY + 210, `Owned: ${this.data.inventory[item.key]}`, {
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
            if (this.data.coins >= item.cost) {
                // Simple success animation (shrink/grow)
                this.tweens.add({
                    targets: buyBtn,
                    scaleX: 0.75,
                    scaleY: 0.75,
                    duration: 80,
                    yoyo: true,
                    ease: "Quad.easeInOut"
                });

                this.data.coins -= item.cost;
                this.data.inventory[item.key]++;

                // Track spending
                GameData.stats.totalCoinsSpent += item.cost;

                // Sync global data and persist
                GameData.coins = this.data.coins;
                GameData.save();

                // Update UI
                ownedText.setText(`Owned: ${this.data.inventory[item.key]}`);
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
        if (this.currentIndex < 0) this.currentIndex = this.items.length - 1;
        if (this.currentIndex >= this.items.length) this.currentIndex = 0;
        this.createItemDisplay(this.items[this.currentIndex]);
    }

    clearDisplay() {
        this.displayedElements.forEach(el => el.destroy());
        this.displayedElements = [];
    }
}
window.ShopScreen = ShopScreen;

