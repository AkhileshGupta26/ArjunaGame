// Level Registry & Aggregator (Loose Coupling)
(function (global) {
    "use strict";

    const bosses = [
        { name: "Pragjyotisha Sorcerer", hp: 130, ward: "electric", weapon: "electric_wand", desc: "Wields a crackling lightning wand." },
        { name: "Asura Flame-Weaver", hp: 155, ward: "fire", weapon: "flame_wand", desc: "Casts fiery meteors and fire shields." },
        { name: "Asura Storm-Lord", hp: 180, ward: "electric", weapon: "storm_wand", desc: "Homing electric orbs & teleportation." },
        { name: "Vajra Grandmaster", hp: 210, ward: "electric", weapon: "electric_wand", desc: "Master of electric wand barrages." },
        { name: "Grandfather Bhishma", hp: 235, ward: "water", weapon: "celestial_bow", desc: "Celestial arrows and impenetrable shield." },
        { name: "Acharya Drona", hp: 260, ward: "fire", weapon: "brahma_staff", desc: "Brahma energy spears and quick counters." },
        { name: "Jayadratha", hp: 220, ward: "wind", weapon: "dark_wand", desc: "Must be defeated before sunset timer expires." },
        { name: "Karna (Vijaya Bow)", hp: 320, ward: "fire", weapon: "vijaya_bow", desc: "Ultimate duel with supreme astras." }
    ];

    const GameLevels = {
        getBosses: function () {
            return bosses;
        },

        getBoss: function (idx) {
            return bosses[idx] || bosses[0];
        },

        getChapters: function () {
            return (global.GameRegistry && global.GameRegistry.chapters) || [];
        },

        getChapter: function (idx) {
            const chs = GameLevels.getChapters();
            return chs[idx] || chs[0];
        },

        getAllLevels: function () {
            const all = [];
            const chs = GameLevels.getChapters();
            chs.forEach(function (ch, chIdx) {
                if (ch && ch.levels) {
                    ch.levels.forEach(function (lvl, lIdx) {
                        all.push(Object.assign({
                            chapter: chIdx,
                            chapterLevelIndex: lIdx,
                            globalIndex: all.length,
                            wind: lvl.wind || 0,
                            goal: lvl.goal || 3,
                            arrows: lvl.arrows || 8
                        }, lvl));
                    });
                }
            });
            return all;
        },

        getLevel: function (idx) {
            const lvls = GameLevels.getAllLevels();
            return lvls[idx] || lvls[0];
        }
    };

    global.GameLevels = GameLevels;
})(window);
