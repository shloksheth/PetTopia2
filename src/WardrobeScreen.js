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
        // --- Ensure UIScene is running and on top (for header/footer) ---
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }
        this.scene.bringToTop('UIScene');
        GameData.load();
        this.data = GameData;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const topOffset = 100; // Account for UIScene top bar

        // Background image
        const bg = this.add.image(width/2, height/2, "wardrobeBg").setOrigin(0.5);
        bg.setDisplaySize(width, height);
        
        // Overlay for better text readability
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.35).setOrigin(0.5);

        // Title with styling
        this.add.text(width/2, topOffset + 40, "🧥 Wardrobe & Styling", { 
            fontSize: "36px", 
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);

        // Show gem balance (top right)
        this.gemsText = this.add.text(width - 25, topOffset + 15, `💎 ${this.data.gems}`, { 
            fontSize: "22px", 
            fontFamily: "Arial Black",
            color: "#ffff00",
            backgroundColor: "#333333",
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0);

        // Pet preview section - centered
        const pet = GameData.getActivePet();
        
        // Initialize customization if it doesn't exist
        if (!pet.customization) {
            pet.customization = { hat: null, collar: null, skin: "default" };
        }
        
        const petEmoji = pet.type === "cat" ? "🐱" : "🐶";
        
        this.petPreviewX = width/2;
        this.petPreviewY = topOffset + 130;
        
        // Pet preview circle background
        this.add.circle(this.petPreviewX, this.petPreviewY, 70, 0x6b46c1, 0.85)
            .setStrokeStyle(3, 0xffffff);

        // Pet display
        this.petPreview = this.add.text(this.petPreviewX, this.petPreviewY, petEmoji, {
            fontSize: "65px"
        }).setOrigin(0.5);

        // Hat emoji will be placed above pet
        this.updateHatDisplay();

        // Style options container - organized horizontally
        this.createStyleDialog(pet, width, height, topOffset);

        // Pet list section title
        this.add.text(width/2, topOffset + 340, "👥 Your Pets", { 
            fontSize: "20px", 
            fontFamily: "Arial Black",
            color: "#00ff88",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5);

        // Pet list with scrolling area
        this.petButtons = [];
        let petY = topOffset + 385;
        const maxPetsToShow = 2; // Show max 2 pets in list area
        
        for (let i = 0; i < GameData.pets.length; i++) {
            const p = GameData.pets[i];
            const isActive = i === GameData.activePetIndex;
            
            const petBtn = this.add.rectangle(width/2, petY, 300, 45, isActive ? 0x00ff88 : 0x333333, 1)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, isActive ? 0xffffff : 0x888888);

            const petText = this.add.text(width/2 - 130, petY, `${isActive ? '✓' : '○'} ${p.name}`, { 
                fontSize: "17px", 
                fontFamily: "Arial Black",
                color: isActive ? "#000000" : "#ffffff"
            }).setOrigin(0, 0.5);

            const petTypeText = this.add.text(width/2 + 130, petY, p.type.toUpperCase(), { 
                fontSize: "13px", 
                fontFamily: "Arial",
                color: isActive ? "#000000" : "#cccccc"
            }).setOrigin(1, 0.5);

            this.petButtons.push({ btn: petBtn, text: petText, typeText: petTypeText, index: i });

            petBtn.on('pointerover', () => {
                if (!isActive) {
                    petBtn.setFillStyle(0x444444);
                }
            });

            petBtn.on('pointerout', () => {
                if (!isActive) {
                    petBtn.setFillStyle(0x333333);
                }
            });

            petBtn.on('pointerdown', () => {
                GameData.switchToPet(i);
                GameData.save();
                this.scene.restart();
            });

            petY += 52;
            if (i >= maxPetsToShow - 1) break; // Limit visible pets
        }

        // Pet management buttons at bottom
        const buttonY = topOffset + 530;
        const buttonWidth = 150;
        const buttonHeight = 52;
        
        // Buy Pet Slot button
        const slotBtn = this.add.rectangle(width/2 - 85, buttonY, buttonWidth, buttonHeight, 0x6b46c1, 1)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);
        
        const slotLabel = this.add.text(width/2 - 85, buttonY, "🛒 Slot\n(25 💎)", { 
            fontSize: "15px", 
            fontFamily: "Arial Black",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5);

        slotBtn.on("pointerover", () => slotBtn.setFillStyle(0x8b5cf6));
        slotBtn.on("pointerout", () => slotBtn.setFillStyle(0x6b46c1));

        slotBtn.on("pointerdown", () => {
            console.log("Slot button clicked");
            const result = GameData.purchasePetSlot();
            console.log("Purchase result:", result);
            if (result) {
                this.gemsText.setText(`💎 ${GameData.gems}`);
                this.updatePetList();
            } else {
                this.cameras.main.shake(200, 0.01);
            }
        });

        // Buy Pet button
        const buyPetCost = 50;
        const buyPetBtn = this.add.rectangle(width/2 + 85, buttonY, buttonWidth, buttonHeight, 0xe11d48, 1)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);

        const petLabel = this.add.text(width/2 + 85, buttonY, `🐾 Pet\n(${buyPetCost} 💎)`, { 
            fontSize: "15px", 
            fontFamily: "Arial Black",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5);

        buyPetBtn.on("pointerover", () => buyPetBtn.setFillStyle(0xf43f5e));
        buyPetBtn.on("pointerout", () => buyPetBtn.setFillStyle(0xe11d48));

        buyPetBtn.on("pointerdown", () => {
            console.log("Buy pet button clicked. Gems:", GameData.gems, "Cost:", buyPetCost);
            if (GameData.gems >= buyPetCost) {
                // Ensure there's a slot available
                if (GameData.pets.length >= GameData.maxPetSlots) {
                    console.log("No pet slots available");
                    this.cameras.main.shake(200, 0.01);
                    return;
                }

                console.log("Buying pet...");
                GameData.gems -= buyPetCost;
                const newIndex = GameData.pets.length + 1;
                const name = `Pet ${newIndex}`;
                // default type to dog
                if (GameData.addPet(name, "dog")) {
                    GameData.save();
                    this.gemsText.setText(`💎 ${GameData.gems}`);
                    this.scene.restart();
                }
            } else {
                console.log("Not enough gems");
                this.cameras.main.shake(200, 0.01);
            }
        });

        this.updatePetList();
    }

    createStyleDialog(pet, width, height, topOffset) {
        // Style container background - centered
        const dialogY = topOffset + 230;
        const containerBg = this.add.rectangle(width/2, dialogY, 660, 240, 0x1a1a1a, 0.92)
            .setStrokeStyle(3, 0x00ff88)
            .setOrigin(0.5);

        let startY = topOffset + 200;

        // --- Hats Section ---
        this.add.text(width/2 - 300, startY, "🎩 Hats", {
            fontSize: "17px",
            fontFamily: "Arial Black",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0, 0.5);

        const hats = ["None", "Cap", "Crown", "Beanie"];
        const hatEmojis = ["❌", "🧢", "👑", "🎿"];

        let hatStartX = width/2 - 240;
        for (let i = 0; i < hats.length; i++) {
            const hat = hats[i];
            const hatEmoji = hatEmojis[i];
            const isSelected = pet.customization.hat === hat || (pet.customization.hat === null && hat === "None");

            const hatBtn = this.add.rectangle(
                hatStartX + (i * 65),
                startY + 45,
                58,
                45,
                isSelected ? 0x00ff88 : 0x333333,
                1
            )
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, isSelected ? 0xffffff : 0x666666);

            this.add.text(
                hatStartX + (i * 65),
                startY + 45,
                hatEmoji,
                { fontSize: "22px" }
            ).setOrigin(0.5);

            hatBtn.on("pointerover", () => {
                if (!isSelected) hatBtn.setFillStyle(0x444444);
            });

            hatBtn.on("pointerout", () => {
                if (!isSelected) hatBtn.setFillStyle(0x333333);
            });

            hatBtn.on("pointerdown", () => {
                pet.customization.hat = hat === "None" ? null : hat;
                GameData.save();
                this.updateHatDisplay();
                this.scene.restart();
            });
        }

        // --- Collars Section ---
        this.add.text(width/2 - 300, startY + 110, "⭕ Collars", {
            fontSize: "17px",
            fontFamily: "Arial Black",
            color: "#00ff88",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0, 0.5);

        const collars = ["None", "Red", "Blue", "Gold"];
        const collarEmojis = ["❌", "🔴", "🔵", "🟡"];

        let collarStartX = width/2 - 240;
        for (let i = 0; i < collars.length; i++) {
            const collar = collars[i];
            const collarEmoji = collarEmojis[i];
            const isSelected = pet.customization.collar === collar || (pet.customization.collar === null && collar === "None");

            const collarBtn = this.add.rectangle(
                collarStartX + (i * 65),
                startY + 155,
                58,
                45,
                isSelected ? 0x00ff88 : 0x333333,
                1
            )
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, isSelected ? 0xffffff : 0x666666);

            this.add.text(
                collarStartX + (i * 65),
                startY + 155,
                collarEmoji,
                { fontSize: "22px" }
            ).setOrigin(0.5);

            collarBtn.on("pointerover", () => {
                if (!isSelected) collarBtn.setFillStyle(0x444444);
            });

            collarBtn.on("pointerout", () => {
                if (!isSelected) collarBtn.setFillStyle(0x333333);
            });

            collarBtn.on("pointerdown", () => {
                pet.customization.collar = collar === "None" ? null : collar;
                GameData.save();
                this.scene.restart();
            });
        }
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
                    this.petPreviewY - 85,
                    hatEmoji,
                    { fontSize: "42px" }
                ).setOrigin(0.5);
            }
        }
    }

    updatePetList() {
        // Refresh gem display and pet list marks
        this.gemsText.setText(`💎 ${GameData.gems}`);
        for (let item of this.petButtons) {
            const p = GameData.pets[item.index];
            const isActive = item.index === GameData.activePetIndex;
            const btn = item.btn;
            const txt = item.text;
            const typeText = item.typeText;

            if (isActive) {
                btn.setFillStyle(0x00ff88);
                btn.setStrokeStyle(3, 0xffffff);
                txt.setColor("#000000");
                typeText.setColor("#000000");
                txt.setText(`✓ ${p.name}`);
            } else {
                btn.setFillStyle(0x333333);
                btn.setStrokeStyle(2, 0x888888);
                txt.setColor("#ffffff");
                typeText.setColor("#cccccc");
                txt.setText(`○ ${p.name}`);
            }
        }
    }
}

window.WardrobeScreen = WardrobeScreen;