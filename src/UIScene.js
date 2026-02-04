class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: "UIScene", active: true }); // auto-starts this scene 
    }
    preload() {
        this.load.image("coin_icon", "assets/icons/gold coin.png");
        this.load.image("gem_icon", "assets/icons/gems.png");
        this.load.image("button", "assets/icons/button.png"); // if used in TopBar
        this.load.image("orange_box", "assets/icons/orange square.png");

    }

    create() {
        GameData.load();
        const pet = GameData.getActivePet(); // Make sure GameData is loaded first
        this.topBar = new TopBar(this, {
            coins: pet.coins || 0,
            gems: pet.gems || 0
        });


        // Listen for custom stat updates (used by HomeScreen)
        this.registry.events.on("update-stats", (newData) => {
            this.topBar.updateCounters(newData);
        });

        // 🔥 Listen for registry changes (used by ShopScreen)
        this.registry.events.on("changedata", (parent, key, value) => {
            if (key === "coins") {
                this.topBar.updateCoins(value);
            }
        });

        this.scene.launch("HomeScreen");
        this.scene.bringToTop("UIScene");
    }
}
