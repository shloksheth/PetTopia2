// GameData.js

const GameData = {
    pets: [],
    activePetIndex: 0,
    coins: 100,
    gems: 10,
    isNight: false, // 🌙 Track day/night state
    inventory: {
        pizza: 1,
        meat: 0,
        apple: 0,
        fish: 0
    },

    load() {
        const saved = localStorage.getItem("petGameData");
        if (saved) {
            const parsed = JSON.parse(saved);
            this.pets = parsed.pets || [];
            this.activePetIndex = parsed.activePetIndex ?? 0;
            this.coins = parsed.coins ?? 100;
            this.gems = parsed.gems ?? 10;
            this.inventory = parsed.inventory || {
                pizza: 0,
                meat: 0,
                apple: 0,
                fish: 0
            };
            this.isNight = parsed.isNight ?? false;
        } else {
            // First-time setup
            this.pets = [{
                name: "Bella",
                type: "dog",
                hunger: 100,
                energy: 100,
                happiness: 100
            }];
            this.activePetIndex = 0;
            this.coins = 100;
            this.gems = 10;
            this.isNight = false;
            this.inventory = {
                pizza: 0,
                meat: 0,
                apple: 0,
                fish: 0
            };
            this.save();
        }
    },

    save() {
        if (!this.pets || !Array.isArray(this.pets)) {
            console.warn("GameData.save() aborted: pets data is missing or invalid.");
            return;
        }

        localStorage.setItem("petGameData", JSON.stringify({
            pets: this.pets,
            activePetIndex: this.activePetIndex,
            coins: this.coins,
            gems: this.gems,
            inventory: this.inventory,
            isNight: this.isNight
        }));
    },


    getActivePet() {
        return this.pets[this.activePetIndex];
    },

    switchToPet(index) {
        if (index >= 0 && index < this.pets.length) {
            // Save current pet's state before switching
            this.save();
            this.activePetIndex = index;
            this.save(); // Save again after switching
        }
    },

    addPet(name, type) {
        if (this.pets.length >= 2) return false;
        if (this.pets.some(p => p.name.toLowerCase() === name.toLowerCase())) return false;

        this.pets.push({
            name,
            type,
            hunger: 100,
            energy: 100,
            happiness: 100
        });
        this.activePetIndex = this.pets.length - 1;
        this.save();
        return true;
    },

    removePet(index) {
        if (index < 0 || index >= this.pets.length) return false;
        this.pets.splice(index, 1);
        if (this.activePetIndex >= this.pets.length) {
            this.activePetIndex = this.pets.length - 1;
        }
        this.save();
        return true;
    },

    reset() {
        localStorage.removeItem("petGameData");
        this.load();
    },

    // 🌞 Day/Night control
    toggleDayNight() {
        this.isNight = !this.isNight;
        this.save();
    },

    setDay() {
        this.isNight = false;
        this.save();
    },

    setNight() {
        this.isNight = true;
        this.save();
    },

    isNightTime() {
        return this.isNight;
    },

    // ⚡ Energy management
    addEnergy(amount) {
        const pet = this.getActivePet();
        pet.energy = Math.min(100, pet.energy + amount);
        this.save();
    }
};

// Make GameData globally accessible
window.GameData = GameData;
