// Global Game Configuration & State Management
(function (global) {
    "use strict";

    const SAVE_KEY = "arjuna-epic-archery-v4";

    const GameConfig = {
        saveKey: SAVE_KEY,
        defaultCoins: 250,
        groundRatio: 0.82,
        portraitGroundRatio: 0.76,

        clamp: function (n, min, max) {
            return Math.max(min, Math.min(max, n));
        },

        scale: function (w, h) {
            return GameConfig.clamp(Math.min(w / 850, h / 430), 0.55, 1.6);
        },

        ground: function (w, h) {
            return h * (h > w ? GameConfig.portraitGroundRatio : GameConfig.groundRatio);
        },

        origin: function (w, h) {
            const sc = GameConfig.scale(w, h);
            return {
                x: w * (h > w ? 0.16 : 0.18),
                y: GameConfig.ground(w, h) - 62 * sc
            };
        },

        loadProgress: function () {
            let progress = {
                coins: GameConfig.defaultCoins,
                completed: [],
                stars: {},
                weapons: ["gandiva"],
                equippedWeapon: "gandiva",
                characters: ["arjuna"],
                selectedCharacter: "arjuna"
            };

            try {
                const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
                if (saved) {
                    if (typeof saved.coins === "number") progress.coins = saved.coins;
                    if (Array.isArray(saved.completed)) progress.completed = saved.completed;
                    if (saved.stars && typeof saved.stars === "object") progress.stars = saved.stars;
                    if (Array.isArray(saved.weapons)) progress.weapons = saved.weapons;
                    if (typeof saved.equippedWeapon === "string") progress.equippedWeapon = saved.equippedWeapon;
                    if (Array.isArray(saved.characters)) progress.characters = saved.characters;
                    if (typeof saved.selectedCharacter === "string") progress.selectedCharacter = saved.selectedCharacter;
                }
            } catch (e) {
                // Fallback to defaults
            }
            return progress;
        },

        saveProgress: function (progress) {
            try {
                localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
            } catch (e) {}
        }
    };

    global.GameConfig = GameConfig;
})(window);
