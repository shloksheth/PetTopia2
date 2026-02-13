class WardrobeScreen extends Phaser.Scene {
    constructor() {
        super("WardrobeScreen");
        this.hatEmoji = null;
        this.collarEmoji = null;
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        if (!this.textures.exists("wardrobeBg")) this.load.image("wardrobeBg", "assets/backgrounds/wardrobe.jpg");
    }

    create() {
        // Set bottom bar color
        this.registry.set('bottomBarColor', 0xFF6B6B);
        
        // --- Ensure UIScene is running and on top (for header/footer) ---
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }
        this.scene.bringToTop('UIScene');
        GameData.load();
        this.data = GameData;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const topOffset = 120; // Account for UIScene top bar only
        const bottomOffset = 200; // Space for bottom bar

        // Background image
        const bg = this.add.image(width/2, height/2, "wardrobeBg").setOrigin(0.5);
        bg.setDisplaySize(width, height);
        
        // Overlay for better text readability
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.4).setOrigin(0.5);

        // Title
        this.add.text(width/2, topOffset + 30, "🧥 Wardrobe", { 
            fontSize: "42px", 
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        const pet = GameData.getActivePet();
        if (!pet.customization) {
            pet.customization = { hat: null, collar: null, skin: "default" };
        }
        
        const petEmoji = pet.type === "cat" ? "🐱" : "🐶";
        
        // Large pet preview - centered and prominent
        this.petPreviewX = 180;
        this.petPreviewY = topOffset + 180;
        
        // Pet preview with large circle background
        const previewBg = this.add.circle(this.petPreviewX, this.petPreviewY, 90, 0x6b46c1, 0.8)
            .setStrokeStyle(4, 0x00ff88);

        this.petPreview = this.add.text(this.petPreviewX, this.petPreviewY, petEmoji, {
            fontSize: "100px"
        }).setOrigin(0.5);

        // Hat emoji above pet
        this.updateHatDisplay();

        // Customization section on the right
        const customX = 420;
        const customY = topOffset + 100;
        
        this.add.text(customX, customY, "Style", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5);
        
        let styleY = customY + 50;
        
        // Hats
        this.add.text(customX, styleY, "🎩 Hats", {
            fontSize: "18px",
            fontFamily: "Arial Black",
            color: "#00ff88"
        }).setOrigin(0.5);
        
        styleY += 35;
        const hats = ["None", "Cap", "Crown", "Beanie"];
        const hatEmojis = ["❌", "🧢", "👑", "🎿"];
        
        for (let i = 0; i < hats.length; i++) {
            const hat = hats[i];
            const emoji = hatEmojis[i];
            const isSelected = pet.customization.hat === hat || (pet.customization.hat === null && hat === "None");
            
            const hatBtn = this.add.rectangle(
                customX - 60 + (i * 35),
                styleY,
                32,
                32,
                isSelected ? 0x00ff88 : 0x333333,
                1
            ).setInteractive({ useHandCursor: true })
             .setStrokeStyle(2, isSelected ? 0xffffff : 0x666666);
            
            this.add.text(
                customX - 60 + (i * 35),
                styleY,
                emoji,
                { fontSize: "18px" }
            ).setOrigin(0.5);
            
            hatBtn.on("pointerdown", () => {
                pet.customization.hat = hat === "None" ? null : hat;
                GameData.save();
                this.updateHatDisplay();
                this.scene.restart();
            });
        }
        
        // Collars
        styleY += 60;
        this.add.text(customX, styleY, "⭕ Collars", {
            fontSize: "18px",
            fontFamily: "Arial Black",
            color: "#00ff88"
        }).setOrigin(0.5);
        
        styleY += 35;
        const collars = ["None", "Red", "Blue", "Gold"];
        const collarEmojis = ["❌", "🔴", "🔵", "🟡"];
        
        for (let i = 0; i < collars.length; i++) {
            const collar = collars[i];
            const emoji = collarEmojis[i];
            const isSelected = pet.customization.collar === collar || (pet.customization.collar === null && collar === "None");
            
            const collarBtn = this.add.rectangle(
                customX - 60 + (i * 35),
                styleY,
                32,
                32,
                isSelected ? 0x00ff88 : 0x333333,
                1
            ).setInteractive({ useHandCursor: true })
             .setStrokeStyle(2, isSelected ? 0xffffff : 0x666666);
            
            this.add.text(
                customX - 60 + (i * 35),
                styleY,
                emoji,
                { fontSize: "18px" }
            ).setOrigin(0.5);
            
            collarBtn.on("pointerdown", () => {
                pet.customization.collar = collar === "None" ? null : collar;
                GameData.save();
                this.scene.restart();
            });
        }
        
        // Pet selector - horizontal carousel
        const petListY = topOffset + 380;
        this.add.text(width/2, petListY - 30, "Your Pets", {
            fontSize: "22px",
            fontFamily: "Arial Black",
            color: "#00ff88",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.petButtons = [];
        const maxPetsDisplay = 3;
        let petX = width/2 - 120;
        
        for (let i = 0; i < Math.min(GameData.pets.length, maxPetsDisplay); i++) {
            const p = GameData.pets[i];
            const isActive = i === GameData.activePetIndex;
            
            const petCard = this.add.rectangle(petX, petListY, 80, 100, isActive ? 0x00ff88 : 0x333333, 1)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(3, isActive ? 0xffffff : 0x888888);
            
            const petEmoji2 = p.type === "cat" ? "🐱" : "🐶";
            this.add.text(petX, petListY - 15, petEmoji2, { fontSize: "40px" })
                .setOrigin(0.5);
            
            this.add.text(petX, petListY + 20, p.name, {
                fontSize: "12px",
                fontFamily: "Arial Black",
                color: isActive ? "#000000" : "#ffffff"
            }).setOrigin(0.5);
            
            if (isActive) {
                this.add.text(petX, petListY + 40, "✓", {
                    fontSize: "24px",
                    fontFamily: "Arial Black",
                    color: "#000000"
                }).setOrigin(0.5);
            }
            
            petCard.on('pointerdown', () => {
                GameData.switchToPet(i);
                GameData.save();
                this.scene.restart();
            });
            
            this.petButtons.push({ btn: petCard, index: i });
            petX += 120;
        }
        
        // Purchase buttons at bottom
        const btnY = height - bottomOffset + 40;
        const btnWidth = 140;
        const btnHeight = 50;
        
        // Buy Slot button
        const slotBtn = this.add.rectangle(width/2 - 90, btnY, btnWidth, btnHeight, 0x6b46c1, 1)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);
        
        this.add.text(width/2 - 90, btnY, "🛒 Slot\n25💎", {
            fontSize: "13px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5);
        
        slotBtn.on("pointerover", () => slotBtn.setFillStyle(0x8b5cf6));
        slotBtn.on("pointerout", () => slotBtn.setFillStyle(0x6b46c1));
        
        slotBtn.on("pointerdown", () => {
            if (GameData.purchasePetSlot()) {
                this.scene.restart();
            } else {
                this.cameras.main.shake(200, 0.01);
            }
        });
        
        // Buy Pet button
        const buyPetCost = 50;
        const buyPetBtn = this.add.rectangle(width/2 + 90, btnY, btnWidth, btnHeight, 0xe11d48, 1)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);
        
        this.add.text(width/2 + 90, btnY, `🐾 Pet\n${buyPetCost}💎`, {
            fontSize: "13px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5);
        
        buyPetBtn.on("pointerover", () => buyPetBtn.setFillStyle(0xf43f5e));
        buyPetBtn.on("pointerout", () => buyPetBtn.setFillStyle(0xe11d48));
        
        buyPetBtn.on("pointerdown", () => {
            if (GameData.gems >= buyPetCost && GameData.pets.length < GameData.maxPetSlots) {
                GameData.gems -= buyPetCost;
                const name = `Pet ${GameData.pets.length + 1}`;
                if (GameData.addPet(name, "dog")) {
                    GameData.addPurchase("New Pet", buyPetCost);
                    GameData.save();
                    this.scene.restart();
                }
            } else {
                this.cameras.main.shake(200, 0.01);
            }
        });

        // Refresh wardrobe view when pets change elsewhere
        this._onPetChanged = () => this.scene.restart();
        this.registry.events.on("pet-switched", this._onPetChanged);
        this.registry.events.on("pet-added", this._onPetChanged);
        this.registry.events.on("pet-removed", this._onPetChanged);
        // Listen for language changes
        this._onLanguageChanged = () => {
            setTimeout(() => this.scene.restart(), 60);
        };
        this.game.events.on("language-changed", this._onLanguageChanged);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this._onLanguageChanged) this.game.events.off("language-changed", this._onLanguageChanged);
            if (this._onPetChanged) {
                this.registry.events.off("pet-switched", this._onPetChanged);
                this.registry.events.off("pet-added", this._onPetChanged);
                this.registry.events.off("pet-removed", this._onPetChanged);
            }
        });
    }

    updateHatDisplay() {
        // Remove previous hat if exists
        if (this.hatEmoji) {
            this.hatEmoji.destroy();
        }

        const pet = GameData.getActivePet();
        if (pet.customization && pet.customization.hat) {
            const hatEmojis = {
                "Cap": "🧢",
                "Crown": "👑",
                "Beanie": "🎿"
            };

            const hatEmoji = hatEmojis[pet.customization.hat];
            if (hatEmoji) {
                // Position hat above the pet's head
                this.hatEmoji = this.add.text(
                    this.petPreviewX,
                    this.petPreviewY - 100,
                    hatEmoji,
                    { fontSize: "50px" }
                ).setOrigin(0.5);
            }
        }
    }
}

window.WardrobeScreen = WardrobeScreen;