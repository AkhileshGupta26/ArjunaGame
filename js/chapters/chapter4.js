// Chapter IV: Defense of Virata (Chariot & Fortress Warfare)
(function (global) {
    "use strict";

    const chapterData = {
        id: 3,
        name: "Defense of Virata",
        place: "Chariot ramparts",
        icon: "❖",
        color: "#c7c3ff",
        tint: "#6655b3",
        numeral: "IV",
        desc: "Brihannala takes up the Gandiva from the Shami tree to defend King Virata's kingdom against the invading Kaurava army.",
        levels: [
            {
                name: "Advancing Vanguard",
                mode: "archery",
                moving: true,
                goal: 5,
                arrows: 10,
                wind: 2.5,
                desc: "Repel moving armored dummy targets advancing at differing depths across the front lines."
            },
            {
                name: "The Royal Standard at 90m",
                mode: "archery",
                small: true,
                longRange: true,
                goal: 3,
                arrows: 7,
                wind: 4.2,
                desc: "Knock down the tiny royal flag emblem across maximum courtyard distance in heavy crosswinds."
            },
            {
                name: "Chariot Gallop",
                mode: "archery",
                chariot: true,
                moving: true,
                goal: 4,
                arrows: 8,
                wind: 3.0,
                desc: "Aim and shoot while your chariot platform rumbles and glides across the terrain."
            },
            {
                name: "Fortress Ramparts",
                mode: "archery",
                guarded: true,
                goal: 4,
                arrows: 9,
                wind: 3.5,
                desc: "High rampart targets behind battlements requiring high curving loft shots."
            }
        ]
    };

    if (!global.GameRegistry) global.GameRegistry = {};
    if (!global.GameRegistry.chapters) global.GameRegistry.chapters = [];
    global.GameRegistry.chapters[3] = chapterData;
})(window);
