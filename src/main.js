const GAME_WIDTH = 720;
const GAME_HEIGHT = 1280;

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#000000",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },

    scene: [HomeScreen, ShopScreen]
};

const game = new Phaser.Game(config);
