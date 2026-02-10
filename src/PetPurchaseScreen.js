class PetPurchaseScreen extends Phaser.Scene {
    constructor() {
        super("PetPurchaseScreen");
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        this.load.image("HomeScreenDay", "assets/backgrounds/HomeScreenDay.png");
    }

    create() {
        GameData.load();
        const activePet = GameData.getActivePet();

        // Background
        const bg = this.add.image(360, 640, "HomeScreenDay").setOrigin(0.5);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        // Title
        this.add.text(360, 80, "Pet Store 🐾", {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // Info text
        this.add.text(360, 150, "Unlock new pets with gems!", {
            fontSize: "28px",
            fontFamily: "Arial",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5);

        let yPos = 250;
        const spacing = 120;

        // Display purchasable pets
        GameData.purchasablePets.forEach((petInfo, index) => {
            const isUnlocked = GameData.unlockedPets.includes(petInfo.id);
            const canUnlock = activePet && activePet.level >= petInfo.unlockLevel;
            const canAfford = GameData.gems >= petInfo.cost;

            // Pet card background
            const cardBg = this.add.rectangle(360, yPos, 600, 100, 
                isUnlocked ? 0x004400 : (canUnlock && canAfford ? 0x333333 : 0x222222),
                0.9
            ).setStrokeStyle(3, isUnlocked ? 0x00ff00 : 0xffffff);

            // Pet name
            this.add.text(150, yPos - 20, petInfo.name, {
                fontSize: "32px",
                fontFamily: "Arial Black",
                color: isUnlocked ? "#00ff00" : "#ffffff"
            }).setOrigin(0, 0.5);

            // Requirements
            const reqText = isUnlocked ? "✓ Unlocked" : 
                          !canUnlock ? `Requires Level ${petInfo.unlockLevel}` :
                          !canAfford ? `Need ${petInfo.cost} gems` :
                          `Cost: ${petInfo.cost} gems`;
            
            this.add.text(150, yPos + 20, reqText, {
                fontSize: "24px",
                fontFamily: "Arial",
                color: isUnlocked ? "#00ff00" : (canUnlock && canAfford ? "#ffff00" : "#ff4444")
            }).setOrigin(0, 0.5);

            // Purchase/Unlock button
            if (!isUnlocked && canUnlock && canAfford) {
                const buyBtn = this.add.text(550, yPos, "Buy", {
                    fontSize: "28px",
                    fontFamily: "Arial Black",
                    color: "#ffffff",
                    backgroundColor: "#00ccff",
                    padding: { x: 20, y: 10 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                buyBtn.on("pointerdown", () => {
                    const result = GameData.purchasePet(petInfo.id);
                    if (result.success) {
                        this.showMessage("Pet unlocked! You can now add it from the Pets menu.");
                        this.scene.restart();
                    } else {
                        this.showMessage("Purchase failed!");
                    }
                });
            } else if (isUnlocked) {
                this.add.text(550, yPos, "✓", {
                    fontSize: "40px",
                    color: "#00ff00"
                }).setOrigin(0.5);
            }

            yPos += spacing;
        });

        // Add Pet Slot option
        yPos += 20;
        const slotCard = this.add.rectangle(360, yPos, 600, 100, 0x333333, 0.9)
            .setStrokeStyle(3, 0xffffff);

        const slotsLeft = 5 - GameData.maxPetSlots;
        const slotText = slotsLeft > 0 ? 
            `Buy Pet Slot (${GameData.maxPetSlots}/5) - 25 gems` :
            "Max slots reached!";
        
        this.add.text(150, yPos - 20, "Pet Slot", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0, 0.5);

        this.add.text(150, yPos + 20, slotText, {
            fontSize: "24px",
            fontFamily: "Arial",
            color: slotsLeft > 0 ? "#ffff00" : "#888888"
        }).setOrigin(0, 0.5);

        if (slotsLeft > 0 && GameData.gems >= 25) {
            const slotBtn = this.add.text(550, yPos, "Buy", {
                fontSize: "28px",
                fontFamily: "Arial Black",
                color: "#ffffff",
                backgroundColor: "#00ccff",
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            slotBtn.on("pointerdown", () => {
                if (GameData.purchasePetSlot()) {
                    this.showMessage("Pet slot purchased!");
                    this.scene.restart();
                } else {
                    this.showMessage("Not enough gems!");
                }
            });
        }

        // Back button
        const backBtn = this.add.image(360, 1200, "button")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5);

        this.add.text(360, 1200, "Back", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        backBtn.on("pointerdown", () => {
            this.scene.start("HomeScreen");
        });
    }

    showMessage(text) {
        const msg = this.add.text(360, 200, text, {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            msg.destroy();
        });
    }
}

window.PetPurchaseScreen = PetPurchaseScreen;
