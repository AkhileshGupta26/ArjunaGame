// Chapter V: Clash of Shastras (Electric Wand & Magic Duels)
(function (global) {
    "use strict";

    const chapterData = {
        id: 4,
        name: "Clash of Shastras",
        place: "Electric wand arenas",
        icon: "⚡",
        color: "#7fefff",
        tint: "#156b82",
        numeral: "V",
        desc: "Face sorcerers and warriors wielding crackling Electric Wands & Astras. Intercept incoming bolts in mid-air and pierce their elemental shields.",
        levels: [
            {
                name: "Pragjyotisha Sorcerer",
                mode: "wand_duel",
                boss: 0,
                desc: "Enemy sorcerer wields a crackling Electric Wand! Intercept his lightning bolts in mid-air with arrows and strike!"
            },
            {
                name: "Thunder & Flame Duel",
                mode: "wand_duel",
                boss: 1,
                desc: "Enemy casts twin Electric & Fire wand projectiles! Parry incoming bolts and break his revolving energy barrier."
            },
            {
                name: "Asura Storm-Lord",
                mode: "wand_duel",
                boss: 2,
                desc: "A teleporting mage who fires homing lightning spheres and electric shockwaves across the arena."
            },
            {
                name: "Electric Wand Grandmaster",
                mode: "wand_duel",
                boss: 3,
                desc: "Intense high-voltage lightning duel! Counter electric wards and unleash your equipped wands."
            }
        ]
    };

    if (!global.GameRegistry) global.GameRegistry = {};
    if (!global.GameRegistry.chapters) global.GameRegistry.chapters = [];
    global.GameRegistry.chapters[4] = chapterData;
})(window);
