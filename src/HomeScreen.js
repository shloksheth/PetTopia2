class HomeScreen extends Phaser.Scene {
    constructor() {
        super("HomeScreen");
    }

    preload() {
        this.load.image("button", "assets/icons/button.png");
        this.load.image("coin_icon", "assets/icons/gold coin.png");
        this.load.image("gem_icon", "assets/icons/gems.png");

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


        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
        }
        for (let i = 1; i <= 8; i++) {
            this.load.image('idle_cat' + i, `assets/sprites/pets/idle cat animation/idle ${i}.png`);
        }
    }
    create() {
        const centerX = this.scale.width / 2;
        const margin = 30;

        GameData.load();
        this.data = GameData.getActivePet();


        // Set initial background key
        this.currentBgKey = GameData.isNightTime() ? "HomeScreenNight" : "HomeScreenDay";

        // Create background image first
        this.background = this.add.image(-32.5, 0, this.currentBgKey).setOrigin(0);
        this.background.setDisplaySize(this.scale.width + 75, this.scale.height);

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
        this.data.energy = Number(this.data.energy ?? 100);
        this.data.happiness = Number(this.data.happiness ?? 100);
        GameData.save();



        this.closeFoodPopup();


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
            hunger: this.createBar("Hunger", centerX - 230, 1090, 0x00cc66, this.data.hunger),
            energy: this.createBar("Health", centerX + 120, 1090, 0xffcc00, this.data.energy)
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



        this.anims.create({
            key: "dog_idle",
            frames: [...Array(8)].map((_, i) => ({ key: "idle" + (i + 1) })),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: "cat_idle",
            frames: [...Array(8)].map((_, i) => ({ key: "idle_cat" + (i + 1) })),
            frameRate: 6,
            repeat: -1
        });
        this.loadPet();


        const buttonY = 1180;

        const sleepBtn = this.add.container(centerX - 300, buttonY);
        const sleepIcon = this.add.text(0, 0, "🛏️", {
            fontSize: "48px"
        }).setOrigin(0.5);
        const sleepLabel = this.add.text(0, 50, "Sleep", {
            fontSize: "24px",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5);
        sleepBtn.add([sleepIcon, sleepLabel]);
        sleepBtn.setSize(80, 100).setInteractive({ useHandCursor: true });
        sleepBtn.on("pointerdown", () => this.scene.start("SleepScreen"));

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

        const vetBtn = this.add.container(centerX, buttonY);
        const vetIcon = this.add.text(0, 0, "🏥", {
            fontSize: "48px"
        }).setOrigin(0.5);
        const vetLabel = this.add.text(0, 50, "Vet", {
            fontSize: "24px",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5);
        vetBtn.add([vetIcon, vetLabel]);
        vetBtn.setSize(80, 100).setInteractive({ useHandCursor: true });
        vetBtn.on("pointerdown", () => this.scene.start("VetScreen"));

        // Paw Print Button (next to Shop)
        const pawBtn = this.add.container(centerX + 300, buttonY); // adjust position as needed
        const pawIcon = this.add.text(0, 0, "🐾", {
            fontSize: "48px",
            fontFamily: "Arial"
        }).setOrigin(0.5);
        const pawLabel = this.add.text(0, 50, "Pets", {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#ffffff"
        }).setOrigin(0.5);
        pawBtn.add([pawIcon, pawLabel]);
        pawBtn.setSize(100, 100).setInteractive({ useHandCursor: true });
        pawBtn.on("pointerdown", () => this.showPetSwitcher());


        foodBtn.on("pointerdown", () => {
            if (this.foodPopup) return;
            this.time.delayedCall(100, () => this.showFoodPopup());
        });

        shopBtn.on("pointerdown", () => this.scene.start("ShopScreen"));
        // Decrease stats over time
        this.time.addEvent({
            delay: 6000, // every 6 seconds
            loop: true,
            callback: () => {
                this.setBarValue("hunger", this.data.hunger - 2);
                this.setBarValue("energy", this.data.energy - 1.5);
                this.setBarValue("happiness", this.data.happiness - 1);
            }

        });

    }
    createBar(label, x, y, color, percent) {
        const barWidth = 180;
        const barHeight = 28;
        const radius = 14;

        // Label
        this.add.text(x - barWidth / 2, y - 36, label, {
            fontSize: "27px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#100000",
            strokeThickness: 3
        }).setOrigin(-0.4, 0.5);

        // Background
        const bg = this.add.graphics().setDepth(1);
        bg.fillStyle(0x733333, 1);
        bg.fillRoundedRect(x - barWidth / 2, y - barHeight / 2, barWidth, barHeight, radius);

        // Fill
        const fill = this.add.graphics().setDepth(2);
        fill.fillStyle(color, 1);
        fill.fillRoundedRect(x - barWidth / 2, y - barHeight / 2, (barWidth * percent) / 100, barHeight, radius);

        // Value text
        const valueText = this.add.text(x + barWidth / 2 + 12, y, `${Math.round(percent)}/100`, {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#fff3ff",
            stroke: "#800000",
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
                GameData.save(); // Save current pet's state
                GameData.switchToPet(i);
                scene.loadPet(); // Refresh pet sprite and stats
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
        const nameLabel = scene.add.text(160, 470, "Pet Name:", { fontSize: "30px", fontFamily: "Arial Black", color: "#ffffff" }).setOrigin(0, 0.5).setDepth(112);

        const nameInput = scene.add.dom(460, 470).createFromHTML(`
            <input type="text" id="petNameInput" name="petNameInput" placeholder="Enter name" style="font-size: 24px; padding: 8px; width: 200px; border-radius: 6px; border: none;">
        `).setDepth(112);

        const petTypeLabel = scene.add.text(160, 540, "Choose Type:", { fontSize: "30px", fontFamily: "Arial Black", color: "#ffffff" }).setOrigin(0, 0.5).setDepth(112);

        const dogBtn = scene.add.text(300, 600, "Dog", { fontSize: "28px", fontFamily: "Arial Black", color: "#ffffff", backgroundColor: "#444", padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(112);
        const catBtn = scene.add.text(420, 600, "Cat", { fontSize: "28px", fontFamily: "Arial Black", color: "#ffffff", backgroundColor: "#444", padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(112);

        const confirmBtn = scene.add.text(360, 700, "Add Pet", { fontSize: "30px", fontFamily: "Arial Black", color: "#00ff88", backgroundColor: "#000", padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(112);
        const cancelBtn = scene.add.text(360, 770, "Cancel", { fontSize: "28px", fontFamily: "Arial Black", color: "#ffffff", backgroundColor: "#444", padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(112);

        // Helper to clean up all UI elements at once
        const closeUI = () => {
            [overlay, panel, title, nameLabel, nameInput, petTypeLabel, dogBtn, catBtn, confirmBtn, cancelBtn].forEach(el => el.destroy());
        };

        let selectedType = null;
        dogBtn.on("pointerdown", () => { selectedType = "dog"; dogBtn.setBackgroundColor("#00ccff"); catBtn.setBackgroundColor("#444"); });
        catBtn.on("pointerdown", () => { selectedType = "cat"; catBtn.setBackgroundColor("#00ccff"); dogBtn.setBackgroundColor("#444"); });

        confirmBtn.on("pointerdown", () => {
            const inputElement = nameInput.getChildByName("petNameInput");
            const name = inputElement.value.trim();

            if (!name) return alert("Please enter a name.");
            if (!selectedType) return alert("Please select a pet type.");
            if (GameData.pets.some(p => p.name.toLowerCase() === name.toLowerCase())) return alert("Name already taken!");

            const success = GameData.addPet(name, selectedType);
            if (success) {
                GameData.activePetIndex = GameData.pets.length - 1;
                GameData.save();
                scene.loadPet(); // This will trigger the animation refresh
                closeUI();
            } else {
                alert("You can only have up to 2 pets.");
            }
        });

        cancelBtn.on("pointerdown", closeUI);
    }
    updateStatBars(pet) {
        this.setBarValue("hunger", pet.hunger);
        this.setBarValue("energy", pet.energy);
        this.setBarValue("happiness", pet.happiness);
    }


    showRemovePetDialog(index) {
        const scene = this;
        const pet = GameData.pets[index];

        const overlay = scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6)
            .setDepth(120)
            .setInteractive();

        const panel = scene.add.rectangle(360, 640, 580, 400, 0x330000, 0.95)
            .setStrokeStyle(4, 0xff4444)
            .setDepth(121);

        const title = scene.add.text(360, 500, "Remove Pet", {
            fontSize: "42px",
            fontFamily: "Arial Black",
            color: "#ff4444"
        }).setOrigin(0.5).setDepth(122);

        const warning = scene.add.text(360, 560, `Type "${pet.name}" to confirm deletion`, {
            fontSize: "24px",
            fontFamily: "Arial",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setDepth(122);

        const input = scene.add.dom(360, 620).createFromHTML(`
        <input type="text" id="confirmDeleteInput" name="confirmDeleteInput" placeholder="Pet name" style="
            font-size: 24px;
            padding: 8px;
            width: 300px;
            border-radius: 6px;
            border: none;
        ">
    `).setDepth(122);

        const confirmBtn = scene.add.text(260, 700, "Delete", {
            fontSize: "30px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#ff4444",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(122);

        confirmBtn.on("pointerdown", () => {
            const typed = input.getChildByName("confirmDeleteInput").value.trim();
            if (typed !== pet.name) {
                alert("Name does not match. Pet not deleted.");
                return;
            }

            GameData.removePet(index);
            scene.loadPet(); // Refresh pet sprite and stats
            [overlay, panel, title, warning, input, confirmBtn, cancelBtn].forEach(el => el.destroy());
        });

        const cancelBtn = scene.add.text(460, 700, "Cancel", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            backgroundColor: "#444",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(122);

        cancelBtn.on("pointerdown", () => {
            [overlay, panel, title, warning, input, confirmBtn, cancelBtn].forEach(el => el.destroy());
        });
    }

    loadPet() {
        GameData.save();
        this.data = GameData.getActivePet();

        if (this.petSprite) this.petSprite.destroy();

        const isCat = this.data.type === "cat";
        const spriteKey = isCat ? "idle_cat1" : "idle1";
        const animKey = isCat ? "cat_idle" : "dog_idle";

        this.petSprite = this.add.sprite(360, 800, spriteKey);

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
                14
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

        const popupBg = this.add.rectangle(390, 800, 520, 420, 0x000000, 0.85).setOrigin(0.5);
        const border = this.add.rectangle(390, 800, 520, 420).setStrokeStyle(4, 0xffffff).setOrigin(0.5);

        const foods = [
            { key: "pizza", label: "Pizza", restore: 20, desc: "Restores 20 hunger" },
            { key: "meat", label: "Meat", restore: 30, desc: "Restores 30 hunger" },
            { key: "apple", label: "Apple", restore: 10, desc: "Restores 10 hunger" },
            { key: "fish", label: "Fish", restore: 15, desc: "Restores 15 hunger" }
        ];


        const buttons = [];
        const visibleFoods = foods.filter(f => GameData.inventory[f.key] > 0);


        const tooltip = this.add.text(0, 0, "", {
            fontSize: "24px",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 6 }
        }).setDepth(1000).setVisible(false);

        if (visibleFoods.length === 0) {
            const noFoodText = this.add.text(390, 780, "No food left!", {
                fontSize: "32px",
                color: "#ffffff"
            }).setOrigin(0.5);

            const shopBtn = this.add.text(390, 840, "Go to Shop", {
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
                const qty = this.add.text(x, y + 70, `x${GameData.inventory[food.key]}`, {

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
                    this.petSprite.setScale(1.3);
                    this.time.delayedCall(200, () => {
                        this.pet.setScale(1.2);
                    });

                    GameData.inventory[food.key]--;
                    this.setBarValue("hunger", this.data.hunger + food.restore);
                    GameData.save();
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