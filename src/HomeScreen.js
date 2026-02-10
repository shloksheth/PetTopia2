class HomeScreen extends Phaser.Scene {
    constructor() {
        super("HomeScreen");
    }

    preload() {

        this.load.image("pizza", "assets/icons/pizza.png");
        this.load.image("meat", "assets/ui/meat_without_bg_2.png");
        this.load.image("fish", "assets/ui/fish_without_bg.png")
        this.load.image("apple", "assets/ui/apple_without_bg.png");
        this.load.image("happiness_gradient", "assets/icons/gradient.png");
        this.load.image("smile1", "assets/icons/smile1.png");
        this.load.image("smile2", "assets/icons/smile2.png");
        this.load.image("smile3", "assets/icons/smile3.png");
        this.load.image("smile4", "assets/icons/smile4.png");
        this.load.image("smile5", "assets/icons/smile5.png");
        this.load.image("HomeScreenDay", "assets/backgrounds/HomeScreenDay.png");
        this.load.image("HomeScreenNight", "assets/backgrounds/HomeScreenNight.png");
        this.load.image("smelly_overlay", "assets/icons/smelly.png");

        // Load pet animations
        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
            this.load.image('idle_cat' + i, `assets/sprites/pets/idle cat animation/idle ${i}.png`);
        }
    }
    create() {
        const centerX = this.scale.width / 2;
        const margin = 30;

        // Respect the persistent UI top and bottom bar heights (if provided by UIScene)
        const bottomBarHeight = this.registry.get('bottomBarHeight') || Math.round(Math.max(64, this.scale.height * 0.10));
        const topBarHeight = this.registry.get('topBarHeight') || 120;
        const usableHeight = this.scale.height - bottomBarHeight - topBarHeight;
        this._usableHeight = usableHeight; // save for use in loadPet
        this._topOffset = topBarHeight;

        GameData.load();
        this.data = GameData.getActivePet();

        // Safety check - ensure pet exists
        if (!this.data) {
            console.error("No active pet found! Creating default pet...");
            GameData.addPet("Bella", "dog");
            GameData.activePetIndex = 0;
            GameData.save();
            this.data = GameData.getActivePet();
        }

        // Set initial background key
        this.currentBgKey = GameData.isNightTime() ? "HomeScreenNight" : "HomeScreenDay";

        // Create background image first
        this.background = this.add.image(-32.5, this._topOffset, this.currentBgKey).setOrigin(0);
        this.background.setDisplaySize(this.scale.width + 75, usableHeight);

        // Now safe to call updateBackground
        this.updateBackground();

        // Listen for day/night changes
        this.onDayNightChanged = this.updateBackground.bind(this);
        this.game.events.on("daynight-changed", this.onDayNightChanged);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.game.events.off("daynight-changed", this.onDayNightChanged);
        });

        // Ensure all stats are numbers
        this.data.hunger = Number(this.data.hunger ?? 100);
        this.data.water = Number(this.data.water ?? 100);
        this.data.energy = Number(this.data.energy ?? 100);
        this.data.happiness = Number(this.data.happiness ?? 100);
        this.data.health = Number(this.data.health ?? 100);
        this.data.cleanliness = Number(this.data.cleanliness ?? 100);
        if (!this.data.xp) this.data.xp = 0;
        if (!this.data.level) this.data.level = 1;
        if (!this.data.growthStage) this.data.growthStage = "baby";
        GameData.save();

        this.closeFoodPopup();
        this.registry.events.emit("update-stats", this.data);

        // Pet Name Section - Centered at top (use top area of usable screen)
        const nameY = this._topOffset + Math.round(Math.max(24, usableHeight * 0.06));



        this.nameText = this.add.text(centerX, nameY, this.data.name, {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });

        this.nameText.on("pointerdown", () => this.showRenameUI());

        // Rename button
        this.renameBtn = this.add.circle(centerX + 180, 182, 25, 0x444444, 0.9)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .setDepth(11);

        this.add.text(centerX + 180, 182, "✏️", {
            fontSize: "20px"
        }).setOrigin(0.5).setDepth(12);

        this.renameBtn.on("pointerdown", () => this.showRenameUI());

        // Level and Growth Stage Display
        const levelText = this.add.text(centerX, nameY + 60, `Level ${this.data.level} • ${this.data.growthStage.toUpperCase()}`, {
            fontSize: "24px",
            fontFamily: "Arial",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(11);

        // Stat Bars - positioned above the action buttons, confined to usableHeight
        const barY = this._topOffset + Math.round(usableHeight - 220);
        this.bars = {
            water: this.createBar("Water", centerX - 230, barY, 0x0099ff, this.data.water),
            hunger: this.createBar("Hunger", centerX + 230, barY, 0x00cc66, this.data.hunger),
            energy: this.createBar("Health", centerX, barY, 0xffcc00, this.data.energy)
        };

        // Happiness Thermometer - Left side, better positioned
        this.happinessBarX = 80;
        this.happinessBarY = 600;
        this.happinessBarWidth = 40;
        this.happinessBarHeight = 400;

        // Happiness Thermometer Background


        // Label above thermometer
        this.add.text(this.happinessBarX, this.happinessBarY - this.happinessBarHeight / 2 - 30, "HAPPINESS", {
            fontSize: "20px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);

        this.happinessBar = this.add.image(this.happinessBarX, this.happinessBarY, "happiness_gradient")
            .setOrigin(0.5)
            .setDisplaySize(this.happinessBarHeight, this.happinessBarWidth)
            .setAngle(90)
            .setDepth(5);

        this.happinessOverlay = this.add.rectangle(
            this.happinessBarX,
            this.happinessBarY,
            this.happinessBarWidth,
            this.happinessBarHeight,
            0x000000,
            0.3
        ).setOrigin(0.5).setDepth(6);

        this.happinessFace = this.add.image(
            this.happinessBarX,
            this.getHappinessY(this.data.happiness),
            "smile1"
        ).setOrigin(0.5).setDisplaySize(60, 55).setDepth(10);

        this.happinessText = this.add.text(
            this.happinessBarX,
            this.happinessBarY + this.happinessBarHeight / 2 + 25,
            `${this.data.happiness}/100`,
            {
                fontSize: "24px",
                fontFamily: "Arial Black",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(10);

        // Update happiness color based on value
        this.updateHappinessColor(this.data.happiness);



        // Create animations
        if (!this.anims.exists("dog_idle")) {
            this.anims.create({
                key: "dog_idle",
                frames: [...Array(8)].map((_, i) => ({ key: "idle" + (i + 1) })),
                frameRate: 6,
                repeat: -1
            });
        }

        if (!this.anims.exists("cat_idle")) {
            this.anims.create({
                key: "cat_idle",
                frames: [...Array(8)].map((_, i) => ({ key: "idle_cat" + (i + 1) })),
                frameRate: 6,
                repeat: -1
            });
        }

        // Load pet sprite at a Y inside the usable area
        this.petY = this._topOffset + Math.round(usableHeight * 0.55);
        this.loadPet();

        // Smelly Overlay
        const isCat = this.data.type === "cat";
        const petScale = isCat ? 0.85 : 0.7;

        this.smellyOverlay = this.add.image(this.petSprite.x, this.petSprite.y, "smelly_overlay")
            .setDepth(this.petSprite.depth + 0.5)
            .setAlpha(1.8)
            .setScale(0.3)
            .setVisible(false);

        // Status Icons - Better positioned
        this.poopIcon = this.add.text(this.petSprite.x + 120, this.petSprite.y - 80, "💩", {
            fontSize: "56px",
            stroke: "#000000",
            strokeThickness: 3
        }).setVisible(false).setDepth(20);

        this.sickIcon = this.add.text(this.petSprite.x + 120, this.petSprite.y + 80, "🤮", {
            fontSize: "56px",
            stroke: "#000000",
            strokeThickness: 3
        }).setVisible(false).setDepth(20);

        // Listener for the event emitted by TimeManager
        this.game.events.on("tasks-updated", this.refreshTaskVisuals, this);

        // Action Buttons - Organized in a clean grid
        const buttonStartY = this._topOffset + Math.round(usableHeight - 140);
        const buttonSpacing = 130;
        const buttonSize = 100;
        const buttonRadius = 15;

        // Row 1: Primary Actions
        const createActionButton = (x, y, emoji, label, action, color = 0x4a90e2) => {
            const buttonSize = 100; // Adjust based on your spacing
            const cornerRadius = 22;

            // 1. Create the Rounded Background using Graphics
            const graphics = this.add.graphics().setDepth(10);

            // Draw Shadow (offset slightly)
            graphics.fillStyle(0x000000, 0.2);
            graphics.fillRoundedRect(x - (buttonSize / 2) + 4, y - (buttonSize / 2) + 4, buttonSize, buttonSize, cornerRadius);

            // Draw Main Button
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(x - (buttonSize / 2), y - (buttonSize / 2), buttonSize, buttonSize, cornerRadius);

            // Draw Border
            graphics.lineStyle(3, 0xffffff, 1);
            graphics.strokeRoundedRect(x - (buttonSize / 2), y - (buttonSize / 2), buttonSize, buttonSize, cornerRadius);

            // 2. Create an invisible Hit Area for interactions
            // Since Graphics aren't "interactive" in the same way, we use a transparent rectangle
            const hitArea = this.add.rectangle(x, y, buttonSize, buttonSize, 0x000000, 0)
                .setInteractive({ useHandCursor: true })
                .setDepth(12);

            // 3. Icon and Label
            const btnIcon = this.add.text(x, y - 15, emoji, {
                fontSize: "44px"
            }).setOrigin(0.5).setDepth(11);

            const btnLabel = this.add.text(x, y + 32, label.toUpperCase(), {
                fontSize: "16px",
                fontFamily: "Arial Black",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(11);

            // 4. Aesthetics & Animations
            hitArea.on("pointerdown", () => {
                // Squish effect
                this.tweens.add({
                    targets: [btnIcon, btnLabel],
                    scale: 0.9,
                    duration: 80,
                    yoyo: true,
                    onComplete: action
                });
            });

            hitArea.on("pointerover", () => {
                // Subtle lift effect
                this.tweens.add({
                    targets: [btnIcon, btnLabel],
                    y: "-=5",
                    duration: 200,
                    ease: 'Power2'
                });
                graphics.setAlpha(0.9);
            });

            hitArea.on("pointerout", () => {
                this.tweens.add({
                    targets: [btnIcon, btnLabel],
                    y: (y - 15) || (y + 32), // Return to original Y
                    y: (target) => target === btnIcon ? y - 15 : y + 32,
                    duration: 200,
                    ease: 'Power2'
                });
                graphics.setAlpha(1);
            });

            return { bg: graphics, icon: btnIcon, label: btnLabel, hit: hitArea };
        };

        // Compact spacing for a single row of 6 buttons
        const spacing = 110;
        const rowY = buttonStartY; // All buttons share the same Y coordinate

        // Button 1: Feed (Left-most)
        createActionButton(centerX - (spacing * 2.5), rowY, "🍖", "Feed", () => {
            if (this.foodPopup) return;
            this.time.delayedCall(100, () => this.showFoodPopup());
        }, 0xff6b6b);

        // Button 2: Play
        createActionButton(centerX - (spacing * 1.5), rowY, "🎾", "Play", () => {
            if (this.scene.get("PlayScreen")) {
                this.scene.start("PlayScreen");
            } else {
                this.setBarValue("happiness", this.data.happiness + 10);
                GameData.addXP(this.data, 5);
            }
        }, 0x4ecdc4);

        // Button 3: Rest
        createActionButton(centerX - (spacing * 0.5), rowY, "💤", "Rest", () => {
            this.scene.start("SleepScreen");
        }, 0x95a5a6);

        // Button 4: Vet
        createActionButton(centerX + (spacing * 0.5), rowY, "🏥", "Vet", () => {
            this.scene.start("VetScreen");
        }, 0xe74c3c);

        // Button 5: Stats
        createActionButton(centerX + (spacing * 1.5), rowY, "📊", "Stats", () => {
            if (this.scene.get("StatsScreen")) {
                this.scene.start("StatsScreen");
            }
        }, 0x9b59b6);

        // Button 6: Style (Right-most)
        createActionButton(centerX + (spacing * 2.5), rowY, "🎨", "Style", () => {
            if (this.scene.get("CustomizationScreen")) {
                this.scene.start("CustomizationScreen");
            }
        }, 0xe67e22);

        // Decrease stats over time
        this.time.addEvent({
            delay: 6000, // every 6 seconds
            loop: true,
            callback: () => {
                this.setBarValue("hunger", this.data.hunger - 2);
                this.setBarValue("water", this.data.water - 1.5);
                this.setBarValue("energy", this.data.energy - 1.5);
                this.setBarValue("happiness", this.data.happiness - 1);
                // Cleanliness decreases slowly
                if (this.data.cleanliness !== undefined) {
                    this.setBarValue("cleanliness", Math.max(0, this.data.cleanliness - 0.5));
                }
            }
        });

    }
    createBar(label, x, y, color, percent) {
        const barWidth = 200;
        const barHeight = 32;
        const radius = 16;

        // Container background for better visibility


        // Label
        this.add.text(x, y - 30, label, {
            fontSize: "22px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(2);

        // Background bar
        const bg = this.add.graphics().setDepth(2);
        bg.fillStyle(0x333333, 1);
        bg.fillRoundedRect(x - barWidth / 2, y - barHeight / 2, barWidth, barHeight, radius);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(x - barWidth / 2, y - barHeight / 2, barWidth, barHeight, radius);

        // Fill bar
        const fill = this.add.graphics().setDepth(3);
        fill.fillStyle(color, 1);
        fill.fillRoundedRect(x - barWidth / 2, y - barHeight / 2, (barWidth * percent) / 100, barHeight, radius);

        // Value text
        const valueText = this.add.text(x, y, `${Math.round(percent)}/100`, {
            fontSize: "20px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(4);

        return {
            bg,
            fill,
            valueText,
            color,
            width: barWidth,
            height: barHeight,
            x,
            bgY: y,
        };
    }

    showPetSwitcher() {
        const scene = this;
        const overlay = scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6)
            .setDepth(100)
            .setInteractive();

        const panel = scene.add.rectangle(360, 640, 600, 600, 0x222222, 0.95)
            .setStrokeStyle(4, 0xffffff)
            .setDepth(101);

        const title = scene.add.text(360, 300, "Your Pets", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5).setDepth(102);

        const elements = [];
        const pets = GameData.pets;

        pets.forEach((pet, i) => {
            const y = 380 + i * 120;

            const box = scene.add.rectangle(360, y, 500, 100, i === GameData.activePetIndex ? 0x4444aa : 0x333333, 0.9)
                .setStrokeStyle(2, 0xffffff)
                .setDepth(101);

            const nameText = scene.add.text(200, y - 20, pet.name, {
                fontSize: "32px",
                fontFamily: "Arial Black",
                color: "#ffffff"
            }).setOrigin(0, 0.5).setDepth(102);

            const typeText = scene.add.text(200, y + 20, pet.type.toUpperCase(), {
                fontSize: "20px",
                fontFamily: "Arial",
                color: "#cccccc"
            }).setOrigin(0, 0.5).setDepth(102);

            const switchBtn = scene.add.text(500, y, "Switch", {
                fontSize: "24px",
                fontFamily: "Arial Black",
                color: "#00ccff",
                backgroundColor: "#000",
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

            switchBtn.on("pointerdown", () => {
                GameData.save();
                GameData.switchToPet(i);
                scene.loadPet(); // Refreshes visuals for the new pet
                [overlay, panel, title, ...elements].forEach(el => el.destroy());
            });

            const removeBtn = scene.add.text(500, y + 40, "Remove", {
                fontSize: "20px",
                fontFamily: "Arial Black",
                color: "#ff4444",
                backgroundColor: "#000",
                padding: { x: 10, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

            removeBtn.on("pointerdown", () => {
                [overlay, panel, title, ...elements].forEach(el => el.destroy());
                scene.showRemovePetDialog(i);
            });

            elements.push(box, nameText, typeText, switchBtn, removeBtn);
        });

        if (pets.length < 2) {
            const addBtn = scene.add.text(360, 620, "Add Pet", {
                fontSize: "28px",
                fontFamily: "Arial Black",
                color: "#00ff88",
                backgroundColor: "#000",
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

            addBtn.on("pointerdown", () => {
                [overlay, panel, title, addBtn, ...elements].forEach(el => el.destroy());
                scene.showAddPetDialog();
            });
            elements.push(addBtn);
        }

        const closeBtn = scene.add.text(360, 700, "Close", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#444",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

        closeBtn.on("pointerdown", () => {
            [overlay, panel, title, closeBtn, ...elements].forEach(el => el.destroy());
        });
        elements.push(closeBtn);
    }

    showAddPetDialog() {
        const scene = this;
        const overlay = scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6).setDepth(110).setInteractive();
        const panel = scene.add.rectangle(360, 640, 580, 500, 0x222222, 0.95).setStrokeStyle(4, 0xffffff).setDepth(111);

        const title = scene.add.text(360, 400, "Add a New Pet", { fontSize: "42px", fontFamily: "Arial Black", color: "#ffffff" }).setOrigin(0.5).setDepth(112);

        // Uses Phaser DOM container for the input field
        const nameInput = scene.add.dom(360, 470).createFromHTML(`
        <input type="text" id="petNameInput" placeholder="Pet Name" style="font-size: 24px; padding: 8px; width: 200px; border-radius: 6px;">
    `).setDepth(112);

        const dogBtn = scene.add.text(300, 600, "Dog", { fontSize: "28px", backgroundColor: "#444", padding: { x: 10, y: 5 } }).setOrigin(0.5).setInteractive().setDepth(112);
        const catBtn = scene.add.text(420, 600, "Cat", { fontSize: "28px", backgroundColor: "#444", padding: { x: 10, y: 5 } }).setOrigin(0.5).setInteractive().setDepth(112);

        let selectedType = null;
        dogBtn.on("pointerdown", () => { selectedType = "dog"; dogBtn.setBackgroundColor("#00ccff"); catBtn.setBackgroundColor("#444"); });
        catBtn.on("pointerdown", () => { selectedType = "cat"; catBtn.setBackgroundColor("#00ccff"); dogBtn.setBackgroundColor("#444"); });

        const confirmBtn = scene.add.text(360, 700, "Confirm", { fontSize: "30px", color: "#00ff88" }).setOrigin(0.5).setInteractive().setDepth(112);

        confirmBtn.on("pointerdown", () => {
            const name = document.getElementById("petNameInput").value.trim();
            if (name && selectedType) {
                GameData.addPet(name, selectedType);
                scene.loadPet();
                [overlay, panel, title, nameInput, dogBtn, catBtn, confirmBtn].forEach(el => el.destroy());
            }
        });
    }

    showRemovePetDialog(index) {
        const scene = this;
        const pet = GameData.pets[index];
        const overlay = scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6).setDepth(120).setInteractive();
        const panel = scene.add.rectangle(360, 640, 580, 400, 0x330000, 0.95).setStrokeStyle(4, 0xff4444).setDepth(121);

        const title = scene.add.text(360, 500, `Remove ${pet.name}?`, { fontSize: "32px", color: "#ff4444" }).setOrigin(0.5).setDepth(122);
        const confirmBtn = scene.add.text(360, 650, "Delete", { fontSize: "30px", backgroundColor: "#ff4444", padding: { x: 15, y: 10 } }).setOrigin(0.5).setInteractive().setDepth(122);

        confirmBtn.on("pointerdown", () => {
            GameData.removePet(index);
            scene.loadPet();
            [overlay, panel, title, confirmBtn].forEach(el => el.destroy());
        });
    }
    updateStatBars(pet) {
        this.setBarValue("hunger", pet.hunger);
        this.setBarValue("water", pet.water);
        this.setBarValue("energy", pet.energy);
        this.setBarValue("happiness", pet.happiness);
    }

    updateHappinessColor(happiness) {
        let color, emoji;
        if (happiness >= 70) {
            color = 0x00ff00; // Green
            emoji = "😊";
        } else if (happiness >= 40) {
            color = 0xffff00; // Yellow
            emoji = "😐";
        } else {
            color = 0xff0000; // Red
            emoji = "😞";
        }

        // Update thermometer background color
        if (this.happinessBg) {
            this.happinessBg.setFillStyle(color, 0.3);
        }

        // Update face emoji based on happiness
        const index = Math.min(4, Math.floor((100 - happiness) / 20));
        if (this.happinessFace) {
            this.happinessFace.setTexture(`smile${index + 1}`);
        }
    }


    loadPet() {
        GameData.save();
        this.data = GameData.getActivePet();

        if (this.petSprite) this.petSprite.destroy();

        const isCat = this.data.type === "cat";
        const spriteKey = isCat ? "idle_cat1" : "idle1";
        const animKey = isCat ? "cat_idle" : "dog_idle";

        const centerX = this.scale.width / 2;
        const petY = this.petY || Math.round(this.scale.height * 0.6);
        this.petSprite = this.add.sprite(centerX, petY, spriteKey);

        if (isCat) {
            this.petSprite.setScale(1.25);
        } else {
            this.petSprite.setScale(1.0);
        }

        if (this.anims.exists(animKey)) {
            this.petSprite.play(animKey);
        }

        this.nameText.setText(this.data.name);
        this.updateStatBars(this.data);
    }


    setBarValue(type, value) {
        const clamped = Phaser.Math.Clamp(value, 0, 100);
        this.data[type] = clamped;
        GameData.save();


        if (type === "happiness") {
            const newY = this.getHappinessY(clamped);

            this.tweens.add({
                targets: this.happinessFace,
                y: newY,
                duration: 300,
                ease: "Sine.easeInOut"
            });

            const index = Math.min(4, Math.floor((100 - clamped) / 20));
            this.happinessFace.setTexture(`smile${index + 1}`);

            const overlayTop = this.happinessBarY - this.happinessBarHeight / 2;
            const overlayBottom = newY - 24;
            const overlayHeight = overlayBottom - overlayTop;

            this.happinessOverlay.setDisplaySize(this.happinessBarWidth, overlayHeight);
            this.happinessOverlay.setPosition(this.happinessBarX, overlayTop + overlayHeight / 2);
            this.happinessText.setText(`${Math.round(clamped)}/100`);

            // Update color based on happiness
            this.updateHappinessColor(clamped);
        } else if (type === "cleanliness") {
            // Cleanliness is not a bar, but we track it
            this.data.cleanliness = clamped;
            GameData.save();
        } else {
            const bar = this.bars[type];
            if (!bar) return;

            bar.fill.clear();
            bar.fill.fillStyle(bar.color, 1);
            bar.fill.fillRoundedRect(
                bar.x - bar.width / 2,
                bar.bgY - bar.height / 2,
                (bar.width * clamped) / 100,
                bar.height,
                16
            );

            bar.valueText.setText(`${Math.round(clamped)}/100`);
        }
    }

    getHappinessY(happiness) {
        const top = this.happinessBarY - this.happinessBarHeight / 2;
        const bottom = this.happinessBarY + this.happinessBarHeight / 2;
        return Phaser.Math.Linear(bottom, top, happiness / 100);
    }


    updateBackground() {
        if (!this.background || !this.background.scene) return;

        const bgKey = GameData.isNightTime()
            ? "HomeScreenNight"
            : "HomeScreenDay";

        this.background.setTexture(bgKey);
    }

    refreshTaskVisuals() {
        const pet = GameData.getActivePet();
        this.smellyOverlay.setVisible(pet.isDirty);
        this.poopIcon.setVisible(pet.needsBathroom);
        this.sickIcon.setVisible(pet.isSick);
    }


    showRenameUI() {
        if (this.renameInput) return;

        // Create input box
        this.renameInput = document.createElement("input");
        this.renameInput.type = "text";
        this.renameInput.placeholder = "Enter new name";
        this.renameInput.style.position = "absolute";
        this.renameInput.style.top = "260px";
        this.renameInput.style.left = "50%";
        this.renameInput.style.transform = "translateX(-50%)";
        this.renameInput.style.fontSize = "24px";
        this.renameInput.style.padding = "10px 16px";
        this.renameInput.style.width = "220px";
        this.renameInput.style.border = "2px solid #00ccff";
        this.renameInput.style.borderRadius = "8px";
        this.renameInput.style.backgroundColor = "#111";
        this.renameInput.style.color = "#fff";
        this.renameInput.style.zIndex = 1000;
        this.renameInput.style.outline = "none";
        this.renameInput.style.textAlign = "center";
        document.body.appendChild(this.renameInput);
        this.renameInput.focus();

        // Create submit button with checkmark
        this.renameButton = document.createElement("button");
        this.renameButton.innerText = "✅ Rename";
        this.renameButton.style.position = "absolute";
        this.renameButton.style.top = "310px";
        this.renameButton.style.left = "50%";
        this.renameButton.style.transform = "translateX(-50%)";
        this.renameButton.style.fontSize = "20px";
        this.renameButton.style.padding = "8px 16px";
        this.renameButton.style.border = "none";
        this.renameButton.style.borderRadius = "6px";
        this.renameButton.style.backgroundColor = "#00ccff";
        this.renameButton.style.color = "#000";
        this.renameButton.style.fontWeight = "bold";
        this.renameButton.style.cursor = "pointer";
        this.renameButton.style.zIndex = 1000;
        document.body.appendChild(this.renameButton);

        const submitRename = () => {
            const newName = this.renameInput.value.trim();
            if (newName.length > 0) {
                this.data.name = newName;
                GameData.save();
                this.nameText.setText(newName);
            }
            this.renameInput.remove();
            this.renameButton.remove();
            this.renameInput = null;
            this.renameButton = null;
        };

        this.renameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                submitRename();
            }
        });

        this.renameButton.addEventListener("click", submitRename);
    }




    showFoodPopup() {
        if (this.foodPopup) return;

        const popupBg = this.add.rectangle(360, 640, 600, 700, 0x000000, 0.92)
            .setOrigin(0.5)
            .setDepth(50)
            .setStrokeStyle(4, 0xffffff);

        const border = this.add.rectangle(360, 640, 600, 700)
            .setStrokeStyle(4, 0x00ccff)
            .setOrigin(0.5)
            .setDepth(51);

        const title = this.add.text(360, 350, "Feed & Water", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(52);

        const foods = [
            { key: "pizza", label: "Pizza", restore: 20, desc: "Restores 20 hunger", icon: "pizza" },
            { key: "meat", label: "Meat", restore: 30, desc: "Restores 30 hunger", icon: "🍖" },
            { key: "apple", label: "Apple", restore: 10, desc: "Restores 10 hunger", icon: "🍎" },
            { key: "fish", label: "Fish", restore: 15, desc: "Restores 15 hunger", icon: "🐟" },
            { key: "water", label: "Water", restore: 25, desc: "Restores 25 water", icon: "💧", stat: "water" }
        ];


        const buttons = [];
        const visibleFoods = foods.filter(f => {
            const hasItem = GameData.inventory[f.key] > 0;
            // Water is always available (can give tap water)
            return hasItem || f.key === "water";
        });


        const tooltip = this.add.text(0, 0, "", {
            fontSize: "22px",
            fontFamily: "Arial",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 12, y: 8 },
            stroke: "#000000",
            strokeThickness: 2
        }).setDepth(1000).setVisible(false);

        if (visibleFoods.length === 0) {
            const noFoodText = this.add.text(360, 500, "No food left!", {
                fontSize: "36px",
                fontFamily: "Arial Black",
                color: "#ff4444",
                stroke: "#000000",
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(52);


        } else {
            const startX = 360 - (visibleFoods.length - 1) * 80;
            visibleFoods.forEach((food, i) => {
                const x = startX + i * 160;
                const y = 500;

                // Food item container
                const itemBg = this.add.rectangle(x, y, 120, 140, 0x333333, 0.8)
                    .setStrokeStyle(2, 0xffffff)
                    .setInteractive({ useHandCursor: true })
                    .setDepth(52);

                // Use emoji if available, otherwise image
                let icon;
                if (food.icon) {
                    icon = this.add.image(x, y - 20, food.key)
                        .setScale(0.5)
                        .setDepth(53);
                } else {
                    icon = this.add.text(x, y - 20, food.icon, {
                        fontSize: "64px"
                    }).setOrigin(0.5).setDepth(53);
                }
                const qtyText = food.key === "water" ? "∞" : `x${GameData.inventory[food.key] || 0}`;
                const qty = this.add.text(x, y + 40, qtyText, {
                    fontSize: "20px",
                    fontFamily: "Arial Black",
                    color: "#ffff00",
                    stroke: "#000000",
                    strokeThickness: 2
                }).setOrigin(0.5).setDepth(53);

                itemBg.on("pointerover", () => {
                    itemBg.setFillStyle(0x444444, 0.9);
                    tooltip.setText(food.desc);
                    tooltip.setPosition(x, y - 80);
                    tooltip.setVisible(true);
                });

                itemBg.on("pointerout", () => {
                    itemBg.setFillStyle(0x333333, 0.8);
                    tooltip.setVisible(false);
                });

                itemBg.on("pointerdown", () => {
                    this.petSprite.setScale(1.3);
                    this.time.delayedCall(200, () => {
                        const isCat = this.data.type === "cat";
                        this.petSprite.setScale(isCat ? 1.25 : 1.0);
                    });

                    // Water is free (tap water), others consume inventory
                    if (food.key !== "water") {
                        if (GameData.inventory[food.key] <= 0) return;
                        GameData.inventory[food.key]--;
                    }

                    const stat = food.stat || "hunger";
                    this.setBarValue(stat, this.data[stat] + food.restore);
                    GameData.addXP(this.data, 2);
                    GameData.save();
                    this.closeFoodPopup();
                });

                buttons.push(itemBg, icon, qty);
            });

            buttons.push(tooltip);
        }

        // Close button
        const closeBtn = this.add.rectangle(360, 950, 150, 50, 0x666666, 0.9)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .setDepth(52);

        this.add.text(360, 950, "Close", {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5).setDepth(53);

        closeBtn.on("pointerdown", () => this.closeFoodPopup());

        this.foodPopup = [popupBg, border, title, closeBtn, ...buttons];
    }

    closeFoodPopup() {
        if (!this.foodPopup) return;
        this.foodPopup.forEach(el => {
            if (el && el.destroy) el.destroy();
        });
        this.foodPopup = null;
    }

}