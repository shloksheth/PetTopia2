window.onload = function () {
    // Ensure GameData is loaded and has a default pet
    GameData.load();

    const config = {
        type: Phaser.AUTO,
        width: 720,
        height: 1280,
        backgroundColor: "#000000",
        parent: "game-container",
        scene: [
            TimeManager, 
            UIScene, 
            HomeScreen, 
            ShopScreen, 
            VetScreen, 
            SleepScreen,
            PlayScreen,
            BathingScreen,
            StatsScreen,
            CustomizationScreen,
            PetPurchaseScreen
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
