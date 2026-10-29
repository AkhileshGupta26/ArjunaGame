// Divine Weapons, Wands, Astras & Chakra Arsenal
(function (global) {
    "use strict";

    const WEAPONS = [
        {
            id: "gandiva",
            name: "Gandiva Dhanush",
            title: "Celestial Divine Bow of Arjuna",
            desc: "Created by Brahma, gift of Agni & Varuna. Balanced, unbreakable, golden divine trajectory.",
            cost: 0,
            type: "bow",
            color: "#ffe082",
            glow: "rgba(255, 224, 130, 0.45)",
            speedMult: 1.0,
            drawSpeed: 1.0,
            windPierce: 0.5,
            gravityMult: 1.0,
            special: "Divine Celestial Stability",
            icon: "➶"
        },
        {
            id: "vajra",
            name: "Vajra Electric Wand",
            title: "Indra's Thunderbolt Astra",
            desc: "Crackles with supreme high-voltage lightning! +35% projectile speed, creates electric shockwave on impact that electrocutes targets.",
            cost: 500,
            type: "wand",
            color: "#00f0ff",
            glow: "rgba(0, 240, 255, 0.6)",
            speedMult: 1.35,
            drawSpeed: 1.25,
            windPierce: 0.75,
            gravityMult: 0.85,
            special: "Lightning Shockwave & Chain Zap",
            icon: "⚡"
        },
        {
            id: "agni",
            name: "Agni Flame Wand",
            title: "Sacred Fire Scepter of Khandava",
            desc: "Engulfed in burning celestial flame! Explodes on target impact, obliterates wooden obstacles and burns enemy shields.",
            cost: 900,
            type: "wand",
            color: "#ff6d26",
            glow: "rgba(255, 109, 38, 0.6)",
            speedMult: 1.15,
            drawSpeed: 1.1,
            windPierce: 0.65,
            gravityMult: 0.95,
            special: "Fiery Inferno Blast",
            icon: "🔥"
        },
        {
            id: "chakra",
            name: "Sudarshana Chakra",
            title: "Lord Krishna's Supreme Celestial Discus",
            desc: "The sacred spinning solar discus with 108 serrated golden blades! Slices through barriers, emits sunbeams, and homes with divine will.",
            cost: 1600,
            type: "chakra",
            color: "#ffd700",
            glow: "rgba(255, 215, 0, 0.75)",
            speedMult: 1.4,
            drawSpeed: 1.3,
            windPierce: 0.85,
            gravityMult: 0.7,
            special: "Spinning Blade Slices & Divine Guidance",
            icon: "☸️"
        },
        {
            id: "nagastra",
            name: "Nagastra (Serpent Astra)",
            title: "Writhing Celestial Serpent Weapon",
            desc: "Invoked with the power of Takshaka! Arrows transform into emerald venomous serpents, spitting toxic fumes and tracking target trajectory.",
            cost: 2100,
            type: "wand",
            color: "#39ff14",
            glow: "rgba(57, 255, 20, 0.65)",
            speedMult: 1.3,
            drawSpeed: 1.25,
            windPierce: 0.8,
            gravityMult: 0.8,
            special: "Venomous Serpent Strike & Tracking",
            icon: "🐍"
        },
        {
            id: "vayu",
            name: "Vayu Gale Bow",
            title: "Lord Pavana's Aero Dhanush",
            desc: "Aerodynamic perfection: 100% Wind Immunity! Arrows pierce dead-center regardless of wind speed, with lightning-fast draw.",
            cost: 2600,
            type: "bow",
            color: "#69ffb8",
            glow: "rgba(105, 255, 184, 0.6)",
            speedMult: 1.3,
            drawSpeed: 1.6,
            windPierce: 1.0,
            gravityMult: 0.8,
            special: "Zero Wind Drift & Rapid Draw",
            icon: "🌪️"
        },
        {
            id: "varuna",
            name: "Varuna Ocean Wand",
            title: "Scepter of the Primordial Depths",
            desc: "Harnesses tidal currents to slow down time during aiming. Crystalline water vortex trail with freezing impact.",
            cost: 3200,
            type: "wand",
            color: "#46c5ff",
            glow: "rgba(70, 197, 255, 0.6)",
            speedMult: 1.25,
            drawSpeed: 1.2,
            windPierce: 0.85,
            gravityMult: 0.85,
            special: "Tidal Vortex & Focus Time",
            icon: "🌊"
        },
        {
            id: "surya",
            name: "Surya Solar Wand",
            title: "Blazing Beam of the Sun God",
            desc: "Harnesses thermonuclear solar rays! Ultra-flat piercing trajectory with 50% reduced gravity drop and blinding sunburst explosion.",
            cost: 4000,
            type: "wand",
            color: "#ffc400",
            glow: "rgba(255, 196, 0, 0.7)",
            speedMult: 1.55,
            drawSpeed: 1.35,
            windPierce: 0.9,
            gravityMult: 0.5,
            special: "Solar Nova & Laser Trajectory",
            icon: "☀️"
        },
        {
            id: "brahmashira",
            name: "Brahmashira Cosmic Wand",
            title: "The Cataclysmic Weapon of the Gods",
            desc: "The ultimate divine shastra of Mahabharata! Warps reality, zero wind drift, screen-shaking cosmic starburst on impact.",
            cost: 5000,
            type: "wand",
            color: "#df73ff",
            glow: "rgba(223, 115, 255, 0.75)",
            speedMult: 1.8,
            drawSpeed: 1.7,
            windPierce: 1.0,
            gravityMult: 0.4,
            special: "Cosmic Singularity Nova",
            icon: "🌌"
        }
    ];

    const GameWeapons = {
        getAll: function () {
            return WEAPONS;
        },

        getById: function (id) {
            return WEAPONS.find(w => w.id === id) || WEAPONS[0];
        },

        drawProjectile: function (ctx, arrow, ambient) {
            const wep = arrow.wep;

            // Projectile Trail
            ctx.save();
            ctx.strokeStyle = wep.color;
            ctx.shadowColor = wep.color;
            ctx.shadowBlur = 12;
            ctx.lineWidth = wep.id === "chakra" ? 4 : 2.5;
            ctx.beginPath();
            arrow.trail.forEach(function (pt, idx) {
                if (idx === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.stroke();
            ctx.restore();

            // Projectile Sprite
            ctx.save();
            ctx.translate(arrow.x, arrow.y);

            if (wep.type === "chakra") {
                // SUDARSHANA CHAKRA SPINNING DISK
                const spin = (arrow.life || 0) * 28;
                ctx.rotate(spin);

                // Glowing core
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.fillStyle = "#ffd700";
                ctx.shadowColor = "#ffd700";
                ctx.shadowBlur = 24;
                ctx.fill();

                // Inner sacred rim
                ctx.strokeStyle = "#ff6a00";
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // 12 Serrated Sun Blades
                for (let b = 0; b < 12; b++) {
                    const ba = b * (Math.PI * 2 / 12);
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(ba) * 16, Math.sin(ba) * 16);
                    ctx.lineTo(Math.cos(ba + 0.25) * 26, Math.sin(ba + 0.25) * 26);
                    ctx.lineTo(Math.cos(ba + 0.45) * 16, Math.sin(ba + 0.45) * 16);
                    ctx.fillStyle = "#fff9c4";
                    ctx.fill();
                }

                // Central blue lotus hub
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fillStyle = "#00bcd4";
                ctx.fill();
            } else if (wep.id === "nagastra") {
                // NAGASTRA SERPENT WEAPON
                ctx.rotate(Math.atan2(arrow.vy, arrow.vx));

                // Writhing snake spine
                const wave = Math.sin((arrow.life || 0) * 25) * 5;
                ctx.strokeStyle = "#39ff14";
                ctx.shadowColor = "#39ff14";
                ctx.shadowBlur = 16;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(-28, wave);
                ctx.quadraticCurveTo(-14, -wave, 8, wave * 0.5);
                ctx.stroke();

                // Cobra serpent head
                ctx.fillStyle = "#00e676";
                ctx.beginPath();
                ctx.moveTo(8, -5);
                ctx.lineTo(20, 0);
                ctx.lineTo(8, 5);
                ctx.closePath();
                ctx.fill();

                // Red venom eyes
                ctx.fillStyle = "#ff1744";
                ctx.beginPath();
                ctx.arc(14, -2.5, 1.5, 0, Math.PI * 2);
                ctx.arc(14, 2.5, 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Standard & Elemental Arrows
                ctx.rotate(Math.atan2(arrow.vy, arrow.vx));

                // Arrow Shaft
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(-24, 0);
                ctx.lineTo(8, 0);
                ctx.stroke();

                // Arrowhead
                ctx.fillStyle = wep.color;
                ctx.shadowColor = wep.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(8, -4);
                ctx.lineTo(18, 0);
                ctx.lineTo(8, 4);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }
    };

    global.GameWeapons = GameWeapons;
})(window);
