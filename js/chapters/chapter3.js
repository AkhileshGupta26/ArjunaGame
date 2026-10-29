// Chapter III: The Kirata's Forest (Dynamic Hunting & Arc Trials)
(function (global) {
    "use strict";

    const chapterData = {
        id: 2,
        name: "The Kirata's Forest",
        place: "Sacred hunting trails",
        icon: "✺",
        color: "#ffe092",
        tint: "#aa7438",
        numeral: "III",
        desc: "Pursue sprinting wild beasts and skyborne celestial embers through the wild mountain forests of Lord Shiva.",
        levels: [
            {
                name: "The Running Boar",
                mode: "hunt",
                goal: 4,
                arrows: 8,
                wind: 1.5,
                beastSpeed: 1.2,
                desc: "A wild boar sprints across the forest floor. Lead your arrow ahead of its sprinting path to score a direct hit."
            },
            {
                name: "Falling Embers of Khandava",
                mode: "archery",
                skyborne: true,
                goal: 5,
                arrows: 10,
                wind: 2.8,
                desc: "Shoot the falling celestial ember targets out of the sky before they touch the ground."
            },
            {
                name: "The Leaping Stag",
                mode: "hunt",
                leaping: true,
                goal: 4,
                arrows: 8,
                wind: 2.0,
                beastSpeed: 1.5,
                desc: "Time your arrow release to strike the mystic golden stag at the apex of its graceful parabolic leap."
            },
            {
                name: "Trial of the Kirata Hunter",
                mode: "archery",
                moving: true,
                guarded: true,
                goal: 4,
                arrows: 9,
                wind: 3.2,
                desc: "Strike through revolving wooden shields as targets drift through deep mountain mists."
            }
        ]
    };

    if (!global.GameRegistry) global.GameRegistry = {};
    if (!global.GameRegistry.chapters) global.GameRegistry.chapters = [];
    global.GameRegistry.chapters[2] = chapterData;
})(window);
