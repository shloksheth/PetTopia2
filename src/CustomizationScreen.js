class CustomizationScreen extends Phaser.Scene {
    constructor() {
        super("CustomizationScreen");
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        this.load.image("HomeScreenDay", "assets/backgrounds/HomeScreenDay.png");
    }

    create() {
        GameData.load();
        const pet = GameData.getActivePet();
        if (!pet.customization) {
            pet.customization = { hat: null, collar: null, skin: "default" };
        }

        // Background
        const bg = this.add.image(360, 640, "HomeScreenDay").setOrigin(0.5);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        // Title
        this.add.text(360, 80, "Customization 🎨", {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        let yPos = 250;

        // Hats Section
        this.add.text(360, yPos, "Hats", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);
        yPos += 50;

        const hats = ["None", "Cap", "Crown", "Beanie"];
        hats.forEach((hat, i) => {
            const btn = this.add.text(150 + i * 140, yPos, hat === "None" ? "❌" : `🎩`, {
                fontSize: "40px",
                backgroundColor: pet.customization.hat === hat ? "#00ff00" : "#444444",
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on("pointerdown", () => {
                pet.customization.hat = hat === "None" ? null : hat;
                GameData.save();
                this.scene.restart();
            });
        });
        yPos += 80;

        // Collars Section
        this.add.text(360, yPos, "Collars", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#00ff88",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);
        yPos += 50;

        const collars = ["None", "Red", "Blue", "Gold"];
        collars.forEach((collar, i) => {
            const color = collar === "None" ? "❌" : 
                        collar === "Red" ? "🔴" :
                        collar === "Blue" ? "🔵" : "🟡";
            const btn = this.add.text(150 + i * 140, yPos, color, {
                fontSize: "40px",
                backgroundColor: pet.customization.collar === collar ? "#00ff00" : "#444444",
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on("pointerdown", () => {
                pet.customization.collar = collar === "None" ? null : collar;
                GameData.save();
                this.scene.restart();
            });
        });
        yPos += 80;

        // Skins Section (Premium - requires gems)
        this.add.text(360, yPos, "Skins (Premium)", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ff00ff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);
        yPos += 50;

        const skins = [
            { id: "default", name: "Default", cost: 0 },
            { id: "snoopy", name: "Snoopy", cost: 20 },
            { id: "garfield", name: "Garfield", cost: 20 }
        ];

        skins.forEach((skin, i) => {
           // const isOwned = skin.cost === 0 || GameData.customization.unlockedBackgrounds?.includes(skin.id);
            const canAfford = GameData.gems >= skin.cost;
            
            const btn = this.add.text(200 + i * 160, yPos, skin.name, {
                fontSize: "24px",
                fontFamily: "Arial Black",
                color: isOwned ? "#00ff00" : (canAfford ? "#ffffff" : "#888888"),
                backgroundColor: isOwned ? "#004400" : "#444444",
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            if (!isOwned) {
                const costText = this.add.text(200 + i * 160, yPos + 40, `${skin.cost} 💎`, {
                    fontSize: "20px",
                    color: "#ffff00"
                }).setOrigin(0.5);
            }

            btn.on("pointerdown", () => {
                if (isOwned) {
                    pet.customization.skin = skin.id;
                    GameData.save();
                    this.scene.restart();
                } else if (canAfford) {
                    GameData.gems -= skin.cost;
                    if (!GameData.customization.unlockedBackgrounds) {
                        GameData.customization.unlockedBackgrounds = [];
                    }
                    GameData.customization.unlockedBackgrounds.push(skin.id);
                    pet.customization.skin = skin.id;
                    GameData.stats.totalGemsSpent += skin.cost;
                    GameData.save();
                    this.registry.events.emit("update-stats");
                    this.scene.restart();
                }
            });
        });

        // Back button
        const backBtn = this.add.image(360, 1150, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        this.add.text(360, 1150, "Back", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
    }
}

window.CustomizationScreen = CustomizationScreen;
