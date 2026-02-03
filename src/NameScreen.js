class NameScreen extends Phaser.Scene {
    constructor() {
        super("NameScreen");
    }

    create() {
        this.add.text(150, 300, "Name Your Pet", {
            fontSize: "60px",
            color: "#ffffff"
        });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Enter name...";
        input.style.position = "absolute";
        input.style.top = "400px";
        input.style.left = "50%";
        input.style.transform = "translateX(-50%)";
        input.style.fontSize = "32px";
        input.style.padding = "10px";
        document.body.appendChild(input);

        const confirmBtn = this.add.text(250, 550, "Confirm", {
            fontSize: "48px",
            color: "#00ff00"
        }).setInteractive();

        confirmBtn.on("pointerdown", () => {
            const name = input.value.trim();
            if (name.length === 0) return;

            const data = GameData.load();
            data.name = name;
            GameData.save(data);

            input.remove();
            this.scene.start("HomeScreen");
        });
    }
}
