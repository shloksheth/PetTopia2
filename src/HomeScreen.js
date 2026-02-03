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
        this.load.image('meat', 'assets/ui/meat_without_bg_2.png');
        this.load.image("apple", "assets/ui/apple_without_bg.png");
        this.load.image('fish', "assets/ui/fish_without_bg.png");

        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
        }
    }
    create() {
        this.data = GameData.load();
        this.closeFoodPopup();

        const centerX = this.scale.width / 2;
        const margin = 30;

        this.add.image(0, 0, "home_bg").setOrigin(0);
        this.add.rectangle(0, 0, 720, 160, 0x000000, 0.35).setOrigin(0);

        this.add.image(margin, margin + 10, "coin_icon").setOrigin(0).setDisplaySize(48, 48);
        this.coinText = this.add.text(margin + 60, margin + 10, this.data.coins, { fontSize: "36px", color: "#ffffff" });

        this.add.image(margin + 180, margin + 10, "gem_icon").setOrigin(0).setDisplaySize(48, 48);
        this.gemText = this.add.text(margin + 240, margin + 10, this.data.gems, { fontSize: "36px", color: "#ffffff" });

        this.nameText = this.add.text(centerX, 200, this.data.name, {
            fontSize: "48px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.nameText.on("pointerdown", () => this.showRenameUI());

        this.add.text(centerX, 270, "Pet", { fontSize: "36px", color: "#ffffff" }).setOrigin(0.5);

        this.bars = {
            hunger: this.createBar("Hunger", centerX, 330, 0x00cc66, this.data.hunger),
            happiness: this.createBar("Happiness", centerX, 390, 0xff3366, 80),
            energy: this.createBar("Energy", centerX, 450, 0xffcc00, this.data.energy)
        };

        this.pet = this.add.sprite(centerX, 960, "idle1").setScale(1.2);
        this.anims.create({
            key: "dog_idle",
            frames: [...Array(8)].map((_, i) => ({ key: "idle" + (i + 1) })),
            frameRate: 6,
            repeat: -1
        });
        this.pet.play("dog_idle");

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

        foodBtn.on("pointerdown", () => {
            if (this.foodPopup) return;
            this.time.delayedCall(100, () => this.showFoodPopup());
        });

        shopBtn.on("pointerdown", () => this.scene.start("ShopScreen"));
        // Decrease stats over time
        this.time.addEvent({
            delay: 10000, // every 10 seconds
            loop: true,
            callback: () => {
                this.setBarValue("hunger", this.data.hunger - 2);
                this.setBarValue("energy", this.data.energy - 1);

                if (this.data.hunger < 70 || this.data.energy < 60) {
                    this.setBarValue("happiness", this.data.happiness - 1);
                }
            }

        });

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

        const valueText = this.add.text(x + barWidth / 2 + 10, y, `${Math.round(percent)}/100`, {
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0, 0.5);

        return { bg, fill, valueText, color, width: barWidth };
    }


    setBarValue(type, value) {
        const bar = this.bars[type];
        if (!bar) return;

        const clamped = Phaser.Math.Clamp(value, 0, 100);
        bar.fill.width = (bar.width * clamped) / 100;
        bar.valueText.setText(`${Math.round(clamped)}/100`);
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

        const popupBg = this.add.rectangle(360, 640, 520, 420, 0x000000, 0.85).setOrigin(0.5);
        const border = this.add.rectangle(360, 640, 520, 420).setStrokeStyle(4, 0xffffff).setOrigin(0.5);

        const foods = [
            {key: "pizza", label: "Pizza", restore: 20, desc: "Restores 20 hunger"},
            {key: "meat", label: "Meat", restore: 30, desc: "Restores 30 hunger"},
            {key: "apple", label: "Apple", restore: 5, desc: "Restores 5 hunger"},
            {key: "fish", label: "Fish", restore: 10, desc: "Restores 10 hunger"}
        ];

        const buttons = [];
        const visibleFoods = foods.filter(f => this.data.inventory[f.key] > 0);

        const tooltip = this.add.text(0, 0, "", {
            fontSize: "24px",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 6 }
        }).setDepth(1000).setVisible(false);

        if (visibleFoods.length === 0) {
            const noFoodText = this.add.text(360, 620, "No food left!", {
                fontSize: "32px",
                color: "#ffffff"
            }).setOrigin(0.5);

            const shopBtn = this.add.text(360, 680, "Go to Shop", {
                fontSize: "32px",
                color: "#00ffcc",
                backgroundColor: "#222",
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            shopBtn.on("pointerdown", () => {
                this.closeFoodPopup();
                this.scene.start("ShopScreen");
            });

            buttons.push(noFoodText, shopBtn);
        } else {
            visibleFoods.forEach((food, i) => {
                const x = 200 + i * 160;
                const y = 640;

                const icon = this.add.image(x, y, food.key).setScale(0.6).setInteractive({ useHandCursor: true });
                const qty = this.add.text(x, y + 70, `x${this.data.inventory[food.key]}`, {
                    fontSize: "24px",
                    color: "#ffff66"
                }).setOrigin(0.5);

                icon.on("pointerover", () => {
                    tooltip.setText(food.desc);
                    tooltip.setPosition(x, y - 100);
                    tooltip.setVisible(true);
                });

                icon.on("pointerout", () => {
                    tooltip.setVisible(false);
                });

                icon.on("pointerdown", () => {
                    this.pet.setScale(1.3);
                    this.time.delayedCall(200, () => {
                        this.pet.setScale(1.2);
                    });

                    this.data.inventory[food.key]--;
                    this.setBarValue("hunger", this.data.hunger + food.restore);
                    GameData.save(this.data);
                    this.coinText.setText(this.data.coins);
                    this.closeFoodPopup();
                });

                buttons.push(icon, qty);
            });

            buttons.push(tooltip);
        }

        this.foodPopup = [popupBg, border, ...buttons];
    }

    closeFoodPopup() {
        if (!this.foodPopup) return;
        this.foodPopup.forEach(el => {
            if (el && el.destroy) el.destroy();
        });
        this.foodPopup = null;
    }

}