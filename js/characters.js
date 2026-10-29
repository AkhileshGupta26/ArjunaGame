// Legendary Characters Registry & Enhanced Rendering System
(function (global) {
    "use strict";

    const CHARACTERS = [
        {
            id: "arjuna",
            name: "Arjuna (Savyasachi)",
            title: "The Peerless Ambidextrous Archer",
            desc: "The third Pandava, disciple of Drona and friend of Krishna. Can shoot equally with both hands.",
            perk: "Savyasachi Focus (+25% Draw Speed, +10% Arrow Velocity)",
            color: "#f5c542",
            accent: "#ff3d00",
            auraColor: "rgba(245, 197, 66, 0.45)",
            drawBonus: 1.25,
            speedBonus: 1.1,
            damageBonus: 1.0,
            swayReduction: 0.5,
            coinBonus: 1.0,
            icon: "🏹"
        },
        {
            id: "karna",
            name: "Karna (Radheya)",
            title: "The Invincible Son of Surya",
            desc: "Born with golden armor (Kavacha) and divine earrings (Kundala). Possesses supreme solar fury.",
            perk: "Surya's Blessing (+25% Impact Power, Starts trials with 1 Hit Absorption Shield)",
            color: "#ff6a00",
            accent: "#ffd700",
            auraColor: "rgba(255, 106, 0, 0.5)",
            drawBonus: 1.05,
            speedBonus: 1.15,
            damageBonus: 1.25,
            swayReduction: 0.3,
            coinBonus: 1.0,
            icon: "☀️"
        },
        {
            id: "ekalavya",
            name: "Ekalavya",
            title: "The Supreme Nishada Archer",
            desc: "Mastered archery through unwavering devotion before the clay statue of Guru Drona.",
            perk: "Unyielding Stillness (0% Breath Sway at full draw, +35% Bonus Coins)",
            color: "#00e676",
            accent: "#b9f6ca",
            auraColor: "rgba(0, 230, 118, 0.45)",
            drawBonus: 1.1,
            speedBonus: 1.05,
            damageBonus: 1.0,
            swayReduction: 1.0,
            coinBonus: 1.35,
            icon: "🌿"
        },
        {
            id: "abhimanyu",
            name: "Abhimanyu",
            title: "The Lionhearted Prince",
            desc: "Son of Arjuna and Subhadra. The valiant young hero who broke into the dreaded Chakravyuha.",
            perk: "Vyuha Piercer (Arrows pierce obstacles with less deflection, +30% Draw Speed)",
            color: "#00f0ff",
            accent: "#7000ff",
            auraColor: "rgba(0, 240, 255, 0.5)",
            drawBonus: 1.3,
            speedBonus: 1.2,
            damageBonus: 1.1,
            swayReduction: 0.4,
            coinBonus: 1.15,
            icon: "🦁"
        }
    ];

    const GameCharacters = {
        getAll: function () {
            return CHARACTERS;
        },

        getById: function (id) {
            return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
        },

        drawCharacter: function (ctx, charId, x, y, scale, angle, pull, isDrawing, wep, ambient) {
            const char = GameCharacters.getById(charId);

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);

            const t = ambient || 0;
            const windFlutter = Math.sin(t * 5) * 6;

            // Divine Aura Glow when pulling bow
            if (isDrawing && pull > 0.3) {
                ctx.save();
                ctx.shadowColor = char.color;
                ctx.shadowBlur = 24 * pull;
                ctx.beginPath();
                ctx.arc(0, -45, 36 + pull * 8, 0, Math.PI * 2);
                ctx.fillStyle = char.auraColor;
                ctx.fill();
                ctx.restore();
            }

            // 1. Quiver with Fletched Arrows on Back
            ctx.save();
            ctx.translate(-14, -48);
            ctx.rotate(0.35);
            // Quiver body
            ctx.fillStyle = "#4a2810";
            ctx.fillRect(-6, 0, 12, 38);
            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-6, 0, 12, 38);
            // Arrow feathers sticking out
            for (let a = -4; a <= 4; a += 3) {
                ctx.beginPath();
                ctx.moveTo(a, 0);
                ctx.lineTo(a, -16);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.8;
                ctx.stroke();
                // Feathers fletching
                ctx.fillStyle = char.accent;
                ctx.fillRect(a - 2.5, -16, 5, 8);
            }
            ctx.restore();

            // 2. Billowing Angavastra / Royal Scarf
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(-6, -60);
            ctx.bezierCurveTo(-22, -50 + windFlutter, -32, -35 - windFlutter, -45 + windFlutter, -20);
            ctx.bezierCurveTo(-30, -18, -20, -32, -6, -45);
            ctx.closePath();
            ctx.fillStyle = char.accent;
            ctx.shadowColor = char.accent;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();

            // 3. Lower Body: Royal Pleated Silk Dhoti
            let dhotiColor = "#e59b20";
            if (char.id === "karna") dhotiColor = "#b81414";
            if (char.id === "ekalavya") dhotiColor = "#2d5a27";
            if (char.id === "abhimanyu") dhotiColor = "#125b8a";

            ctx.fillStyle = dhotiColor;
            ctx.beginPath();
            ctx.moveTo(-12, -38);
            ctx.lineTo(12, -38);
            ctx.lineTo(14, 0);
            ctx.lineTo(0, -5);
            ctx.lineTo(-14, 0);
            ctx.closePath();
            ctx.fill();

            // Golden waistband / girdle
            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-12, -38);
            ctx.lineTo(12, -38);
            ctx.stroke();

            // 4. Heroic Muscular Torso & Golden Armor (Kavacha)
            ctx.fillStyle = "#c97b58"; // Complexion
            ctx.fillRect(-9, -64, 18, 26);

            // Golden Armor Breastplate
            ctx.fillStyle = char.id === "karna" ? "#ffd700" : "#e6b800";
            ctx.beginPath();
            ctx.moveTo(-9, -64);
            ctx.lineTo(9, -64);
            ctx.lineTo(7, -42);
            ctx.lineTo(0, -39);
            ctx.lineTo(-7, -42);
            ctx.closePath();
            ctx.shadowColor = "#ffd700";
            ctx.shadowBlur = char.id === "karna" ? 14 : 6;
            ctx.fill();

            // Sun Emblem / Jewel on Chestplate
            ctx.beginPath();
            ctx.arc(0, -53, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#ff3d00";
            ctx.fill();

            // 5. Head, Kundala Earrings & Tilak
            ctx.beginPath();
            ctx.arc(0, -76, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#c97b58";
            ctx.fill();

            // Glowing Tilak on forehead
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -82);
            ctx.lineTo(0, -77);
            ctx.stroke();
            ctx.fillStyle = "#ff1744";
            ctx.beginPath();
            ctx.arc(0, -78, 1.2, 0, Math.PI * 2);
            ctx.fill();

            // Golden Kundala (Earrings)
            ctx.fillStyle = "#ffd700";
            ctx.beginPath();
            ctx.arc(-8, -74, 2.5, 0, Math.PI * 2);
            ctx.arc(8, -74, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // 6. Royal Kirita / Crown / Headband
            if (char.id === "ekalavya") {
                // Feathered Nishada Headband
                ctx.fillStyle = "#3e2723";
                ctx.fillRect(-10, -84, 20, 5);
                ctx.fillStyle = "#00e676";
                ctx.beginPath();
                ctx.moveTo(2, -84);
                ctx.lineTo(10, -98);
                ctx.lineTo(4, -84);
                ctx.fill();
            } else {
                // Ornate Golden Kirita (Crown)
                ctx.beginPath();
                ctx.moveTo(-10, -82);
                ctx.lineTo(-6, -92);
                ctx.lineTo(0, -99);
                ctx.lineTo(6, -92);
                ctx.lineTo(10, -82);
                ctx.closePath();
                ctx.fillStyle = "#ffd700";
                ctx.shadowColor = "#ffd700";
                ctx.shadowBlur = 10;
                ctx.fill();

                // Ruby in crown
                ctx.beginPath();
                ctx.arc(0, -88, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = "#ff1744";
                ctx.fill();
            }

            // 7. Arms, Bow Grip & String Pull
            const pullOffset = isDrawing ? pull * 26 : 0;
            ctx.strokeStyle = "#c97b58";
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(-7, -56);
            ctx.lineTo(14, -52);
            ctx.lineTo(26 - pullOffset, -52);
            ctx.stroke();

            // Golden Vambraces / Armguards
            ctx.fillStyle = "#ffd700";
            ctx.fillRect(8, -55, 6, 6);
            ctx.fillRect(20 - pullOffset, -55, 6, 6);

            // 8. Draw Equipped Weapon (Bow, Wand, Chakra, or Nagastra)
            ctx.save();
            ctx.translate(26, -52);
            ctx.rotate(-angle);

            if (wep.type === "chakra") {
                // Sudarshana Chakra Discus in Hand
                const spin = t * 14;
                ctx.save();
                ctx.rotate(spin);
                ctx.beginPath();
                ctx.arc(0, 0, 16, 0, Math.PI * 2);
                ctx.fillStyle = "#ffd700";
                ctx.shadowColor = "#ffd700";
                ctx.shadowBlur = 18;
                ctx.fill();
                // Blades
                for (let b = 0; b < 8; b++) {
                    const ba = b * (Math.PI * 2 / 8);
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(ba) * 16, Math.sin(ba) * 16);
                    ctx.lineTo(Math.cos(ba + 0.3) * 24, Math.sin(ba + 0.3) * 24);
                    ctx.lineTo(Math.cos(ba + 0.5) * 16, Math.sin(ba + 0.5) * 16);
                    ctx.fillStyle = "#fff59d";
                    ctx.fill();
                }
                ctx.restore();
            } else if (wep.type === "wand") {
                // Scepter / Wand
                ctx.strokeStyle = wep.color;
                ctx.shadowColor = wep.color;
                ctx.shadowBlur = 14;
                ctx.lineWidth = 4.5;
                ctx.beginPath();
                ctx.moveTo(-12, 0);
                ctx.lineTo(28, 0);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(28, 0, 7, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
            } else {
                // Bow
                const bend = isDrawing ? pull * 16 : 0;
                ctx.strokeStyle = wep.color;
                ctx.shadowColor = wep.color;
                ctx.shadowBlur = 16;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(-9 - bend, -34);
                ctx.bezierCurveTo(14, -18, 18, 0, 18, 0);
                ctx.bezierCurveTo(18, 0, 14, 18, -9 - bend, 34);
                ctx.stroke();

                // Bowstring
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(-9 - bend, -34);
                ctx.lineTo(-pullOffset, 0);
                ctx.lineTo(-9 - bend, 34);
                ctx.stroke();
            }
            ctx.restore();

            ctx.restore();
        }
    };

    global.GameCharacters = GameCharacters;
})(window);
