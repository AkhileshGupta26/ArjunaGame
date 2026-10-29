// Chapter VI: Kurukshetra Legends (Grand Epic Duels)
(function (global) {
    "use strict";

    const chapterData = {
        id: 5,
        name: "Kurukshetra Legends",
        place: "Epic battlegrounds",
        icon: "ϟ",
        color: "#ff9c9c",
        tint: "#b04848",
        numeral: "VI",
        desc: "Face the immortal masters and legends of the Great War in titanic duels of celestial bows, chakras, and divine astras.",
        levels: [
            {
                name: "Grandfather Bhishma",
                mode: "wand_duel",
                boss: 4,
                desc: "Face the invincible patriarch! Dodge celestial volleys and pierce his rotating divine wards."
            },
            {
                name: "Acharya Drona",
                mode: "wand_duel",
                boss: 5,
                desc: "Brahma-energy volleys and precision counter-shots from the supreme master of warfare."
            },
            {
                name: "Jayadratha at Sunset",
                mode: "wand_duel",
                boss: 6,
                desc: "Race against the descending sun timer! Break all 4 guardian wards before darkness falls."
            },
            {
                name: "Karna & The Divine Vijaya",
                mode: "wand_duel",
                boss: 7,
                desc: "The ultimate clash! Clashing lightning beams, solar rays, and explosive divine astras."
            }
        ]
    };

    if (!global.GameRegistry) global.GameRegistry = {};
    if (!global.GameRegistry.chapters) global.GameRegistry.chapters = [];
    global.GameRegistry.chapters[5] = chapterData;
})(window);
