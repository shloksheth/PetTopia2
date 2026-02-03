class HomeScreen extends Phaser.Scene {
    constructor() {
        super("HomeScreen");
    }

    preload() {
        this.load.image("home_bg", "assets/backgrounds/home_screen_bg.png");
        this.load.image("button", "assets/icons/button.png");
        this.load.image("coin_icon", "assets/icons/gold coin.png");
        this.load.image("gem_icon", "assets/icons/gems.png");

        for (let i = 1; i <= 8; i++) {
            this.load.image("idle" + i, `assets/sprites/pets/idle dog animation/idle ${i}.png`);
        }
    }

    create() {
        this.data = GameData.load();

        // Background
        this.add.image(0, 0, "home_bg").setOrigin(0);

        // Top bar background
        this.add.rectangle(0, 0, 720, 160, 0x000000, 0.35).setOrigin(0);

        // Currency UI
        const padding = 30;
        const iconSize = 48;

        this.add.image(padding, padding + 10, "coin_icon")
            .setOrigin(0)
            .setDisplaySize(iconSize, iconSize);
        this.coinText = this.add.text(padding + 60, padding + 10, this.data.coins, {
            fontSize: "36px",
            color: "#ffffff"
        });

        this.add.image(padding + 160, padding + 10, "gem_icon")
            .setOrigin(0)
            .setDisplaySize(iconSize, iconSize);
        this.gemText = this.add.text(padding + 220, padding + 10, this.data.gems, {
            fontSize: "36px",
            color: "#ffffff"
        });

        // Pet name
        this.nameText = this.add.text(360, 200, this.data.name, {
            fontSize: "48px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.nameText.on("pointerdown", () => {
            this.showRenameUI();
        });

        // Status Bars
        this.bars = {
            hunger: this.createBar("Hunger", 360, 280, 0x00cc66, this.data.hunger),
            happiness: this.createBar("Happiness", 360, 340, 0xff3366, 80),
            energy: this.createBar("Energy", 360, 400, 0xffcc00, this.data.energy)
        };

        // Pet animation
        this.pet = this.add.sprite(360, 720, "idle1").setScale(1.2);

        this.anims.create({
            key: "dog_idle",
            frames: [...Array(8)].map((_, i) => ({ key: "idle" + (i + 1) })),
            frameRate: 6,
            repeat: -1
        });

        this.pet.play("dog_idle");

        // Shop button
        const shopBtn = this.add.image(360, 1180, "button")
            .setInteractive({ useHandCursor: true })
            .setScale(1.2)
            .setOrigin(0.5);

        this.add.text(310, 1150, "Shop", {
            fontSize: "40px",
            color: "#ffffff"
        });

        shopBtn.on("pointerdown", () => {
            this.scene.start("ShopScreen");
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
}
