class ShopScreen extends Phaser.Scene {
    constructor() {
        super("ShopScreen");
    }

    preload() {
        // UI Assets
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        this.load.image("left_arrow", "assets/icons/left_arrow.png");
        this.load.image("right_arrow", "assets/icons/right_arrow.png");
        this.load.image("shop_bg", "assets/backgrounds/shop_background.jpeg");

        // Food Assets (matches your HomeScreen keys)
        this.load.image("pizza", "assets/icons/pizza.png");
        this.load.image("meat", "assets/ui/meat_without_bg_2.png");
        this.load.image("apple", "assets/ui/apple_without_bg.png");
        this.load.image("fish", "assets/ui/fish_without_bg.png");

        // Supplies Assets (Check paths if these exist)
        //this.load.image("soap", "assets/ui/soap.png");
       // this.load.image("medicine", "assets/ui/medicine.png");
       // this.load.image("toilet_paper", "assets/ui/toilet_paper.png");
    }

    create() {
        GameData.load();
        this.data = GameData;
        this.currentIndex = 0;
        this.currentTab = "Food";
        this.displayedElements = [];

        // Background
        this.add.image(360, 640, "shop_bg").setOrigin(0.5);

        this.add.text(360, 80, "Shop", {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5);

        // Define Items
        this.foodItems = [
            { key: "pizza", label: "Pizza", cost: 15, desc: "A cheesy slice of pizza.", icon: "🍕" },
            { key: "meat", label: "Meat", cost: 20, desc: "A hearty chunk of meat.", icon: "🍖" },
            { key: "apple", label: "Apple", cost: 5, desc: "A fresh, juicy apple.", icon: "🍎" },
            { key: "fish", label: "Fish", cost: 10, desc: "A tasty fish treat.", icon: "🐟" }
        ];

        this.suppliesItems = [
            { key: "soap", label: "Soap", cost: 12, desc: "Cleans your pet.", icon: "🧼" },
            { key: "medicine", label: "Medicine", cost: 30, desc: "Helps heal your pet.", icon: "💊" },
            { key: "toilet_paper", label: "Toilet Paper", cost: 6, desc: "Essential bathroom supply.", icon: "🧻" }
        ];

        // Tab Buttons
        const foodBtn = this.add.text(220, 160, "Food", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#00ccff",
            backgroundColor: "#000000",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const suppliesBtn = this.add.text(500, 160, "Supplies", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#444444",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        foodBtn.on("pointerdown", () => {
            this.currentTab = "Food";
            this.currentIndex = 0;
            foodBtn.setBackgroundColor("#000000").setColor("#00ccff");
            suppliesBtn.setBackgroundColor("#444444").setColor("#ffffff");
            this.createItemDisplay(this.getCurrentItems()[this.currentIndex]);
        });

        suppliesBtn.on("pointerdown", () => {
            this.currentTab = "Supplies";
            this.currentIndex = 0;
            suppliesBtn.setBackgroundColor("#000000").setColor("#00ccff");
            foodBtn.setBackgroundColor("#444444").setColor("#ffffff");
            this.createItemDisplay(this.getCurrentItems()[this.currentIndex]);
        });

        // Navigation Arrows
        this.add.image(120, 1050, "right_arrow").setFlipX(true).setScale(0.4).setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.changeItem(-1));

        this.add.image(600, 1050, "right_arrow").setScale(0.4).setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.changeItem(1));

        // Back Button
        const backBtn = this.add.image(360, 1180, "button").setInteractive({ useHandCursor: true });
        this.add.text(360, 1180, "Back", { fontSize: "32px", color: "#ffffff" }).setOrigin(0.5);
        backBtn.on("pointerdown", () => this.scene.start("HomeScreen"));

        // Initial Display
        this.createItemDisplay(this.getCurrentItems()[this.currentIndex]);
    }

    getCurrentItems() {
        return this.currentTab === "Food" ? this.foodItems : this.suppliesItems;
    }

    createItemDisplay(item) {
        this.clearDisplay();
        const centerX = 360;
        const centerY = 600;

        // Image or Emoji Fallback
        let visual;
        if (this.textures.exists(item.key)) {
            visual = this.add.image(centerX, centerY - 100, item.key).setScale(0.8);
        } else {
            visual = this.add.text(centerX, centerY - 100, item.icon, { fontSize: "120px" }).setOrigin(0.5);
        }

        const name = this.add.text(centerX, centerY + 100, item.label, { fontSize: "42px", fontFamily: "Arial Black" }).setOrigin(0.5);
        const desc = this.add.text(centerX, centerY + 160, item.desc, { fontSize: "24px", align: "center", wordWrap: { width: 450 } }).setOrigin(0.5);
        const cost = this.add.text(centerX, centerY + 230, `${item.cost} Coins`, { fontSize: "32px", color: "#ffff00" }).setOrigin(0.5);

        const owned = this.add.text(centerX, centerY + 280, `In Stock: ${GameData.inventory[item.key] || 0}`, { fontSize: "24px" }).setOrigin(0.5);

        const buyBtn = this.add.image(centerX, centerY + 360, "button").setScale(0.8).setInteractive({ useHandCursor: true });
        const buyLabel = this.add.text(centerX, centerY + 360, "BUY", { fontSize: "32px", fontFamily: "Arial Black" }).setOrigin(0.5);

        buyBtn.on("pointerdown", () => {
            if (GameData.coins >= item.cost) {
                // Deduct Coins
                GameData.coins -= item.cost;

                // Add to Inventory
                if (!GameData.inventory[item.key]) GameData.inventory[item.key] = 0;
                GameData.inventory[item.key]++;

                // Update Stats (matching your StatsScreen needs)
                if (GameData.stats) GameData.stats.totalCoinsSpent += item.cost;

                // Save
                GameData.save();
                this.registry.events.emit("update-stats");
                // Update UI
                owned.setText(`In Stock: ${GameData.inventory[item.key]}`);

                // GLOBAL SYNC: Tell UIScene to update TopBar
                this.registry.events.emit("update-stats");

                // Success Animation
                this.tweens.add({ targets: [buyBtn, buyLabel], scale: 0.7, duration: 100, yoyo: true });
            } else {
                this.cameras.main.shake(200, 0.01);
                buyBtn.setTint(0xff0000);
                this.time.delayedCall(200, () => buyBtn.clearTint());
            }
        });

        this.displayedElements.push(visual, name, desc, cost, owned, buyBtn, buyLabel);
    }

    changeItem(dir) {
        const list = this.getCurrentItems();
        this.currentIndex = (this.currentIndex + dir + list.length) % list.length;
        this.createItemDisplay(list[this.currentIndex]);
    }

    clearDisplay() {
        this.displayedElements.forEach(el => el.destroy());
        this.displayedElements = [];
    }
}
window.ShopScreen = ShopScreen;