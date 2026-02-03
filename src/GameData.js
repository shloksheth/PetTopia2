class GameData {
    static defaultData() {
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

    static load() {
        const raw = localStorage.getItem("pettopia_save");
        if (raw) {
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.warn("Corrupted save data. Resetting...");
                return this.defaultData();
            }
        }
        return this.defaultData();
    }

    static save(data) {
        localStorage.setItem("pettopia_save", JSON.stringify(data));
    }

    static reset() {
        const defaults = this.defaultData();
        this.save(defaults);
        return defaults;
    }
}

window.GameData = GameData;
