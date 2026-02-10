const GameData = {
    pets: [],
    activePetIndex: 0,
    coins: 100,
    gems: 10,
    isNight: false,
    maxPetSlots: 2, // Start with 2, can purchase up to 5
    inventory: {
        pizza: 1,
        meat: 0,
        apple: 0,
        fish: 0,
        water: 0,
        toy: 0,
        cleaningSupply: 0
    },
    // Pet unlocking system
    unlockedPets: ["dog", "cat"], // Starter pets
    purchasablePets: [
        { id: "dragon", name: "Dragon", cost: 50, unlockLevel: 5 },
        { id: "hamster", name: "Hamster", cost: 30, unlockLevel: 3 },
        { id: "rare_dog", name: "Rare Dog", cost: 40, unlockLevel: 4 }
    ],
    // Daily login streak
    lastLoginDate: null,
    loginStreak: 0,
    // Achievements
    achievements: [],
    // Statistics
    stats: {
        totalCoinsEarned: 0,
        totalCoinsSpent: 0,
        totalGemsEarned: 0,
        totalGemsSpent: 0,
        petsRaised: 0,
        perfectCareDays: 0,
        totalPlayTime: 0
    },
    // Customization
    customization: {
        backgrounds: ["default"],
        unlockedBackgrounds: ["default"]
    },

    load() {
        const saved = localStorage.getItem("petGameData");
        if (saved) {
            const parsed = JSON.parse(saved);
            this.pets = parsed.pets || [];
            this.activePetIndex = parsed.activePetIndex ?? 0;
            this.coins = parsed.coins ?? 100;
            this.gems = parsed.gems ?? 10;
            this.inventory = parsed.inventory || { pizza: 1, meat: 0, apple: 0, fish: 0, water: 0, toy: 0, cleaningSupply: 0 };
            this.isNight = parsed.isNight ?? false;
            this.maxPetSlots = parsed.maxPetSlots ?? 2;
            this.unlockedPets = parsed.unlockedPets || ["dog", "cat"];
            this.purchasablePets = parsed.purchasablePets || this.purchasablePets;
            this.lastLoginDate = parsed.lastLoginDate || null;
            this.loginStreak = parsed.loginStreak ?? 0;
            this.achievements = parsed.achievements || [];
            this.stats = parsed.stats || this.stats;
            this.customization = parsed.customization || this.customization;
            
            // Check daily login
            this.checkDailyLogin();
        } else {
            // First time setup - create default pet "Bella"
            this.pets = [];
            this.activePetIndex = 0;
            this.coins = 100;
            this.gems = 10;
            this.maxPetSlots = 2;
            this.unlockedPets = ["dog", "cat"];
            this.lastLoginDate = new Date().toDateString();
            this.loginStreak = 1;
        }
        
        // Always ensure at least one pet exists (default: Bella the dog)
        if (this.pets.length === 0) {
            this.addPet("Bella", "dog");
            this.activePetIndex = 0;
        }
        
        // Ensure activePetIndex is valid
        if (this.activePetIndex >= this.pets.length) {
            this.activePetIndex = 0;
        }
        
        this.save();
    },

    checkDailyLogin() {
        const today = new Date().toDateString();
        if (this.lastLoginDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (this.lastLoginDate === yesterdayStr) {
                // Consecutive day
                this.loginStreak++;
            } else {
                // Streak broken
                this.loginStreak = 1;
            }
            
            this.lastLoginDate = today;
            // Award gem for daily login
            this.gems += 1;
            this.stats.totalGemsEarned += 1;
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
            isNight: this.isNight,
            maxPetSlots: this.maxPetSlots,
            unlockedPets: this.unlockedPets,
            purchasablePets: this.purchasablePets,
            lastLoginDate: this.lastLoginDate,
            loginStreak: this.loginStreak,
            achievements: this.achievements,
            stats: this.stats,
            customization: this.customization
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

    addXP(pet, amount) {
        if (!pet.xp) pet.xp = 0;
        if (!pet.level) pet.level = 1;
        if (!pet.growthStage) pet.growthStage = "baby";
        
        pet.xp += amount;
        
        // Level up system
        const xpNeeded = pet.level * 50; // 50 XP per level
        if (pet.xp >= xpNeeded) {
            pet.xp -= xpNeeded;
            pet.level++;
            
            // Growth stages: Baby (1-2), Child (3-5), Adult (6-9), Evolved (10+)
            if (pet.level >= 10 && pet.growthStage !== "evolved") {
                pet.growthStage = "evolved";
                this.unlockAchievement("first_evolution");
            } else if (pet.level >= 6 && pet.growthStage === "child") {
                pet.growthStage = "adult";
                this.unlockAchievement("first_adult");
            } else if (pet.level >= 3 && pet.growthStage === "baby") {
                pet.growthStage = "child";
            }
            
            // Award gem for leveling up
            this.gems += 1;
            this.stats.totalGemsEarned += 1;
        }
        this.save();
    },

    unlockAchievement(id) {
        const achievementMap = {
            "first_pet": "First Pet Raised 🐾",
            "first_adult": "First Adult Form 🐕",
            "first_evolution": "First Evolution 🐉",
            "perfect_week": "Perfect Care Week 🌟"
        };
        
        if (!this.achievements.includes(id)) {
            this.achievements.push(id);
            this.save();
            return achievementMap[id] || id;
        }
        return null;
    },

    addPet(name, type) {
        if (this.pets.length >= this.maxPetSlots) {
            return false;
        }
        
        const newPet = {
            name: name,
            type: type,
            hunger: 100,
            water: 100,
            energy: 100,
            happiness: 100,
            health: 100,
            cleanliness: 100,
            xp: 0,
            level: 1,
            growthStage: "baby",
            isDirty: false,
            needsBathroom: false,
            isSick: false,
            customization: {
                hat: null,
                collar: null,
                skin: "default"
            }
        };
        
        this.pets.push(newPet);
        this.stats.petsRaised++;
        this.unlockAchievement("first_pet");
        this.save();
        return true;
    },

    removePet(index) {
        if (this.pets.length <= 1) return false;
        this.pets.splice(index, 1);
        if (this.activePetIndex >= this.pets.length) {
            this.activePetIndex = this.pets.length - 1;
        }
        this.save();
        return true;
    },

    switchToPet(index) {
        if (index >= 0 && index < this.pets.length) {
            this.activePetIndex = index;
            this.save();
        }
    },

    purchasePetSlot() {
        if (this.maxPetSlots >= 5) return false;
        if (this.gems < 25) return false;
        
        this.gems -= 25;
        this.maxPetSlots++;
        this.stats.totalGemsSpent += 25;
        this.save();
        return true;
    },

    purchasePet(petId) {
        const petInfo = this.purchasablePets.find(p => p.id === petId);
        if (!petInfo) return false;
        
        // Check if unlocked (level requirement)
        const activePet = this.getActivePet();
        if (!activePet || activePet.level < petInfo.unlockLevel) {
            return { success: false, reason: "level" };
        }
        
        // Check if already unlocked
        if (this.unlockedPets.includes(petId)) {
            return { success: false, reason: "already_unlocked" };
        }
        
        // Check gems
        if (this.gems < petInfo.cost) {
            return { success: false, reason: "insufficient_gems" };
        }
        
        this.gems -= petInfo.cost;
        this.unlockedPets.push(petId);
        this.stats.totalGemsSpent += petInfo.cost;
        this.save();
        return { success: true };
    },

    toggleDayNight() {
        this.isNight = !this.isNight;
        this.save();
    },

    setDay() { this.isNight = false; this.save(); },
    isNightTime() { return this.isNight; },

    reset() {
        localStorage.removeItem("petGameData");
        location.reload();
    }
};