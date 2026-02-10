class StatsScreen extends Phaser.Scene {
    constructor() {
        super("StatsScreen");
    }

    preload() {
        if (!this.textures.exists("button")) this.load.image("button", "assets/icons/button.png");
        this.load.image("HomeScreenDay", "assets/backgrounds/HomeScreenDay.png");
    }

    create() {
        GameData.load();
        const stats = GameData.stats;
        const pet = GameData.getActivePet();

        // Background
        const bg = this.add.image(360, 640, "HomeScreenDay").setOrigin(0.5);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        // Title
        this.add.text(360, 80, "Statistics 📊", {
            fontSize: "48px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        let yPos = 200;
        const spacing = 60;
        const fontSize = 28;

        // Currency Stats
        this.add.text(360, yPos, "Currency Statistics", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);
        yPos += spacing + 20;

        this.createStatLine("Total Coins Earned:", stats.totalCoinsEarned || 0, yPos);
        yPos += spacing;
        this.createStatLine("Total Coins Spent:", stats.totalCoinsSpent || 0, yPos);
        yPos += spacing;
        this.createStatLine("Current Coins:", GameData.coins, yPos);
        yPos += spacing + 10;

        this.createStatLine("Total Gems Earned:", stats.totalGemsEarned || 0, yPos);
        yPos += spacing;
        this.createStatLine("Total Gems Spent:", stats.totalGemsSpent || 0, yPos);
        yPos += spacing;
        this.createStatLine("Current Gems:", GameData.gems, yPos);
        yPos += spacing + 20;

        // Pet Stats
        this.add.text(360, yPos, "Pet Statistics", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#00ff88",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);
        yPos += spacing + 20;

        this.createStatLine("Pets Raised:", stats.petsRaised || 0, yPos);
        yPos += spacing;
        this.createStatLine("Perfect Care Days:", stats.perfectCareDays || 0, yPos);
        yPos += spacing;
        
        if (pet) {
            this.createStatLine("Current Pet Level:", pet.level || 1, yPos);
            yPos += spacing;
            this.createStatLine("Current Pet XP:", pet.xp || 0, yPos);
            yPos += spacing;
            this.createStatLine("Growth Stage:", (pet.growthStage || "baby").toUpperCase(), yPos);
            yPos += spacing;
        }

        // Login Streak
        yPos += 10;
        this.add.text(360, yPos, "Daily Login Streak", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ff6600",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);
        yPos += spacing;
        this.createStatLine("Current Streak:", `${GameData.loginStreak} days 🔥`, yPos);

        // Achievements
        yPos += spacing + 20;
        this.add.text(360, yPos, "Achievements", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ff00ff",
            stroke: "#000000",
            strokeThickness: 3
        }).setOrigin(0.5);
        yPos += spacing;

        const achievementMap = {
            "first_pet": "🐾 First Pet Raised",
            "first_adult": "🐕 First Adult Form",
            "first_evolution": "🐉 First Evolution",
            "perfect_week": "🌟 Perfect Care Week"
        };

        if (GameData.achievements.length === 0) {
            this.add.text(360, yPos, "No achievements yet", {
                fontSize: fontSize,
                fontFamily: "Arial",
                color: "#888888"
            }).setOrigin(0.5);
        } else {
            GameData.achievements.forEach(ach => {
                const name = achievementMap[ach] || ach;
                this.add.text(360, yPos, name, {
                    fontSize: fontSize,
                    fontFamily: "Arial Black",
                    color: "#00ff88"
                }).setOrigin(0.5);
                yPos += spacing - 10;
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

    createStatLine(label, value, y) {
        this.add.text(200, y, label, {
            fontSize: 28,
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(0, 0.5);

        this.add.text(520, y, value.toString(), {
            fontSize: 28,
            fontFamily: "Arial Black",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 2
        }).setOrigin(1, 0.5);
    }
}

window.StatsScreen = StatsScreen;
