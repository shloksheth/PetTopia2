class TimeManager extends Phaser.Scene {
    constructor() {
        super({ key: "TimeManager", active: true });
    }

    create() {
        this.startDayNightCycle();
        this.startTaskLoops();
    }

    startDayNightCycle() {
        this.time.addEvent({
            delay: 2 * 60 * 1000,
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
            delay: 15,
            loop: true,
            callback: () => {
                const pet = GameData.getActivePet();
                if (!pet) return;

                const roll = Math.random();
                if (roll < 0.15) pet.needsBathroom = true; // 15% chance
                if (roll > 0.85) pet.isDirty = true;       // 15% chance

                GameData.save();
                this.game.events.emit("tasks-updated");
            }
        });

        // Sickness Loop (45 seconds)
        this.time.addEvent({
            delay: 45,
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
}