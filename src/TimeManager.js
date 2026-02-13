class TimeManager extends Phaser.Scene {
    constructor() {
        super({ key: "TimeManager", active: true });
    }

    create() {
        this.checkOfflineTime();
        this.startDayNightCycle();
        this.startTaskLoops();
        this.startProgressionLoop();
    }

    checkOfflineTime() {
        // Check last save time and apply offline progression
        const lastSave = localStorage.getItem("lastSaveTime");
        if (lastSave) {
            const now = Date.now();
            const offlineMs = now - parseInt(lastSave);
            const offlineMinutes = offlineMs / (1000 * 60);
            
            // Apply stat decay for offline time (capped at 24 hours)
            const cappedMinutes = Math.min(offlineMinutes, 24 * 60);
            if (cappedMinutes > 5) { // Only if offline for more than 5 minutes
                GameData.pets.forEach(pet => {
                    // Stats decrease over time
                    const decayRate = 0.5; // per minute
                    pet.hunger = Math.max(0, pet.hunger - (cappedMinutes * decayRate));
                    pet.water = Math.max(0, pet.water - (cappedMinutes * decayRate * 0.8));
                    pet.energy = Math.max(0, pet.energy - (cappedMinutes * decayRate * 0.6));
                    pet.happiness = Math.max(0, pet.happiness - (cappedMinutes * decayRate * 0.4));
                    if (pet.cleanliness !== undefined) {
                        pet.cleanliness = Math.max(0, pet.cleanliness - (cappedMinutes * decayRate * 0.3));
                    }
                });
                GameData.save();
            }
        }
        localStorage.setItem("lastSaveTime", Date.now().toString());
    }

    startDayNightCycle() {
        this.time.addEvent({
            delay: 2 * 60 * 1000, // 2 minutes
            loop: true,
            callback: () => {
                GameData.toggleDayNight();
                this.game.events.emit("daynight-changed", GameData.isNightTime());
            }
        });
    }

    startTaskLoops() {
        // Bathroom and Shower Loop (15 seconds)
        this.time.addEvent({
            delay: 15000,
            loop: true,
            callback: () => {
                const pet = GameData.getActivePet();
                if (!pet) return;

                const roll = Math.random();
                if (roll > 0.95) pet.needsBathroom = true; // 5% chance
                if (roll < 0.10) pet.isDirty = true;       // 10% chance

                GameData.save();
                this.game.events.emit("tasks-updated");
            }
        });

        // Sickness Loop (45 seconds)
        this.time.addEvent({
            delay: 45000,
            loop: true,
            callback: () => {
                const pet = GameData.getActivePet();
                if (!pet) return;

                // Chance increases as health decreases
                const sickRisk = (100 - (pet.health || 100)) / 1000; 
                if (Math.random() < sickRisk + 0.02) { // Base 2% + health risk
                    pet.isSick = true;
                    GameData.save();
                    this.game.events.emit("tasks-updated");
                }
            }
        });
    }

    startProgressionLoop() {
        // Aging and progression (every 30 seconds)
        this.time.addEvent({
            delay: 30000,
            loop: true,
            callback: () => {
                GameData.pets.forEach(pet => {
                    // Only progress if pet's needs are met
                    const needsMet = pet.hunger > 50 && pet.water > 50 && 
                                   pet.happiness > 40 && (pet.health || 100) > 50;
                    
                    if (needsMet) {
                        // Award XP for good care
                        GameData.addXP(pet, 1);
                        
                        // Track perfect care days
                        if (pet.hunger > 80 && pet.water > 80 && 
                            pet.happiness > 80 && (pet.health || 100) > 80) {
                            // Perfect care - track in stats
                            if (!GameData.stats.lastPerfectCareCheck) {
                                GameData.stats.lastPerfectCareCheck = new Date().toDateString();
                                GameData.stats.perfectCareDays = 0;
                            }
                            const today = new Date().toDateString();
                            if (GameData.stats.lastPerfectCareCheck !== today) {
                                GameData.stats.perfectCareDays++;
                                GameData.stats.lastPerfectCareCheck = today;
                                
                                // Achievement for perfect week
                                if (GameData.stats.perfectCareDays >= 7) {
                                    GameData.unlockAchievement("perfect_week");
                                }
                            }
                        }
                    } else {
                        // Aging pauses if needs aren't met
                        // (XP gain is already conditional above)
                    }
                });
                
                GameData.save();
            }
        });
    }
}