class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: "UIScene", active: true }); 
    }

    preload() {
        // Shared UI Assets
        this.load.image("coin_icon", "assets/icons/gold coin.png");
        this.load.image("gem_icon", "assets/icons/gems.png");
        this.load.image("button", "assets/icons/button.png"); 
        this.load.image("orange_box", "assets/icons/orangebox.png");
        this.load.image("topbar_bg", "assets/icons/topbar_gradient.png");
    }

    create() {
        // Ensure GameData is fresh and loaded
        GameData.load();

        // FIX: Use GameData top-level properties. 
        // This prevents the "reset to 1" or "0" bug when switching pets.
        this.topBar = new TopBar(this, {
            coins: GameData.coins,
            gems: GameData.gems
        });

        // Sync initial coins to the registry so other scenes start with the right value
        this.registry.set("coins", GameData.coins);
        this.registry.set("gems", GameData.gems);

        /**
         * Custom Event Listener
         * Used by: SleepScreen, Debug Menu
         */
        this.registry.events.on("update-stats", (newData) => {
            if (newData) {
                this.topBar.updateCounters(newData);
            }
        });

        /**
         * Data Manager Listener
         * Used by: ShopScreen via this.registry.set("coins", value)
         */
        this.registry.events.on("changedata", (parent, key, value) => {
            if (key === "coins") {
                this.topBar.updateCoins(value);
            }
            if (key === "gems") {
                // If you add a gem update method to TopBar
                if (this.topBar.updateGems) {
                    this.topBar.updateGems(value);
                }
            }
        });

        // Launch the initial game screen
        this.scene.launch("HomeScreen");
        
        // Keep the UI on top of everything
        this.scene.bringToTop("UIScene");
    }
}

window.UIScene = UIScene;