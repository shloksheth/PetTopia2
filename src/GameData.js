const GameData = {
    pets: [],
    activePetIndex: 0,
    coins: 100,
    gems: 10,
    isNight: false,
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
            this.inventory = parsed.inventory || { pizza: 0, meat: 0, apple: 0, fish: 0 };
            this.isNight = parsed.isNight ?? false;
        } else {
            this.pets = [{
                name: "Bella",
                type: "dog",
                hunger: 100,
                energy: 100,
                happiness: 100,
                health: 100,
                isDirty: false,
                needsBathroom: false,
                isSick: false
            }];
            this.activePetIndex = 0;
            this.coins = 100;
            this.gems = 10;
            this.save();
        }
    },

    save() {
        const dataToSave = {
            pets: this.pets,
            activePetIndex: this.activePetIndex,
            coins: this.coins,
            gems: this.gems,
            inventory: this.inventory,
            isNight: this.isNight
        };
        localStorage.setItem("petGameData", JSON.stringify(dataToSave));
    },

    getActivePet() {
        return this.pets[this.activePetIndex];
    },

    addEnergy(amount) {
        const pet = this.getActivePet();
        if (pet) {
            pet.energy = Math.min(100, pet.energy + amount);
            this.save();
        }
    },

    toggleDayNight() {
        this.isNight = !this.isNight;
        this.save();
    },

    setDay() { this.isNight = false; this.save(); },
    isNightTime() { return this.isNight; }
};