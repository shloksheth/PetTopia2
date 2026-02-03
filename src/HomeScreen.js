class HomeScreen extends Phaser.Scene {
    constructor() {
        super("HomeScreen");
    }

    preload() {
        this.load.image("home_bg", "assets/backgrounds/home_screen_bg.png");
        this.load.image("button", "assets/icons/button.png");
        this.load.image("coin_icon", "assets/icons/gold coin.png");
        this.load.image("gem_icon", "assets/icons/gems.png");
        this.load.image("potion", "assets/icons/potion.png");
        this.load.image("heart", "assets/icons/heart.png");
        this.load.image("lightning", "assets/icons/lightning.png");

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

        // Coin
        this.add.image(padding, padding + 10, "coin_icon")
            .setOrigin(0)
            .setDisplaySize(iconSize, iconSize);
        this.coinText = this.add.text(padding + 60, padding + 10, this.data.coins, {
            fontSize: "36px",
            color: "#ffffff"
        });

        // Gem
        this.add.image(padding + 160, padding + 10, "gem_icon")
            .setOrigin(0)
            .setDisplaySize(iconSize, iconSize);
        this.gemText = this.add.text(padding + 220, padding + 10, this.data.gems, {
            fontSize: "36px",
            color: "#ffffff"
        });

        // Status Bars
        this.createStatusBar("potion", this.data.hunger, 400, 40);
        this.createStatusBar("heart", 80, 400, 90); // happiness placeholder
        this.createStatusBar("lightning", this.data.energy, 400, 140);

        // Pet name (click to rename)
        this.nameText = this.add.text(360, 200, this.data.name, {
            fontSize: "48px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.nameText.on("pointerdown", () => {
            this.showRenameUI();
        });

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

    createStatusBar(iconKey, percent, x, y) {
        const icon = this.add.image(x, y, iconKey).setScale(0.5).setOrigin(0, 0.5);
        const barWidth = 200;
        const barHeight = 20;
        const barBg = this.add.rectangle(x + 60, y, barWidth, barHeight, 0x333333).setOrigin(0, 0.5);
        const fillColor = iconKey === "potion" ? 0x00cc66 : iconKey === "heart" ? 0xff3366 : 0xffcc00;
        const barFill = this.add.rectangle(x + 60, y, (barWidth * percent) / 100, barHeight, fillColor).setOrigin(0, 0.5);
        return { icon, barBg, barFill };
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
