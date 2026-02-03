class GameData {
    static load() {
        const raw = localStorage.getItem("pettopia_save");
        if (!raw) {
            return {
                name: "Pet",
                coins: 100,
                gems: 5,
                hunger: 100,
                energy: 100,
                inventory: {
                    pizza: 0,
                    meat: 0,
                    apple: 0
                }
            };
        }
        return JSON.parse(raw);
    }

    static save(data) {
        localStorage.setItem("pettopia_save", JSON.stringify(data));
    }
}

window.GameData = GameData;
