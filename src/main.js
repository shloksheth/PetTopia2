window.onload = function () {
    // Ensure GameData is loaded and has a default pet
    GameData.load();
    // Set initial bottom bar color to orange for HomeScreen
    window.localStorage.setItem('bottomBarColor', '0xffa500');

    const config = {
        type: Phaser.AUTO,
        width: 720,
        height: 1280,
        backgroundColor: "#000000",
        parent: "game-container",
        // In main.js config
        scene: [
            UIScene,      // UI should be early
            TimeManager,
            HomeScreen,
            ShopScreen,
            WardrobeScreen,
            VetScreen,
            SleepScreen,
            BathingScreen,
            StatsScreen,
            PlayScreen,
            CustomizationScreen,
            PetPurchaseScreen,
            StarterPetScreen
        ],
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        dom: {
            createContainer: true
        },
    };

    const game = new Phaser.Game(config);

    // Always start with HomeScreen (default pet is created in GameData.load())
    game.scene.start("HomeScreen");
};
