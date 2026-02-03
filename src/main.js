const config = {
    type: Phaser.AUTO,
    width: 720,
    height: 1280,
    backgroundColor: "#222222",
    scene: [HomeScreen, ShopScreen]
};

const game = new Phaser.Game(config);
