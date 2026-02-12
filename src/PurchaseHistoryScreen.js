class PurchaseScreen extends Phaser.Scene {
    constructor() {
        super("PurchaseScreen");
    }

    preload() {
        if (!this.textures.exists("oldpaperBg")) {
            this.load.image("oldpaperBg", "assets/backgrounds/oldpaper.jpg");
        }
    }

    create() {
        // Set bottom bar color
        this.registry.set('bottomBarColor', 0xFFBD3B);
        // --- Ensure UIScene is running and on top (for header/footer) ---
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }
        this.scene.bringToTop('UIScene');
        GameData.load();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const topOffset = 100;

        // Background image
        const bg = this.add.image(width/2, height/2, "oldpaperBg").setOrigin(0.5);
        bg.setDisplaySize(width, height);
        
        // Overlay for better text readability
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.25).setOrigin(0.5);

        // Title
        this.add.text(width/2, topOffset + 40, "🛍️ Purchase History", { 
            fontSize: "40px", 
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        // Initialize purchase history if needed
        if (!GameData.purchaseHistory) {
            GameData.purchaseHistory = [];
        }

        const startY = topOffset + 110;
        const purchases = GameData.purchaseHistory;

        if (purchases.length === 0) {
            // No purchases yet
            this.add.text(width/2, startY + 200, "No purchases yet!", { 
                fontSize: "28px", 
                fontFamily: "Arial Black",
                color: "#888888",
                stroke: "#000000",
                strokeThickness: 2
            }).setOrigin(0.5);

            this.add.text(width/2, startY + 250, "Visit the shop to buy items", { 
                fontSize: "20px", 
                fontFamily: "Arial",
                color: "#aaaaaa"
            }).setOrigin(0.5);
        } else {
            // Display purchase history
            let itemY = startY;
            const maxItems = 8; // Show max 8 items

            // Header
            const headerBg = this.add.rectangle(width/2, itemY, 620, 40, 0x3a3a3a, 0.9)
                .setStrokeStyle(2, 0xffffff);

            this.add.text(width/2 - 250, itemY, "Item", { 
                fontSize: "18px", 
                fontFamily: "Arial Black",
                color: "#ffff00"
            }).setOrigin(0, 0.5);

            this.add.text(width/2, itemY, "Cost", { 
                fontSize: "18px", 
                fontFamily: "Arial Black",
                color: "#ffff00"
            }).setOrigin(0.5);

            this.add.text(width/2 + 240, itemY, "Date", { 
                fontSize: "18px", 
                fontFamily: "Arial Black",
                color: "#ffff00"
            }).setOrigin(1, 0.5);

            itemY += 50;

            // Purchase items (most recent first)
            for (let i = Math.min(maxItems, purchases.length) - 1; i >= 0; i--) {
                const purchase = purchases[i];
                const isEven = (Math.min(maxItems, purchases.length) - 1 - i) % 2 === 0;
                
                const itemBg = this.add.rectangle(width/2, itemY, 620, 45, isEven ? 0x2a2a2a : 0x1a1a1a, 0.85)
                    .setStrokeStyle(1, 0x555555);

                this.add.text(width/2 - 250, itemY, purchase.itemName, { 
                    fontSize: "17px", 
                    fontFamily: "Arial",
                    color: "#ffffff"
                }).setOrigin(0, 0.5);

                this.add.text(width/2, itemY, `-${purchase.cost} 💎`, { 
                    fontSize: "16px", 
                    fontFamily: "Arial Black",
                    color: "#ff6b6b"
                }).setOrigin(0.5);

                const dateStr = purchase.date ? new Date(purchase.date).toLocaleDateString() : "Unknown";
                this.add.text(width/2 + 240, itemY, dateStr, { 
                    fontSize: "15px", 
                    fontFamily: "Arial",
                    color: "#cccccc"
                }).setOrigin(1, 0.5);

                itemY += 50;
            }

            // Total spent
            const totalSpent = purchases.reduce((sum, p) => sum + p.cost, 0);
            const totalY = itemY + 30;
            
            this.add.rectangle(width/2, totalY, 620, 45, 0x3a3a3a, 0.95)
                .setStrokeStyle(2, 0xffff00);

            this.add.text(width/2 - 250, totalY, "Total Spent", { 
                fontSize: "18px", 
                fontFamily: "Arial Black",
                color: "#ffff00"
            }).setOrigin(0, 0.5);

            this.add.text(width/2, totalY, `${totalSpent} 💎`, { 
                fontSize: "18px", 
                fontFamily: "Arial Black",
                color: "#ffff00"
            }).setOrigin(0.5);
        }
    }
}

window.PurchaseScreen = PurchaseScreen;
