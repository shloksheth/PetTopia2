class StatsScreen extends Phaser.Scene {
    constructor() {
        super("StatsScreen");
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        this.load.image("HomeScreenDay", "assets/backgrounds/HomeScreenDay.png");
    }

    create() {
        // Set bottom bar color
        this.registry.set('bottomBarColor', 0xffa500);
        // --- Ensure UIScene is running and on top (for header/footer) ---
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }
        this.scene.bringToTop('UIScene');

        GameData.load();
        const stats = GameData.stats;
        // If active pet changes elsewhere, restart to refresh displayed pet stats
        this._onPetChanged = () => this.scene.restart();
        this.registry.events.on("pet-switched", this._onPetChanged);
        this.registry.events.on("pet-added", this._onPetChanged);
        this.registry.events.on("pet-removed", this._onPetChanged);
        // Listen for language changes
        this._onLanguageChanged = () => {
            setTimeout(() => this.scene.restart(), 60);
        };
        this.game.events.on("language-changed", this._onLanguageChanged);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this._onLanguageChanged) this.game.events.off("language-changed", this._onLanguageChanged);
            if (this._onPetChanged) {
                this.registry.events.off("pet-switched", this._onPetChanged);
                this.registry.events.off("pet-added", this._onPetChanged);
                this.registry.events.off("pet-removed", this._onPetChanged);
            }
        });
        const pet = GameData.getActivePet();
        const achievementMap = {
            "first_pet": "🐾 First Pet Raised",
            "first_adult": "🐕 First Adult Form",
            "first_evolution": "🐉 First Evolution",
            "perfect_week": "🌟 Perfect Care Week"
        };
        // Background
        const bg = this.add.image(360, 640, "HomeScreenDay").setOrigin(0.5);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        // --- Scrollable Container ---
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(60, 60, 600, 1100);
        const mask = maskShape.createGeometryMask();

        const container = this.add.container(0, 0);
        container.setMask(mask);

        let yPos = 80;
        const spacing = 60;
        const fontSize = 28;

        // Title
        container.add(this.add.text(360, yPos, "Statistics 📊", {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5));
        yPos += 120;

        // Currency Stats
        container.add(this.add.text(360, yPos, "Currency Statistics", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5));
        yPos += spacing + 20;

        this.addStatLineToContainer(container, "Total Coins Earned:", stats.totalCoinsEarned || 0, yPos);
        yPos += spacing;
        this.addStatLineToContainer(container, "Total Coins Spent:", stats.totalCoinsSpent || 0, yPos);
        yPos += spacing;
        this.addStatLineToContainer(container, "Current Coins:", GameData.coins, yPos);
        yPos += spacing + 10;

        this.addStatLineToContainer(container, "Total Gems Earned:", stats.totalGemsEarned || 0, yPos);
        yPos += spacing;
        this.addStatLineToContainer(container, "Total Gems Spent:", stats.totalGemsSpent || 0, yPos);
        yPos += spacing;
        this.addStatLineToContainer(container, "Current Gems:", GameData.gems, yPos);
        yPos += spacing + 20;

        // Pet Stats
        container.add(this.add.text(360, yPos, "Pet Statistics", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#00ff88",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5));
        yPos += spacing + 20;

        this.addStatLineToContainer(container, "Pets Raised:", stats.petsRaised || 0, yPos);
        yPos += spacing;

        if (pet) {
            this.addStatLineToContainer(container, "Current Pet Level:", pet.level || 1, yPos);
            yPos += spacing;
            this.addStatLineToContainer(container, "Current Pet XP:", pet.xp || 0, yPos);
            yPos += spacing;
            this.addStatLineToContainer(container, "Growth Stage:", (pet.growthStage || "baby").toUpperCase(), yPos);
            yPos += spacing;
        }

        // Login Streak
        yPos += 10;
        container.add(this.add.text(360, yPos, "Daily Login Streak", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ff6600",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5));
        yPos += spacing;

        // Achievements
        yPos += spacing + 20;
        container.add(this.add.text(360, yPos, "Achievements", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ff00ff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5));
        yPos += spacing;

        if (GameData.achievements.length === 0) {
            container.add(this.add.text(360, yPos, "No achievements yet", {
                fontSize: fontSize,
                fontFamily: "Arial",
                color: "#888888"
            }).setOrigin(0.5));
        } else {
            GameData.achievements.forEach(ach => {
                const name = achievementMap[ach] || ach;
                container.add(this.add.text(360, yPos, name, {
                    fontSize: fontSize,
                    fontFamily: "Arial Black",
                    color: "#00ff88"
                }).setOrigin(0.5));
                yPos += spacing - 10;
            });
        }

        // --- Scroll logic ---
        let isDragging = false;
        let startY = 0;
        let lastY = 0;
        let minY = Math.min(0, 1100 - yPos - 60); // allow scrolling up if content is taller
        container.y = 0;

        container.setInteractive(new Phaser.Geom.Rectangle(60, 60, 600, 1100), Phaser.Geom.Rectangle.Contains);
        container.on('pointerdown', (pointer) => {
            isDragging = true;
            startY = pointer.y;
            lastY = container.y;
        });
        this.input.on('pointerup', () => {
            isDragging = false;
        });
        this.input.on('pointermove', (pointer) => {
            if (!isDragging) return;
            let newY = lastY + (pointer.y - startY);
            // Clamp scroll
            newY = Phaser.Math.Clamp(newY, minY, 0);
            container.y = newY;
        });
    }

    // Helper for scrollable container
    addStatLineToContainer(container, label, value, y) {
        container.add(this.add.text(200, y, label, {
            fontSize: 28,
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0, 0.5));

        container.add(this.add.text(520, y, value.toString(), {
            fontSize: 28,
            fontFamily: "Arial Black",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(1, 0.5));
    }
}

window.StatsScreen = StatsScreen;
