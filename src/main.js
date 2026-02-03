const config = {
    type: Phaser.AUTO,
    width: 720,
    height: 1280,
    backgroundColor: "#222222",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 720,
        height: 1280
    },

    scene: [HomeScreen, ShopScreen]
};

const game = new Phaser.Game(config);
