// Legendary Characters Registry & Distinct Procedural Rendering System
(function (global) {
    "use strict";

    const CHARACTERS = [
        {
            id: "arjuna",
            name: "Arjuna (Savyasachi)",
            title: "The Peerless Ambidextrous Pandava",
            desc: "The third Pandava and disciple of Drona. Fights ambidextrously with celestial grace and pure righteousness (Dharma).",
            perk: "Savyasachi Focus (+25% Draw Speed, +10% Velocity, Golden Stardust Aura)",
            color: "#f5c542",
            accent: "#e63946",
            auraColor: "rgba(245, 197, 66, 0.5)",
            drawBonus: 1.25,
            speedBonus: 1.1,
            damageBonus: 1.0,
            swayReduction: 0.5,
            coinBonus: 1.0,
            icon: "🏹"
        },
        {
            id: "karna",
            name: "Karna (Surya Putra)",
            title: "The Invincible Son of the Sun God",
            desc: "Born with invulnerable golden armor (Kavacha) and divine earrings (Kundala). Commands the supreme fiery fury of Surya.",
            perk: "Surya's Kavacha (+25% Impact Power, +15% Velocity, 1-Hit Divine Shield)",
            color: "#ff6a00",
            accent: "#ffd700",
            auraColor: "rgba(255, 106, 0, 0.55)",
            drawBonus: 1.05,
            speedBonus: 1.15,
            damageBonus: 1.25,
            swayReduction: 0.3,
            coinBonus: 1.0,
            icon: "☀️"
        },
        {
            id: "ekalavya",
            name: "Ekalavya (Nishada Master)",
            title: "The Supreme Forest Archer",
            desc: "Mastered archery through absolute devotion before Guru Drona's clay likeness. Harnesses raw primal instinct and breathless stillness.",
            perk: "Nishada Stillness (0% Breath Sway at full draw, +35% Bonus Coins, Forest Wind)",
            color: "#00e676",
            accent: "#10b981",
            auraColor: "rgba(0, 230, 118, 0.5)",
            drawBonus: 1.1,
            speedBonus: 1.05,
            damageBonus: 1.0,
            swayReduction: 1.0,
            coinBonus: 1.35,
            icon: "🌿"
        },
        {
            id: "abhimanyu",
            name: "Abhimanyu (Chakravyuha Hero)",
            title: "The Lionhearted Young Prince",
            desc: "Son of Arjuna and Subhadra. The fearless young prodigy who shattered the legendary Chakravyuha with agile speed.",
            perk: "Vyuha Piercer (+30% Draw Speed, Arrows pierce deflection, +15% Critical)",
            color: "#00f0ff",
            accent: "#6366f1",
            auraColor: "rgba(0, 240, 255, 0.55)",
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
            const windFlutter = Math.sin(t * 5.5) * 6;
            const pullOffset = isDrawing ? pull * 26 : 0;

            // ==============================================================
            // 1. HERO-SPECIFIC CELESTIAL AURAS & AMBIENT ASTRAL EFFECTS
            // ==============================================================
            if (char.id === "karna") {
                // SURYA MANDALA: Brilliant glowing Sun Disc Halo behind Karna's head
                ctx.save();
                ctx.translate(0, -78);
                const haloPulse = 1.0 + Math.sin(t * 3) * 0.08 + (isDrawing ? pull * 0.25 : 0);
                
                // Outer glow disc
                const sunGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 36 * haloPulse);
                sunGrad.addColorStop(0, "rgba(255, 230, 100, 0.85)");
                sunGrad.addColorStop(0.5, "rgba(255, 120, 0, 0.45)");
                sunGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
                ctx.fillStyle = sunGrad;
                ctx.beginPath();
                ctx.arc(0, 0, 36 * haloPulse, 0, Math.PI * 2);
                ctx.fill();

                // 12 Radiating Solar Beams
                ctx.rotate(t * 0.8);
                ctx.strokeStyle = "#ffd700";
                ctx.lineWidth = 2.2;
                for (let r = 0; r < 12; r++) {
                    const ra = r * (Math.PI * 2 / 12);
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(ra) * 16, Math.sin(ra) * 16);
                    ctx.lineTo(Math.cos(ra) * (26 + (r % 2 === 0 ? 8 : 4) * haloPulse), Math.sin(ra) * (26 + (r % 2 === 0 ? 8 : 4) * haloPulse));
                    ctx.stroke();
                }
                ctx.restore();

                // Floating solar embers
                for (let e = 0; e < 4; e++) {
                    const ex = Math.sin(t * 2 + e * 1.5) * 22;
                    const ey = -40 - ((t * 30 + e * 25) % 65);
                    ctx.fillStyle = e % 2 === 0 ? "#ffd700" : "#ff4500";
                    ctx.beginPath();
                    ctx.arc(ex, ey, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (char.id === "ekalavya") {
                // FOREST NATURE AURA: Floating green leaves & emerald energy
                if (isDrawing && pull > 0.2) {
                    ctx.save();
                    ctx.shadowColor = "#00e676";
                    ctx.shadowBlur = 20 * pull;
                    ctx.strokeStyle = "rgba(0, 230, 118, 0.5)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, -42, 34 + pull * 8, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                // Swirling forest leaves
                for (let lf = 0; lf < 4; lf++) {
                    const lx = Math.sin(t * 2.5 + lf * 2) * 26;
                    const ly = -30 - ((t * 24 + lf * 20) % 55);
                    ctx.save();
                    ctx.translate(lx, ly);
                    ctx.rotate(t * 3 + lf);
                    ctx.fillStyle = lf % 2 === 0 ? "#00e676" : "#10b981";
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 4, 2, 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            } else if (char.id === "abhimanyu") {
                // CHAKRAVYUHA VORTEX: Azure electric sparks & energy rings
                if (isDrawing && pull > 0.2) {
                    ctx.save();
                    ctx.shadowColor = "#00f0ff";
                    ctx.shadowBlur = 25 * pull;
                    ctx.strokeStyle = "rgba(0, 240, 255, 0.6)";
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(0, -45, 34 + Math.sin(t * 8) * 4, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                // Cyan lightning motes
                for (let sp = 0; sp < 4; sp++) {
                    const sx = Math.cos(t * 4 + sp * 1.8) * 24;
                    const sy = -45 + Math.sin(t * 4 + sp * 1.8) * 30;
                    ctx.fillStyle = "#00f0ff";
                    ctx.shadowColor = "#00f0ff";
                    ctx.shadowBlur = 8;
                    ctx.fillRect(sx, sy, 2.5, 2.5);
                }
            } else {
                // ARJUNA: Savyasachi Golden Stardust & Divine Aura
                if (isDrawing && pull > 0.25) {
                    ctx.save();
                    ctx.shadowColor = "#ffd700";
                    ctx.shadowBlur = 24 * pull;
                    ctx.fillStyle = "rgba(245, 197, 66, 0.35)";
                    ctx.beginPath();
                    ctx.arc(0, -45, 36 + pull * 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                // Twinkling golden star motes
                for (let s = 0; s < 3; s++) {
                    const stx = Math.sin(t * 1.8 + s * 2.2) * 24;
                    const sty = -50 + Math.cos(t * 1.8 + s * 2.2) * 22;
                    ctx.fillStyle = "#fff59d";
                    ctx.shadowColor = "#ffd700";
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.arc(stx, sty, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // ==============================================================
            // 2. BACK QUIVER & WEAPON AMMUNITION
            // ==============================================================
            ctx.save();
            ctx.translate(-14, -48);
            ctx.rotate(0.35);

            if (char.id === "karna") {
                // Karna's Golden Solar Quiver
                ctx.fillStyle = "#d97706";
                ctx.fillRect(-6, 0, 12, 38);
                ctx.strokeStyle = "#ffd700";
                ctx.lineWidth = 2.5;
                ctx.strokeRect(-6, 0, 12, 38);
                // Flaming orange fletchings
                for (let a = -4; a <= 4; a += 3) {
                    ctx.beginPath();
                    ctx.moveTo(a, 0); ctx.lineTo(a, -17);
                    ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 2; ctx.stroke();
                    ctx.fillStyle = "#ff4500";
                    ctx.fillRect(a - 2.5, -17, 5, 8);
                }
            } else if (char.id === "ekalavya") {
                // Ekalavya's Hand-Carved Bamboo / Bark Quiver
                ctx.fillStyle = "#2d1a0e";
                ctx.fillRect(-6, 0, 12, 38);
                ctx.strokeStyle = "#00e676";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-6, 0, 12, 38);
                // Forest feather fletchings
                for (let a = -4; a <= 4; a += 3) {
                    ctx.beginPath();
                    ctx.moveTo(a, 0); ctx.lineTo(a, -16);
                    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.8; ctx.stroke();
                    ctx.fillStyle = "#00e676";
                    ctx.fillRect(a - 2.5, -16, 5, 8);
                }
            } else if (char.id === "abhimanyu") {
                // Abhimanyu's Royal Azure & Silver Quiver
                ctx.fillStyle = "#0369a1";
                ctx.fillRect(-6, 0, 12, 38);
                ctx.strokeStyle = "#e2e8f0";
                ctx.lineWidth = 2;
                ctx.strokeRect(-6, 0, 12, 38);
                // Electric-cyan fletchings
                for (let a = -4; a <= 4; a += 3) {
                    ctx.beginPath();
                    ctx.moveTo(a, 0); ctx.lineTo(a, -16);
                    ctx.strokeStyle = "#e0f2fe"; ctx.lineWidth = 2; ctx.stroke();
                    ctx.fillStyle = "#00f0ff";
                    ctx.fillRect(a - 2.5, -16, 5, 8);
                }
            } else {
                // Arjuna's Classical Rosewood & Gold Quiver
                ctx.fillStyle = "#4a2810";
                ctx.fillRect(-6, 0, 12, 38);
                ctx.strokeStyle = "#ffd700";
                ctx.lineWidth = 1.8;
                ctx.strokeRect(-6, 0, 12, 38);
                for (let a = -4; a <= 4; a += 3) {
                    ctx.beginPath();
                    ctx.moveTo(a, 0); ctx.lineTo(a, -16);
                    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.8; ctx.stroke();
                    ctx.fillStyle = char.accent;
                    ctx.fillRect(a - 2.5, -16, 5, 8);
                }
            }
            ctx.restore();

            // ==============================================================
            // 3. BILLOWING CAPE / ANGAVASTRA SCARF
            // ==============================================================
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(-6, -60);
            ctx.bezierCurveTo(-22, -50 + windFlutter, -32, -35 - windFlutter, -46 + windFlutter, -20);
            ctx.bezierCurveTo(-30, -18, -20, -32, -6, -45);
            ctx.closePath();

            if (char.id === "karna") {
                // Fiery crimson & gold solar cape
                ctx.fillStyle = "#dc2626";
                ctx.shadowColor = "#ff4500";
                ctx.shadowBlur = 12;
            } else if (char.id === "ekalavya") {
                // Earthy hunter camouflage green scarf
                ctx.fillStyle = "#1b4332";
                ctx.shadowColor = "#00e676";
                ctx.shadowBlur = 8;
            } else if (char.id === "abhimanyu") {
                // High-speed electric cyan cape
                ctx.fillStyle = "#0284c7";
                ctx.shadowColor = "#00f0ff";
                ctx.shadowBlur = 12;
            } else {
                // Arjuna's sacred vermilion silk scarf
                ctx.fillStyle = "#e63946";
                ctx.shadowColor = "#f5c542";
                ctx.shadowBlur = 10;
            }
            ctx.fill();
            ctx.restore();

            // ==============================================================
            // 4. LOWER BODY & ROYAL DHOTI
            // ==============================================================
            let dhotiColor = "#e59b20";     // Arjuna: saffron gold
            let dhotiTrim = "#ffd700";
            if (char.id === "karna") {
                dhotiColor = "#991b1b";     // Karna: deep royal scarlet
                dhotiTrim = "#ffd700";
            } else if (char.id === "ekalavya") {
                dhotiColor = "#2d5a27";     // Ekalavya: forest moss green
                dhotiTrim = "#a7f3d0";
            } else if (char.id === "abhimanyu") {
                dhotiColor = "#0369a1";     // Abhimanyu: celestial sapphire blue
                dhotiTrim = "#e2e8f0";
            }

            ctx.fillStyle = dhotiColor;
            ctx.beginPath();
            ctx.moveTo(-12, -38);
            ctx.lineTo(12, -38);
            ctx.lineTo(14, 0);
            ctx.lineTo(0, -5);
            ctx.lineTo(-14, 0);
            ctx.closePath();
            ctx.fill();

            // Decorative gold/silver borders on dhoti
            ctx.strokeStyle = dhotiTrim;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-12, -38);
            ctx.lineTo(12, -38);
            ctx.moveTo(-14, 0);
            ctx.lineTo(0, -5);
            ctx.lineTo(14, 0);
            ctx.stroke();

            // ==============================================================
            // 5. HERO COMPLEXION & TORSO
            // ==============================================================
            let skinTone = "#c97b58"; // Arjuna: warm honey-bronze
            if (char.id === "karna") skinTone = "#ba6d42";      // Karna: sun-kissed golden bronze
            if (char.id === "ekalavya") skinTone = "#8c4d2d";   // Ekalavya: deep earthy mahogany
            if (char.id === "abhimanyu") skinTone = "#d48b6a";  // Abhimanyu: youthful almond complexion

            ctx.fillStyle = skinTone;
            ctx.fillRect(-9, -64, 18, 26);

            // ==============================================================
            // 6. DISTINCTIVE ARMOR / KAVACHA
            // ==============================================================
            if (char.id === "karna") {
                // SURYA'S CELESTIAL KAVACHA (Golden Armor Fused to Skin)
                ctx.save();
                ctx.fillStyle = "#ffd700";
                ctx.shadowColor = "#ff8c00";
                ctx.shadowBlur = 18;
                ctx.beginPath();
                ctx.moveTo(-11, -65);
                ctx.lineTo(11, -65);
                ctx.lineTo(8, -40);
                ctx.lineTo(0, -38);
                ctx.lineTo(-8, -40);
                ctx.closePath();
                ctx.fill();

                // Heavy sculpted golden pauldrons (wide shoulder armor)
                ctx.fillStyle = "#f59e0b";
                ctx.fillRect(-14, -66, 6, 8);
                ctx.fillRect(8, -66, 6, 8);

                // Blazing Sun Medallion in center of chest
                ctx.beginPath();
                ctx.arc(0, -52, 5, 0, Math.PI * 2);
                ctx.fillStyle = "#ff4500";
                ctx.shadowColor = "#ff4500";
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.restore();
            } else if (char.id === "ekalavya") {
                // BARE MUSCULAR HUNTER CHEST + TIGER CLAW & RUDRAKSHA TALISMAN
                // Cross-chest hunter leather strap
                ctx.strokeStyle = "#3e2723";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-9, -64);
                ctx.lineTo(8, -42);
                ctx.stroke();

                // Tribal bead & claw necklace
                ctx.fillStyle = "#ffffff";
                for (let cl = -6; cl <= 6; cl += 4) {
                    ctx.beginPath();
                    ctx.arc(cl, -60, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Center tiger claw pendant
                ctx.fillStyle = "#fef08a";
                ctx.beginPath();
                ctx.moveTo(-2, -58); ctx.lineTo(2, -58); ctx.lineTo(0, -51);
                ctx.fill();
            } else if (char.id === "abhimanyu") {
                // AGILE SILVER & SAPPHIRE LIGHTWEIGHT SCALE ARMOR
                ctx.save();
                ctx.fillStyle = "#0284c7";
                ctx.beginPath();
                ctx.moveTo(-9, -64);
                ctx.lineTo(9, -64);
                ctx.lineTo(7, -42);
                ctx.lineTo(0, -39);
                ctx.lineTo(-7, -42);
                ctx.closePath();
                ctx.fill();

                // Silver scale trims
                ctx.strokeStyle = "#e2e8f0";
                ctx.lineWidth = 2;
                ctx.stroke();

                // Sapphire lion crest in center
                ctx.beginPath();
                ctx.arc(0, -53, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#00f0ff";
                ctx.shadowColor = "#00f0ff";
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.restore();
            } else {
                // ARJUNA: CLASSICAL ROYAL GOLDEN BREASTPLATE
                ctx.save();
                ctx.fillStyle = "#e6b800";
                ctx.shadowColor = "#ffd700";
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(-9, -64);
                ctx.lineTo(9, -64);
                ctx.lineTo(7, -42);
                ctx.lineTo(0, -39);
                ctx.lineTo(-7, -42);
                ctx.closePath();
                ctx.fill();

                // Pearl necklace (Mukta-hara)
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.arc(0, -62, 5, 0.2, Math.PI - 0.2);
                ctx.stroke();

                // Golden lotus jewel
                ctx.beginPath();
                ctx.arc(0, -53, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#e63946";
                ctx.fill();
                ctx.restore();
            }

            // ==============================================================
            // 7. HEAD, FACIAL FEATURES, TILAK & EARRINGS
            // ==============================================================
            ctx.beginPath();
            ctx.arc(0, -76, 10, 0, Math.PI * 2);
            ctx.fillStyle = skinTone;
            ctx.fill();

            // Character-specific Tilak & Facial Markings
            if (char.id === "karna") {
                // Glowing crimson solar tilak
                ctx.fillStyle = "#ff1744";
                ctx.shadowColor = "#ff1744";
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(0, -79, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (char.id === "ekalavya") {
                // Nishada hunter war paint across cheeks
                ctx.strokeStyle = "#00e676";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-7, -76); ctx.lineTo(-2, -74);
                ctx.moveTo(2, -74); ctx.lineTo(7, -76);
                ctx.stroke();
            } else if (char.id === "abhimanyu") {
                // Cyan double-spear warrior tilak
                ctx.strokeStyle = "#00f0ff";
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(0, -82); ctx.lineTo(0, -77);
                ctx.stroke();
            } else {
                // Arjuna's sacred Vaishnava Urdhva-Pundra tilak
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(-1.5, -82); ctx.lineTo(-1.5, -77);
                ctx.moveTo(1.5, -82); ctx.lineTo(1.5, -77);
                ctx.stroke();
                ctx.fillStyle = "#ff1744";
                ctx.beginPath();
                ctx.arc(0, -78, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Character-specific Earrings / Kundala
            if (char.id === "karna") {
                // DIVINE CELESTIAL KUNDALA (Large, shining solar earrings)
                ctx.save();
                ctx.fillStyle = "#ffd700";
                ctx.shadowColor = "#ffd700";
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(-9, -73, 4, 0, Math.PI * 2);
                ctx.arc(9, -73, 4, 0, Math.PI * 2);
                ctx.fill();
                // Pendant drop
                ctx.fillStyle = "#ff6a00";
                ctx.fillRect(-10, -69, 2, 4);
                ctx.fillRect(8, -69, 2, 4);
                ctx.restore();
            } else if (char.id === "abhimanyu") {
                // Silver and sapphire studs
                ctx.fillStyle = "#00f0ff";
                ctx.beginPath();
                ctx.arc(-8, -74, 2, 0, Math.PI * 2);
                ctx.arc(8, -74, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (char.id === "arjuna") {
                // Royal gold rings
                ctx.fillStyle = "#ffd700";
                ctx.beginPath();
                ctx.arc(-8, -74, 2.5, 0, Math.PI * 2);
                ctx.arc(8, -74, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // ==============================================================
            // 8. DISTINCTIVE CROWNS & HEADGEAR
            // ==============================================================
            if (char.id === "karna") {
                // Surya Putra Flaming Solar Tiara & Flowing Hair
                // Raven hair locks
                ctx.fillStyle = "#1e1e1e";
                ctx.beginPath();
                ctx.arc(-7, -77, 4, 0, Math.PI * 2);
                ctx.arc(7, -77, 4, 0, Math.PI * 2);
                ctx.fill();

                // High golden solar crown with sunburst
                ctx.save();
                ctx.fillStyle = "#ffd700";
                ctx.shadowColor = "#ffd700";
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.moveTo(-10, -82);
                ctx.lineTo(-7, -93);
                ctx.lineTo(0, -102); // Tall central solar peak
                ctx.lineTo(7, -93);
                ctx.lineTo(10, -82);
                ctx.closePath();
                ctx.fill();

                // Ruby in crown
                ctx.beginPath();
                ctx.arc(0, -90, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#ff1744";
                ctx.fill();
                ctx.restore();
            } else if (char.id === "ekalavya") {
                // TRIBAL BRAIDED LEATHER BAND WITH TALL PEACOCK & EAGLE FEATHERS
                ctx.fillStyle = "#27170e";
                ctx.fillRect(-10, -84, 20, 5);

                // Feather 1: Emerald Peacock Feather
                ctx.save();
                ctx.translate(2, -84);
                ctx.rotate(0.12);
                ctx.fillStyle = "#00e676";
                ctx.beginPath();
                ctx.moveTo(-2, 0); ctx.lineTo(3, -20); ctx.lineTo(6, 0);
                ctx.fill();
                // Peacock eye
                ctx.beginPath();
                ctx.arc(3, -15, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = "#0284c7";
                ctx.fill();
                ctx.restore();

                // Feather 2: Golden Eagle Feather
                ctx.save();
                ctx.translate(-4, -84);
                ctx.rotate(-0.15);
                ctx.fillStyle = "#ffd700";
                ctx.beginPath();
                ctx.moveTo(-2, 0); ctx.lineTo(1, -16); ctx.lineTo(4, 0);
                ctx.fill();
                ctx.restore();
            } else if (char.id === "abhimanyu") {
                // SIMHA KIRITA (Lion Crown with Sapphire Centerpiece)
                ctx.save();
                ctx.fillStyle = "#e2e8f0"; // Platinum silver coronet
                ctx.shadowColor = "#00f0ff";
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(-10, -82);
                ctx.lineTo(-5, -92);
                ctx.lineTo(0, -97);
                ctx.lineTo(5, -92);
                ctx.lineTo(10, -82);
                ctx.closePath();
                ctx.fill();

                // Roaring Lion relief in gold
                ctx.fillStyle = "#ffd700";
                ctx.beginPath();
                ctx.arc(0, -89, 4, 0, Math.PI * 2);
                ctx.fill();

                // Center glowing sapphire
                ctx.beginPath();
                ctx.arc(0, -89, 2, 0, Math.PI * 2);
                ctx.fillStyle = "#00f0ff";
                ctx.fill();
                ctx.restore();
            } else {
                // ARJUNA: CLASSICAL ORNATE GOLDEN KIRITA (3-Tiered Crown)
                ctx.save();
                ctx.fillStyle = "#ffd700";
                ctx.shadowColor = "#ffd700";
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(-10, -82);
                ctx.lineTo(-6, -92);
                ctx.lineTo(0, -99);
                ctx.lineTo(6, -92);
                ctx.lineTo(10, -82);
                ctx.closePath();
                ctx.fill();

                // Ruby gem
                ctx.beginPath();
                ctx.arc(0, -88, 2.8, 0, Math.PI * 2);
                ctx.fillStyle = "#ff1744";
                ctx.fill();
                ctx.restore();
            }

            // ==============================================================
            // 9. ARMS, BRACERS & DRAW STANCE
            // ==============================================================
            ctx.strokeStyle = skinTone;
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(-7, -56);
            ctx.lineTo(14, -52);
            ctx.lineTo(26 - pullOffset, -52);
            ctx.stroke();

            // Character-specific Bracers / Vambraces
            if (char.id === "ekalavya") {
                // Wrapped leather archer bracers with green cord
                ctx.fillStyle = "#3e2723";
                ctx.fillRect(8, -55, 6, 6);
                ctx.fillRect(20 - pullOffset, -55, 6, 6);
                ctx.fillStyle = "#00e676";
                ctx.fillRect(10, -54, 2, 4);
                ctx.fillRect(22 - pullOffset, -54, 2, 4);
            } else if (char.id === "abhimanyu") {
                // Polished silver & sapphire bracers
                ctx.fillStyle = "#e2e8f0";
                ctx.fillRect(8, -55, 6, 6);
                ctx.fillRect(20 - pullOffset, -55, 6, 6);
                ctx.fillStyle = "#00f0ff";
                ctx.fillRect(10, -54, 2, 4);
                ctx.fillRect(22 - pullOffset, -54, 2, 4);
            } else {
                // Golden royal vambraces
                ctx.fillStyle = "#ffd700";
                ctx.fillRect(8, -55, 6, 6);
                ctx.fillRect(20 - pullOffset, -55, 6, 6);
            }

            // ==============================================================
            // 10. EQUIPPED WEAPON (BOW, WAND, CHAKRA, OR NAGASTRA)
            // ==============================================================
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
                // 8 Serrated Blades
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
                // Wand / Celestial Scepter
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
                // Bow (Gandiva / Vayu)
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
