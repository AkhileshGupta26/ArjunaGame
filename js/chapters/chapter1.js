// Chapter I: Forest of Drona (Acharya's Trials)
(function (global) {
    "use strict";

    const chapterData = {
        id: 0,
        name: "Forest of Drona",
        place: "Acharya's hermitage",
        icon: "➶",
        color: "#9affd0",
        tint: "#19866d",
        numeral: "I",
        desc: "Master archery fundamentals, breath control, and wind compensation under Acharya Drona.",
        levels: [
            {
                name: "The Wooden Bird's Eye",
                mode: "archery",
                goal: 3,
                arrows: 8,
                wind: 0,
                desc: "'I see neither tree nor bird, only the pupil of its eye.' Strike the bullseye with calm precision."
            },
            {
                name: "Swaying Pendulum",
                mode: "archery",
                moving: true,
                goal: 4,
                arrows: 9,
                wind: 1.8,
                desc: "Lead the swinging pendulum target through a crosswind breeze across the forest clearing."
            },
            {
                name: "The Distant Shami Tree",
                mode: "archery",
                goal: 3,
                arrows: 7,
                wind: 3.2,
                longRange: true,
                desc: "A 75-meter distant target requiring a higher arc and lateral wind drift compensation."
            },
            {
                name: "Triple Rapid Volley",
                mode: "archery",
                rapid: true,
                goal: 5,
                arrows: 9,
                wind: 2.1,
                desc: "Hit moving targets across varying depths before your spent arrows run out."
            }
        ]
    };

    if (!global.GameRegistry) global.GameRegistry = {};
    if (!global.GameRegistry.chapters) global.GameRegistry.chapters = [];
    global.GameRegistry.chapters[0] = chapterData;
})(window);
