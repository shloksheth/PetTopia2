window.onload = function () {
    const config = {
        type: Phaser.AUTO,
        width: 720,
        height: 1280,
        backgroundColor: "#000000",
        parent: "game-container",
        scene: [UIScene, HomeScreen, ShopScreen],
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        dom: {
            createContainer: true
        },
    };

    const game = new Phaser.Game(config);
};

