const GameData = {
    pets: [],
    activePetIndex: 0,
    coins: 100,
    gems: 10,
    isNight: false,
    maxPetSlots: 2,
    inventory: { pizza: 1, meat: 0, apple: 0, fish: 0, water: 0, toy: 0, cleaningSupply: 0, soap: 0, medicine: 0, toilet_paper: 0 },

    // FIX: Initialize stats and achievements so they aren't undefined
    stats: {
        totalCoinsSpent: 0,
        totalGemsSpent: 0,
        perfectCareDays: 0,
        lastPerfectCareCheck: null
    },
    achievements: [],
    purchaseHistory: [],
    settings: { useScrollingBar: false },

    load() {
        const saved = localStorage.getItem("petGameData");
        if (saved) {
            const parsed = JSON.parse(saved);
            this.pets = parsed.pets || [];
            this.activePetIndex = parsed.activePetIndex ?? 0;
            this.coins = parsed.coins ?? 100;
            this.gems = parsed.gems ?? 10;
            this.inventory = parsed.inventory || this.inventory;
            this.isNight = parsed.isNight ?? false;
            this.maxPetSlots = parsed.maxPetSlots ?? 2;

            // FIX: Restore stats and achievements from save
            this.stats = parsed.stats || this.stats;
            this.achievements = parsed.achievements || [];
            this.purchaseHistory = parsed.purchaseHistory || [];
            this.settings = parsed.settings || this.settings;
        } else {
            // No default pet - let StarterPetScreen handle pet creation
            this.pets = [];
            this.activePetIndex = 0;
            this.save();
        }
    },

    save() {
        // FIX: Save the current time so TimeManager.js can calculate offline decay
        localStorage.setItem("lastSaveTime", Date.now().toString());

        localStorage.setItem("petGameData", JSON.stringify({
            pets: this.pets,
            activePetIndex: this.activePetIndex,
            coins: this.coins,
            gems: this.gems,
            inventory: this.inventory,
            isNight: this.isNight,
            maxPetSlots: this.maxPetSlots,
            stats: this.stats,
            achievements: this.achievements,
            purchaseHistory: this.purchaseHistory,
            settings: this.settings
        }));
    },

    getActivePet() {
        return this.pets[this.activePetIndex] || this.pets[0];
    },

    // New helper to prevent "undefined" errors in screens
    unlockAchievement(id) {
        if (!this.achievements.includes(id)) {
            this.achievements.push(id);
            this.save();
            return true;
        }
        return false;
    },

    addPurchase(itemName, cost) {
        this.purchaseHistory.push({
            itemName: itemName,
            cost: cost,
            date: Date.now()
        });
        this.save();
    },

    purchasePetSlot() {
        const slotCost = 25;
        if (this.gems >= slotCost) {
            this.gems -= slotCost;
            this.maxPetSlots++;
            this.addPurchase("Pet Slot", slotCost);
            this.save();
            return true;
        }
        return false;
    },




    switchToPet(index) { if (index >= 0 && index < this.pets.length) { this.activePetIndex = index; this.save(); } },

    addPet(name, type) {
        if (this.pets.length >= this.maxPetSlots) return false;
        this.pets.push({ name, type, hunger: 100, energy: 100, happiness: 100, level: 1, xp: 0 });
        this.activePetIndex = this.pets.length - 1;
        this.save();
        return true;
    },

    removePet(index) {
        if (this.pets.length <= 1) return false;
        this.pets.splice(index, 1);
        if (this.activePetIndex >= this.pets.length) this.activePetIndex = this.pets.length - 1;
        this.save();
        return true;
    },

    addXP(pet, amount) {
        if (!pet) return;
        pet.xp = (pet.xp || 0) + amount;
        if (pet.xp >= 100) {
            pet.xp -= 100;
            pet.level = (pet.level || 1) + 1;
            // Optional: Trigger a level up sound or effect here
        }
        this.save();
    },

    reset() {
        this.pets = [];
        this.activePetIndex = 0;
        this.coins = 100;
        this.gems = 10;
        this.isNight = false;
        this.maxPetSlots = 2;
        this.inventory = { pizza: 1, meat: 0, apple: 0, fish: 0, water: 0, toy: 0, cleaningSupply: 0, soap: 0, medicine: 0, toilet_paper: 0 };
        this.stats = {
            totalCoinsSpent: 0,
            totalGemsSpent: 0,
            perfectCareDays: 0,
            lastPerfectCareCheck: null
        };
        this.achievements = [];
        this.purchaseHistory = [];
        this.settings = { useScrollingBar: false };

        localStorage.removeItem("petGameData");
        localStorage.removeItem("lastSaveTime");
        this.save();
    },

    toggleDayNight() { this.isNight = !this.isNight; this.save(); },
    setDay() { this.isNight = false; this.save(); },
    setNight() { this.isNight = true; this.save(); },
    isNightTime() { return this.isNight; }
};
