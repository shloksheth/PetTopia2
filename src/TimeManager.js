class TimeManager extends Phaser.Scene {
    constructor() {
        super({ key: "TimeManager", active: true });
    }

    create() {
        this.startDayNightCycle();
    }

    startDayNightCycle() {
        // Set initial state if needed
        if (GameData.isNight === undefined) {
            GameData.setDay();
        }

        this.time.addEvent({
            delay: 2 * 60 * 1000 ,
            loop: true,
            callback: () => {
                GameData.toggleDayNight();
                const isNight = GameData.isNightTime();
                this.game.events.emit("daynight-changed", isNight);
            }
        });

    }
}

window.TimeManager = TimeManager;
