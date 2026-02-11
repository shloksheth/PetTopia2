class WardrobeScreen extends Phaser.Scene {
    constructor() {
        super("WardrobeScreen");
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
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

        this.add.rectangle(width/2, height/2, width, height, 0x222222).setOrigin(0.5);
        this.add.text(width/2, 60, "Wardrobe & Pets", { fontSize: "36px", color: "#ffffff" }).setOrigin(0.5);

        // Show gem balance
        this.gemsText = this.add.text(width - 20, 20, `Gems: ${this.data.gems}`, { fontSize: "20px", color: "#ffff66" }).setOrigin(1, 0);

        // Buy Pet Slot (uses existing GameData.purchasePetSlot)
        const slotBtn = this.add.image(width/2, 180, "button").setInteractive({ useHandCursor: true }).setScale(0.9).setOrigin(0.5);
        this.add.text(width/2, 180, "Buy Pet Slot (25 gems)", { fontSize: "22px", color: "#ffffff" }).setOrigin(0.5);
        slotBtn.on("pointerdown", () => {
            if (GameData.purchasePetSlot()) {
                this.gemsText.setText(`Gems: ${GameData.gems}`);
            } else {
                this.cameras.main.shake(200, 0.01);
            }
        });

        // Buy Pet directly (adds a new pet if slot available)
        const buyPetCost = 50;
        const buyPetBtn = this.add.image(width/2, 280, "button").setInteractive({ useHandCursor: true }).setScale(0.9).setOrigin(0.5);
        this.add.text(width/2, 280, `Buy Pet (${buyPetCost} gems)`, { fontSize: "22px", color: "#ffffff" }).setOrigin(0.5);
        buyPetBtn.on("pointerdown", () => {
            if (GameData.gems >= buyPetCost) {
                // Ensure there's a slot available
                if (GameData.pets.length >= GameData.maxPetSlots) {
                    // No slot available
                    this.cameras.main.shake(200, 0.01);
                    return;
                }

                GameData.gems -= buyPetCost;
                const newIndex = GameData.pets.length + 1;
                const name = `Pet ${newIndex}`;
                // default type to dog
                if (GameData.addPet(name, "dog")) {
                    GameData.save();
                    this.gemsText.setText(`Gems: ${GameData.gems}`);
                }
            } else {
                this.cameras.main.shake(200, 0.01);
            }
        });

        // Skins list (example premium skins)
        this.skins = [
            { id: "golden", label: "Golden Skin", cost: 15 },
            { id: "shadow", label: "Shadow Skin", cost: 20 }
        ];

        let y = 380;
        this.skins.forEach(skin => {
            const btn = this.add.image(width/2, y, "button").setInteractive({ useHandCursor: true }).setScale(0.85).setOrigin(0.5);
            this.add.text(width/2, y, `${skin.label} (${skin.cost} gems)`, { fontSize: "20px", color: "#ffffff" }).setOrigin(0.5);
            btn.on("pointerdown", () => {
                if (GameData.gems >= skin.cost) {
                    GameData.gems -= skin.cost;
                    const pet = GameData.getActivePet();
                    if (pet) {
                        pet.customization = pet.customization || {};
                        pet.customization.skin = skin.id;
                        GameData.save();
                        this.gemsText.setText(`Gems: ${GameData.gems}`);
                    }
                } else {
                    this.cameras.main.shake(200, 0.01);
                }
            });
            y += 70;
        });

        // Pet list + switcher
        this.add.text(40, 120, "Your Pets:", { fontSize: "20px", color: "#ffffff" }).setOrigin(0, 0.5);
        this.petButtons = [];
        let px = 40;
        let py = 150;
        for (let i = 0; i < GameData.pets.length; i++) {
            const p = GameData.pets[i];
            const petBtn = this.add.text(px, py + (i * 28), `${i === GameData.activePetIndex ? '• ' : ''}${p.name} (${p.type})`, { fontSize: "18px", color: "#ffffff" }).setOrigin(0, 0).setInteractive({ useHandCursor: true });
            petBtn.on('pointerdown', () => {
                GameData.switchToPet(i);
                GameData.save();
                this.updatePetList();
            });
            this.petButtons.push(petBtn);
        }

        this.updatePetList();
    }

    updatePetList() {
        // Refresh gem display and pet list marks
        this.gemsText.setText(`Gems: ${GameData.gems}`);
        for (let i = 0; i < this.petButtons.length; i++) {
            const p = GameData.pets[i];
            this.petButtons[i].setText(`${i === GameData.activePetIndex ? '• ' : ''}${p.name} (${p.type})`);
        }
    }
}

window.WardrobeScreen = WardrobeScreen;