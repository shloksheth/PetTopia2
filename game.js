const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#cceeff',
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let hunger = 100;
let happiness = 100;
let coins = 50;

let pet;
let hungerText;
let happyText;
let coinText;

function preload() {
    this.load.image('dog', 'assets/pets/dog.png');
    this.load.image('food', 'assets/food.png');
}

function create() {
    pet = this.add.image(400, 300, 'dog');

    hungerText = this.add.text(20, 20, 'Hunger: ' + Math.floor(hunger), { fontSize: '24px', fill: '#000' });
    happyText = this.add.text(20, 50, 'Happiness: ' + Math.floor(happiness), { fontSize: '24px', fill: '#000' });
    coinText = this.add.text(20, 80, 'Coins: ' + coins, { fontSize: '24px', fill: '#000' });

    const feedBtn = this.add.text(600, 500, 'Feed 🍖', { fontSize: '24px', backgroundColor: '#88ff88', padding: 10 })
        .setInteractive();
    feedBtn.on('pointerdown', () => {
        if (coins >= 5) {
            hunger = Math.min(100, hunger + 20);
            coins -= 5;
        }
    });

    const playBtn = this.add.text(600, 450, 'Play 🎾', { fontSize: '24px', backgroundColor: '#88ccff', padding: 10 })
        .setInteractive();
    playBtn.on('pointerdown', () => {
        if (coins >= 5) {
            happiness = Math.min(100, happiness + 20);
            coins -= 5;
        }
    });
}

function update() {
    hunger -= 0.01;
    happiness -= 0.01;

    hunger = Phaser.Math.Clamp(hunger, 0, 100);
    happiness = Phaser.Math.Clamp(happiness, 0, 100);

    hungerText.setText('Hunger: ' + Math.floor(hunger));
    happyText.setText('Happiness: ' + Math.floor(happiness));
    coinText.setText('Coins: ' + coins);
}
