// Chapter II: The Golden Fish (Matsya Vedha Trials)
(function (global) {
    "use strict";

    const chapterData = {
        id: 1,
        name: "The Golden Fish",
        place: "Draupadi’s swayamvara",
        icon: "✧",
        color: "#ffbddc",
        tint: "#a84587",
        numeral: "II",
        desc: "King Drupada's royal challenge: look down into the shimmering oil pool and pierce the revolving golden fish hidden overhead.",
        levels: [
            {
                name: "The Mirror of Oil",
                mode: "fish",
                goal: 1,
                arrows: 6,
                wind: 0.5,
                desc: "The revolving fish is concealed behind the overhead canopy! Read its circular reflection in the oil cauldron and loose upward."
            },
            {
                name: "The Revolving Fish",
                mode: "fish",
                moving: true,
                goal: 2,
                arrows: 7,
                wind: 2.0,
                desc: "The overhead wheel revolves faster. Compensate for expanding oil waves and lead your upward trajectory."
            },
            {
                name: "Whirlpool & Crosswind",
                mode: "fish",
                moving: true,
                goal: 2,
                arrows: 7,
                wind: 3.8,
                desc: "Strong hall winds sweep the courtyard as oil surface caustics distort. Time the upward shot with perfect release."
            },
            {
                name: "Swayamvara Victor",
                mode: "fish",
                moving: true,
                small: true,
                goal: 3,
                arrows: 8,
                wind: 4.5,
                desc: "The ultimate trial of Draupadi's hand! Strike the tiny eye of the hidden overhead fish to claim eternal renown."
            }
        ]
    };

    if (!global.GameRegistry) global.GameRegistry = {};
    if (!global.GameRegistry.chapters) global.GameRegistry.chapters = [];
    global.GameRegistry.chapters[1] = chapterData;
})(window);
