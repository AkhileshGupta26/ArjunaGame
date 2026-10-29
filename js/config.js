// Global Game Configuration & State Management (4-Weapon Deck & Magical Cooldowns)
(function (global) {
    "use strict";

    const SAVE_KEY = "arjuna-epic-archery-v4";

    const ALL_WEAPONS = ["gandiva", "vajra", "agni", "chakra", "nagastra", "vayu", "varuna", "surya", "brahmashira"];
    const ALL_CHARACTERS = ["arjuna", "karna", "ekalavya", "abhimanyu"];
    const DEFAULT_MAGIC_LOADOUT = ["agni", "vajra", "brahmashira"]; // 3 magical wands alongside Gandiva

    const GameConfig = {
        saveKey: SAVE_KEY,
        defaultCoins: 50000,
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
                weapons: [...ALL_WEAPONS],
                equippedWeapon: "gandiva",
                activeLoadout: [...DEFAULT_MAGIC_LOADOUT], // Max 3 magical wands + Gandiva
                characters: [...ALL_CHARACTERS],
                selectedCharacter: "arjuna"
            };

            try {
                const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
                if (saved) {
                    if (typeof saved.coins === "number") progress.coins = Math.max(saved.coins, 25000);
                    if (Array.isArray(saved.completed)) progress.completed = saved.completed;
                    if (saved.stars && typeof saved.stars === "object") progress.stars = saved.stars;
                    if (Array.isArray(saved.weapons)) progress.weapons = saved.weapons;
                    if (typeof saved.equippedWeapon === "string") progress.equippedWeapon = saved.equippedWeapon;
                    if (Array.isArray(saved.activeLoadout)) {
                        progress.activeLoadout = saved.activeLoadout.filter(w => w !== "gandiva").slice(0, 3);
                    }
                    if (Array.isArray(saved.characters)) progress.characters = saved.characters;
                    if (typeof saved.selectedCharacter === "string") progress.selectedCharacter = saved.selectedCharacter;
                }
            } catch (e) {
                // Fallback to defaults
            }

            // Guarantee all weapons and heroes unlocked for testing
            ALL_WEAPONS.forEach(w => {
                if (!progress.weapons.includes(w)) progress.weapons.push(w);
            });
            ALL_CHARACTERS.forEach(c => {
                if (!progress.characters.includes(c)) progress.characters.push(c);
            });

            // Ensure activeLoadout has 3 magical wands
            if (!progress.activeLoadout || progress.activeLoadout.length === 0) {
                progress.activeLoadout = [...DEFAULT_MAGIC_LOADOUT];
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
