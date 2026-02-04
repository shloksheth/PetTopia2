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
        this.load.image("meat", "assets/ui/meat_without_bg_2.png");
        this.load.image("apple", "assets/ui/apple_without_bg.png");
        this.load.image("happiness_gradient", "assets/icons/gradient.png");
        this.load.image("smile1", "assets/icons/smile1.png");
        this.load.image("smile2", "assets/icons/smile2.png");
        this.load.image("smile3", "assets/icons/smile3.png");
        this.load.image("smile4", "assets/icons/smile4.png");
        this.load.image("smile5", "assets/icons/smile5.png");



        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
        }
    }
    create() {
        const centerX = this.scale.width / 2;
        const margin = 30;

        this.data = GameData.load();

        // Ensure all stats are numbers
        this.data.hunger = Number(this.data.hunger) || 100;
        this.data.energy = Number(this.data.energy) || 100;
        this.data.happiness = Number(this.data.happiness) || 100;

        this.closeFoodPopup();

        const bg = this.add.image(0, 0, "home_bg").setOrigin(0);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        this.data.coins += 5;
        this.registry.events.emit("update-stats", this.data);

        this.nameText = this.add.text(centerX, 200, this.data.name, {
            fontSize: "48px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.nameText.on("pointerdown", () => this.showRenameUI());
        // Rename button (🖋️ icon with black square background)
        this.renameBtn = this.add.text(centerX + 140, 200, "🖋️", {
            fontSize: "28px",
            backgroundColor: "#000000",
            color: "#ffffff",
            padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.renameBtn.on("pointerdown", () => this.showRenameUI());


       


        this.bars = {
            hunger: this.createBar("Hunger", centerX, 340, 0x00cc66, this.data.hunger),
            energy: this.createBar("Health", centerX, 480, 0xffcc00, this.data.energy)
        };


        this.happinessBarX = 60;
        this.happinessBarY = 640;
        this.happinessBarWidth = 40;
        this.happinessBarHeight = 400;

        this.happinessBar = this.add.image(this.happinessBarX, this.happinessBarY, "happiness_gradient")
            .setOrigin(0.5)
            .setDisplaySize(this.happinessBarHeight, this.happinessBarWidth)
            .setAngle(90) // rotates horizontal gradient to vertical
            .setDepth(5);



        this.happinessOverlay = this.add.rectangle(
            this.happinessBarX,
            this.happinessBarY,
            this.happinessBarWidth,
            this.happinessBarHeight,
            0x000000,
            0.4 // Adjust opacity here (0 = transparent, 1 = solid)
        ).setOrigin(0.5).setDepth(6);


        this.happinessFace = this.add.image(
            this.happinessBarX,
            this.getHappinessY(this.data.happiness),
            "smile1"
        ).setOrigin(0.5).setDisplaySize(70, 65).setDepth(10);
        this.happinessText = this.add.text(
            this.happinessBarX,
            this.happinessBarY + this.happinessBarHeight / 2 + 30,
            `${this.data.happiness}/100`,
            {
                fontSize: "28px",
                fontFamily: "Arial Black",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(10);



        this.pet = this.add.sprite(centerX, 800, "idle1").setScale(1.0);
        this.anims.create({
            key: "dog_idle",
            frames: [...Array(8)].map((_, i) => ({ key: "idle" + (i + 1) })),
            frameRate: 6,
            repeat: -1
        });
        this.pet.play("dog_idle");

        const buttonY = 1180;

        // Food Button with 🍖 emoji
        const foodBtn = this.add.container(centerX - 150, buttonY);
        const foodIcon = this.add.text(0, 0, "🍖", {
            fontSize: "48px"
        }).setOrigin(0.5);
        const foodLabel = this.add.text(0, 50, "Food", {
            fontSize: "24px",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5);
        foodBtn.add([foodIcon, foodLabel]);
        foodBtn.setSize(80, 100).setInteractive({ useHandCursor: true });
        foodBtn.on("pointerdown", () => {
            if (this.foodPopup) return;
            this.time.delayedCall(100, () => this.showFoodPopup());
        });

        // Shop Button with 🏪 emoji
        const shopBtn = this.add.container(centerX + 150, buttonY);
        const shopIcon = this.add.text(0, 0, "🏪", {
            fontSize: "48px"
        }).setOrigin(0.5);
        const shopLabel = this.add.text(0, 50, "Shop", {
            fontSize: "24px",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5);
        shopBtn.add([shopIcon, shopLabel]);
        shopBtn.setSize(80, 100).setInteractive({ useHandCursor: true });
        shopBtn.on("pointerdown", () => this.scene.start("ShopScreen"));

        foodBtn.on("pointerdown", () => {
            if (this.foodPopup) return;
            this.time.delayedCall(100, () => this.showFoodPopup());
        });

        shopBtn.on("pointerdown", () => this.scene.start("ShopScreen"));
        // Decrease stats over time
        this.time.addEvent({
            delay: 6000, // every 10 seconds
            loop: true,
            callback: () => {
                this.setBarValue("hunger", this.data.hunger - 2);
                this.setBarValue("energy", this.data.energy - 1.5);

                if (this.data.hunger < 90 || this.data.energy < 95) {
                    this.setBarValue("happiness", this.data.happiness - 1);
                }
            }

        });

    }
    createBar(label, x, y, color, percent) {
        const barWidth = 320;
        const barHeight = 28;
        const radius = 14;

        // Label
        this.add.text(x - barWidth / 2, y - 36, label, {
            fontSize: "26px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0, 0.5);

        // Background
        const bg = this.add.graphics().setDepth(1);
        bg.fillStyle(0x333333, 1);
        bg.fillRoundedRect(x - barWidth / 2, y - barHeight / 2, barWidth, barHeight, radius);

        // Fill
        const fill = this.add.graphics().setDepth(2);
        fill.fillStyle(color, 1);
        fill.fillRoundedRect(x - barWidth / 2, y - barHeight / 2, (barWidth * percent) / 100, barHeight, radius);

        // Value text
        const valueText = this.add.text(x + barWidth / 2 + 12, y, `${Math.round(percent)}/100`, {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0, 0.5).setDepth(3);

        return {
            bg,
            fill,
            valueText,
            color,
            width: barWidth,
            height: barHeight,
            x,
            bgY: y
        };
    }





    setBarValue(type, value) {
        const bar = this.bars[type];
        if (!bar) return;

        const clamped = Phaser.Math.Clamp(value, 0, 100);
        bar.fill.clear();
        bar.fill.fillStyle(bar.color, 1);
        bar.fill.fillRoundedRect(
            bar.x - bar.width / 2,
            bar.bgY - bar.height / 2,
            (bar.width * clamped) / 100,
            bar.height,
            14
        );

        bar.valueText.setText(`${Math.round(clamped)}/100`);
        this.data[type] = clamped;
        GameData.save(this.data);

        if (type === "happiness") {
            const newY = this.getHappinessY(clamped);

            // Move the smiley
            this.tweens.add({
                targets: this.happinessFace,
                y: newY,
                duration: 300,
                ease: "Sine.easeInOut"
            });

            // Change smiley image
            const index = Math.min(4, Math.floor((100 - clamped) / 20));
            this.happinessFace.setTexture(`smile${index + 1}`);

            // Resize gray overlay above the smiley
            const overlayTop = this.happinessBarY - this.happinessBarHeight / 2;
            const overlayBottom = newY - 24; // 24 = half smiley height
            const overlayHeight = overlayBottom - overlayTop;

            this.happinessOverlay.setDisplaySize(this.happinessBarWidth, overlayHeight);
            this.happinessOverlay.setPosition(this.happinessBarX, overlayTop + overlayHeight / 2);
            this.happinessText.setText(`${Math.round(clamped)}/100`);

        }
    }
    getHappinessY(happiness) {
        const top = this.happinessBarY - this.happinessBarHeight / 2;
        const bottom = this.happinessBarY + this.happinessBarHeight / 2;
        return Phaser.Math.Linear(bottom, top, happiness / 100);
    }








    showRenameUI() {
        if (this.renameInput) return;

        // Create input box
        this.renameInput = document.createElement("input");
        this.renameInput.type = "text";
        this.renameInput.placeholder = "Pet name";
        this.renameInput.style.position = "absolute";
        this.renameInput.style.top = "260px";
        this.renameInput.style.left = "50%";
        this.renameInput.style.transform = "translateX(-50%)";
        this.renameInput.style.fontSize = "24px";
        this.renameInput.style.padding = "6px 12px";
        this.renameInput.style.border = "2px solid #000";
        this.renameInput.style.borderRadius = "6px";
        this.renameInput.style.zIndex = 1000;
        document.body.appendChild(this.renameInput);
        this.renameInput.focus();

        // Listen for Enter key
        this.renameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const newName = this.renameInput.value.trim();
                if (newName.length > 0) {
                    this.data.name = newName;
                    GameData.save(this.data);
                    this.nameText.setText(newName);
                }
                this.renameInput.remove();
                this.renameInput = null;
            }
        });
    }

    showFoodPopup() {
        if (this.foodPopup) return;

        const popupBg = this.add.rectangle(360, 640, 520, 420, 0x000000, 0.85).setOrigin(0.5);
        const border = this.add.rectangle(360, 640, 520, 420).setStrokeStyle(4, 0xffffff).setOrigin(0.5);

        const foods = [
            { key: "pizza", label: "Pizza", restore: 20, desc: "Restores 20 hunger" },
            { key: "meat", label: "Meat", restore: 30, desc: "Restores 30 hunger" },
            { key: "apple", label: "Apple", restore: 10, desc: "Restores 10 hunger" },
            { key: "fish", label: "Fish", restore: 15, desc: "Restores 15 hunger" }
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

                const icon = this.add.image(x, y, food.key).setScale(0.4).setInteractive({ useHandCursor: true });
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