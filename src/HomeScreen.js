class HomeScreen extends Phaser.Scene {
    constructor() {
        super("HomeScreen");
    }

    create() {
        this.add.text(100, 100, "Phaser is working", {
            fontSize: "48px",
            color: "#ffffff"
        });
    }
}
