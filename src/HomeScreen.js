class HomeScreen extends Phaser.Scene {
    constructor() {
        super("HomeScreen");
    }

    preload() {
        this.load.image("home_bg", "assets/backgrounds/home_screen_bg.png");
        this.load.image("button", "assets/icons/button.png");
        this.load.image("coin_icon", "assets/icons/gold coin.png");
        this.load.image("gem_icon", "assets/icons/gems.png");

        this.load.image("pizza", "assets/icons/pizza.png");
        this.load.image("meat", "assets/ui/meat_without_bg.png");
        this.load.image("apple", "assets/ui/apple_without_bg.png");

        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
        }
    }

    create() {
        this.data = GameData.load();

        // Background
        this.add.image(0, 0, "home_bg").setOrigin(0);

        // Layout constants
        const centerX = this.scale.width / 2;
        const margin = 30;
        const sectionSpacing = 60;

        // Top Bar
        this.add.rectangle(0, 0, 720, 160, 0x000000, 0.35).setOrigin(0);

        this.add.image(margin, margin + 10, "coin_icon")
            .setOrigin(0)
            .setDisplaySize(48, 48);
        this.coinText = this.add.text(margin + 60, margin + 10, this.data.coins, {
            fontSize: "36px",
            color: "#ffffff"
        });

        this.add.image(margin + 180, margin + 10, "gem_icon")
            .setOrigin(0)
            .setDisplaySize(48, 48);
        this.gemText = this.add.text(margin + 240, margin + 10, this.data.gems, {
            fontSize: "36px",
            color: "#ffffff"
        });

        // Pet Name
        this.nameText = this.add.text(centerX, 200, this.data.name, {
            fontSize: "48px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.nameText.on("pointerdown", () => this.showRenameUI());

        // Status Section
        this.add.text(centerX, 270, "Pet", {
            fontSize: "36px",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.bars = {
            hunger: this.createBar("Hunger", centerX, 330, 0x00cc66, this.data.hunger),
            happiness: this.createBar("Happiness", centerX, 390, 0xff3366, 80),
            energy: this.createBar("Energy", centerX, 450, 0xffcc00, this.data.energy)
        };

        // Pet on carpet
        this.pet = this.add.sprite(centerX, 960, "idle1").setScale(1.2);
        this.anims.create({
            key: "dog_idle",
            frames: [...Array(8)].map((_, i) => ({ key: "idle" + (i + 1) })),
            frameRate: 6,
            repeat: -1
        });
        this.pet.play("dog_idle");

        // Bottom Buttons
        const buttonY = 1180;

        const foodBtn = this.add.image(centerX - 150, buttonY, "button")
            .setInteractive({ useHandCursor: true })
            .setScale(1.2)
            .setOrigin(0.5);
        this.add.text(centerX - 190, buttonY - 30, "Food", {
            fontSize: "40px",
            color: "#ffffff"
        });

        const shopBtn = this.add.image(centerX + 150, buttonY, "button")
            .setInteractive({ useHandCursor: true })
            .setScale(1.2)
            .setOrigin(0.5);
        this.add.text(centerX + 110, buttonY - 30, "Shop", {
            fontSize: "40px",
            color: "#ffffff"
        });

        foodBtn.on("pointerdown", () => this.showFoodPopup());
        shopBtn.on("pointerdown", () => this.scene.start("ShopScreen"));
    }

    createBar(label, x, y, color, percent) {
        const barWidth = 300;
        const barHeight = 24;

        this.add.text(x - barWidth / 2, y - 30, label, {
            fontSize: "28px",
            color: "#ffffff"
        });

        const bg = this.add.rectangle(x, y, barWidth, barHeight, 0x444444).setOrigin(0.5);
        const fill = this.add.rectangle(x - barWidth / 2, y, (barWidth * percent) / 100, barHeight, color)
            .setOrigin(0, 0.5);

        return { bg, fill, color, width: barWidth };
    }

    setBarValue(type, value) {
        const bar = this.bars[type];
        if (!bar) return;

        const clamped = Phaser.Math.Clamp(value, 0, 100);
        bar.fill.width = (bar.width * clamped) / 100;
        this.data[type] = clamped;
        GameData.save(this.data);
    }

    showRenameUI() {
        if (this.renameInput) return;

        this.renameInput = document.createElement("input");
        this.renameInput.type = "text";
        this.renameInput.placeholder = "Enter new name...";
        this.renameInput.style.position = "absolute";
        this.renameInput.style.top = "250px";
        this.renameInput.style.left = "50%";
        this.renameInput.style.transform = "translateX(-50%)";
        this.renameInput.style.fontSize = "28px";
        this.renameInput.style.padding = "8px";
        document.body.appendChild(this.renameInput);

        const submitBtn = this.add.text(360, 300, "Submit", {
            fontSize: "40px",
            color: "#00ff00"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        submitBtn.on("pointerdown", () => {
            const newName = this.renameInput.value.trim();
            if (newName.length > 0) {
                this.data.name = newName;
                GameData.save(this.data);
                this.nameText.setText(newName);
            }

            this.renameInput.remove();
            this.renameInput = null;
            submitBtn.destroy();
        });
    }

    showFoodPopup() {
        if (this.foodPopup) return;

        const popupBg = this.add.rectangle(360, 640, 500, 400, 0x000000, 0.85).setOrigin(0.5);
        const border = this.add.rectangle(360, 640, 500, 400).setStrokeStyle(4, 0xffffff).setOrigin(0.5);

        const foods = [
            { key: "pizza", label: "Pizza", restore: 20 },
            { key: "meat", label: "Meat", restore: 30 },
            { key: "apple", label: "Apple", restore: 10 }
        ];

        const buttons = [];

        let visibleFoods = foods.filter(f => this.data.inventory[f.key] > 0);

        if (visibleFoods.length === 0) {
            const noFoodText = this.add.text(360, 640, "No food left!\nVisit the shop to restock.", {
                fontSize: "28px",
                color: "#ffffff",
                align: "center"
            }).setOrigin(0.5);
            buttons.push(noFoodText);
        } else {
            visibleFoods.forEach((food, i) => {
                const x = 240 + i * 120;
                const y = 640;

                const icon = this.add.rectangle(x, y, 80, 80, 0x888888).setOrigin(0.5);
                const label = this.add.text(x, y - 50, food.label, {
                    fontSize: "24px",
                    color: "#ffffff"
                }).setOrigin(0.5);
                const qty = this.add.text(x, y + 50, `x${this.data.inventory[food.key]}`, {
                    fontSize: "20px",
                    color: "#ffff66"
                }).setOrigin(0.5);

                icon.setInteractive({ useHandCursor: true });
                icon.on("pointerdown", () => {
                    this.data.inventory[food.key]--;
                    this.setBarValue("hunger", this.data.hunger + food.restore);
                    GameData.save(this.data);
                    this.coinText.setText(this.data.coins);
                    this.closeFoodPopup();
                });

                buttons.push(icon, label, qty);
            });
        }

        this.foodPopup = [popupBg, border, ...buttons];
    }


    closeFoodPopup() {
        if (!this.foodPopup) return;
        this.foodPopup.forEach(el => el.destroy());
        this.foodPopup = null;
    }
}
