// Divine Weapons, Wands, Astras & Special Effects Engine
(function (global) {
    "use strict";

    const WEAPONS = [
        {
            id: "gandiva",
            name: "Gandiva Dhanush",
            title: "Celestial Divine Bow of Arjuna",
            desc: "Created by Brahma, gift of Agni & Varuna. The sacred Dhanush with unbreakable string. Unlimited standard arrows.",
            cost: 0,
            type: "bow",
            color: "#ffe082",
            glow: "rgba(255, 224, 130, 0.45)",
            speedMult: 1.0,
            drawSpeed: 1.0,
            windPierce: 0.5,
            gravityMult: 1.0,
            cooldown: 0, // Always ready, 0 refuel time
            special: "Celestial Divine Precision (Core Bow)",
            icon: "➶"
        },
        {
            id: "agni",
            name: "Agni Flame Wand",
            title: "Sacred Fire Scepter of Khandava",
            desc: "Summons blazing Agni Meteorites from the heavens that crash into the enemy area with explosive inferno!",
            cost: 900,
            type: "wand",
            color: "#ff6d26",
            glow: "rgba(255, 109, 38, 0.65)",
            speedMult: 1.2,
            drawSpeed: 1.15,
            windPierce: 0.7,
            gravityMult: 0.9,
            cooldown: 6.0, // 6s refuel
            special: "Rains 3 Fiery Agni Meteorites from Sky",
            icon: "🔥"
        },
        {
            id: "vajra",
            name: "Vajra Electric Wand",
            title: "Indra's Thunderbolt Astra",
            desc: "Releases 3 high-voltage electric shock balls in a spread that chain-zap and electrocute targets with intense thunderous arcs!",
            cost: 500,
            type: "wand",
            color: "#00f0ff",
            glow: "rgba(0, 240, 255, 0.65)",
            speedMult: 1.35,
            drawSpeed: 1.25,
            windPierce: 0.8,
            gravityMult: 0.85,
            cooldown: 5.0, // 5s refuel
            special: "Fires 3 Crackling Electric Shock Balls",
            icon: "⚡"
        },
        {
            id: "nagastra",
            name: "Nagastra (Serpent Astra)",
            title: "Writhing Celestial Serpent Weapon",
            desc: "Releases an animated slithering venomous snake arrow with dripping poison that creates an expanding toxic acid cloud on impact!",
            cost: 2100,
            type: "wand",
            color: "#39ff14",
            glow: "rgba(57, 255, 20, 0.65)",
            speedMult: 1.25,
            drawSpeed: 1.2,
            windPierce: 0.8,
            gravityMult: 0.8,
            cooldown: 7.0, // 7s refuel
            special: "Slithering Poison Snake & Toxic Cloud",
            icon: "🐍"
        },
        {
            id: "brahmashira",
            name: "Brahmashira (Brahmastra Wand)",
            title: "Supreme Cosmos-Splitting Shastra",
            desc: "The ultimate weapon of total destruction! Darkens the sky into a cosmic void, strikes celestial cosmic lightning, and drops giant cosmic meteors!",
            cost: 5000,
            type: "wand",
            color: "#df73ff",
            glow: "rgba(223, 115, 255, 0.8)",
            speedMult: 1.7,
            drawSpeed: 1.6,
            windPierce: 1.0,
            gravityMult: 0.4,
            cooldown: 14.0, // 14s refuel
            special: "Cosmic Environment Destroyer & Falling Meteors",
            icon: "🌌"
        },
        {
            id: "surya",
            name: "Surya Solar Wand",
            title: "Blazing Beam of the Sun God",
            desc: "Channels a continuous concentrated thermonuclear solar laser beam for 2.8 seconds, incinerating anything in its path with solar flares!",
            cost: 4000,
            type: "wand",
            isBeam: true,
            beamDuration: 2.8,
            color: "#ffc400",
            glow: "rgba(255, 196, 0, 0.75)",
            speedMult: 1.5,
            drawSpeed: 1.3,
            windPierce: 0.95,
            gravityMult: 0.5,
            cooldown: 9.0, // 9s refuel
            special: "Continuous Solar Laser Beam (2.8s)",
            icon: "☀️"
        },
        {
            id: "varuna",
            name: "Varuna Ocean Wand",
            title: "Scepter of the Primordial Depths",
            desc: "Releases a continuous rushing torrent of ocean water waves and tidal geysers for 2.8 seconds that batter and submerge targets!",
            cost: 3200,
            type: "wand",
            isBeam: true,
            beamDuration: 2.8,
            color: "#46c5ff",
            glow: "rgba(70, 197, 255, 0.65)",
            speedMult: 1.25,
            drawSpeed: 1.2,
            windPierce: 0.85,
            gravityMult: 0.8,
            cooldown: 8.0, // 8s refuel
            special: "Continuous Rushing Tidal Torrent (2.8s)",
            icon: "🌊"
        },
        {
            id: "chakra",
            name: "Sudarshana Chakra",
            title: "Lord Krishna's Supreme Discus",
            desc: "The sacred spinning solar discus with 108 serrated golden blades! Slices through barriers, emits sunbeams, and homes with divine will.",
            cost: 1600,
            type: "chakra",
            color: "#ffd700",
            glow: "rgba(255, 215, 0, 0.75)",
            speedMult: 1.4,
            drawSpeed: 1.3,
            windPierce: 0.85,
            gravityMult: 0.7,
            cooldown: 6.0, // 6s refuel
            special: "Spinning Blade Slices & Divine Guidance",
            icon: "☸️"
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
            cooldown: 4.0, // 4s refuel
            special: "Zero Wind Drift & Rapid Draw",
            icon: "🌪️"
        }
    ];

    const GameWeapons = {
        getAll: function () {
            return WEAPONS;
        },

        getById: function (id) {
            return WEAPONS.find(w => w.id === id) || WEAPONS[0];
        },

        // Projectile Rendering (Arrows, Electric Shock Balls, Slithering Snake, Singularity)
        drawProjectile: function (ctx, arrow, ambient) {
            const wep = arrow.wep;
            const t = (arrow.life || 0);

            // 1. Trail Rendering
            ctx.save();
            ctx.strokeStyle = wep.color;
            ctx.shadowColor = wep.color;
            ctx.shadowBlur = 14;
            ctx.lineWidth = wep.id === "chakra" ? 4 : (arrow.isShockBall ? 3.5 : 2.5);
            ctx.beginPath();
            arrow.trail.forEach(function (pt, idx) {
                if (idx === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.stroke();
            ctx.restore();

            // 2. Projectile Head / Body
            ctx.save();
            ctx.translate(arrow.x, arrow.y);

            if (arrow.isShockBall || wep.id === "vajra") {
                // VAJRA ELECTRIC SHOCK BALL (Pulsating Plasma Orb with crackling arcs)
                const pulse = 1.0 + Math.sin(t * 30 + (arrow.ballIndex || 0)) * 0.2;
                const r = (arrow.radius || 10) * pulse;

                // Core plasma glow
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "#00f0ff";
                ctx.shadowBlur = 22;
                ctx.fill();

                // Outer electric shell
                ctx.strokeStyle = "#00f0ff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
                ctx.stroke();

                // Crackling branching lightning arcs
                for (let a = 0; a < 4; a++) {
                    const ang = t * 15 + a * (Math.PI / 2);
                    const len = r + 6 + Math.random() * 8;
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(ang) * (r * 0.5), Math.sin(ang) * (r * 0.5));
                    ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
                    ctx.stroke();
                }
            } else if (arrow.isAgniMeteor || (wep.id === "agni" && arrow.isMeteor)) {
                // AGNI METEORITE (Falling burning rock with smoke and flames)
                ctx.rotate(Math.atan2(arrow.vy, arrow.vx));

                // Burning core
                ctx.beginPath();
                ctx.arc(0, 0, 14, 0, Math.PI * 2);
                ctx.fillStyle = "#ffdd00";
                ctx.shadowColor = "#ff4500";
                ctx.shadowBlur = 26;
                ctx.fill();

                // Craggy rock body
                ctx.fillStyle = "#b43403";
                ctx.beginPath();
                ctx.arc(-2, 0, 11, 0, Math.PI * 2);
                ctx.fill();

                // Fiery comet tail flames
                for (let f = 0; f < 5; f++) {
                    ctx.fillStyle = f % 2 === 0 ? "#ff4500" : "#ff9900";
                    ctx.beginPath();
                    ctx.moveTo(-10, -6 + f * 3);
                    ctx.lineTo(-24 - Math.random() * 14, -3 + f * 2);
                    ctx.lineTo(-10, 0 + f * 3);
                    ctx.fill();
                }
            } else if (wep.id === "nagastra") {
                // NAGASTRA: REAL SLITHERING ANIMATED SNAKE WITH POISON DRIPS
                const moveAngle = Math.atan2(arrow.vy, arrow.vx);
                ctx.rotate(moveAngle);

                // Writhing snake body with 14 undulating segments
                const segCount = 14;
                const segSpacing = 3.2;
                ctx.lineWidth = 5;
                ctx.lineCap = "round";
                ctx.strokeStyle = "#39ff14";
                ctx.shadowColor = "#39ff14";
                ctx.shadowBlur = 16;

                ctx.beginPath();
                for (let s = 0; s < segCount; s++) {
                    const sx = -s * segSpacing;
                    const wave = Math.sin(t * 26 - s * 0.6) * (6 * (1 - s / segCount));
                    if (s === 0) ctx.moveTo(sx, wave);
                    else ctx.lineTo(sx, wave);
                }
                ctx.stroke();

                // Cobra Hood & Serpent Head
                const headWave = Math.sin(t * 26) * 1.5;
                ctx.save();
                ctx.translate(6, headWave);

                // Cobra hood flaring
                ctx.fillStyle = "#10b981";
                ctx.beginPath();
                ctx.ellipse(-2, 0, 7, 5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Head triangular snout
                ctx.fillStyle = "#00e676";
                ctx.beginPath();
                ctx.moveTo(-2, -4);
                ctx.lineTo(12, 0);
                ctx.lineTo(-2, 4);
                ctx.closePath();
                ctx.fill();

                // Glowing red venom eyes
                ctx.fillStyle = "#ff1744";
                ctx.beginPath();
                ctx.arc(3, -2.5, 1.4, 0, Math.PI * 2);
                ctx.arc(3, 2.5, 1.4, 0, Math.PI * 2);
                ctx.fill();

                // Forked tongue flicking
                if (Math.sin(t * 40) > 0.2) {
                    ctx.strokeStyle = "#ff1744";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(12, 0);
                    ctx.lineTo(18, 0);
                    ctx.lineTo(21, -2);
                    ctx.moveTo(18, 0);
                    ctx.lineTo(21, 2);
                    ctx.stroke();
                }
                ctx.restore();
            } else if (wep.id === "brahmashira") {
                // BRAHMASHIRA: COSMIC SINGULARITY CORE & SPACE WARP
                const spin = t * 12;
                ctx.rotate(spin);

                // Cosmic purple accretion disk
                const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(0.35, "#df73ff");
                grad.addColorStop(0.7, "#7b2cbf");
                grad.addColorStop(1, "rgba(60, 9, 108, 0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, 24, 0, Math.PI * 2);
                ctx.fill();

                // Gravitational black core
                ctx.fillStyle = "#0a0014";
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();

                // 4 Cosmic Energy Orbits
                for (let o = 0; o < 4; o++) {
                    const oa = spin + o * (Math.PI / 2);
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(Math.cos(oa) * 16, Math.sin(oa) * 16, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (wep.type === "chakra") {
                // SUDARSHANA CHAKRA SPINNING DISK
                const spin = t * 28;
                ctx.rotate(spin);

                // Glowing core
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.fillStyle = "#ffd700";
                ctx.shadowColor = "#ffd700";
                ctx.shadowBlur = 24;
                ctx.fill();

                // Inner rim
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

                // Lotus center
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fillStyle = "#00bcd4";
                ctx.fill();
            } else {
                // Standard Celestial Arrows
                ctx.rotate(Math.atan2(arrow.vy, arrow.vx));

                // Shaft
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(-24, 0);
                ctx.lineTo(8, 0);
                ctx.stroke();

                // Glowing celestial arrowhead
                ctx.fillStyle = wep.color;
                ctx.shadowColor = wep.color;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.moveTo(8, -4);
                ctx.lineTo(19, 0);
                ctx.lineTo(8, 4);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        },

        // Continuous Beam Rendering (Surya Solar Laser & Varuna Tidal Waves)
        drawContinuousBeam: function (ctx, beam, ambient, W, H) {
            ctx.save();
            const t = ambient || 0;
            const ox = beam.originX;
            const oy = beam.originY;
            const tx = beam.targetX;
            const ty = beam.targetY;
            const dist = Math.hypot(tx - ox, ty - oy);
            const ang = Math.atan2(ty - oy, tx - ox);

            if (beam.type === "surya") {
                // SURYA THERMONUCLEAR SOLAR LASER BEAM
                ctx.save();
                ctx.translate(ox, oy);
                ctx.rotate(ang);

                // 1. Broad radiant solar corona
                ctx.strokeStyle = "rgba(255, 140, 0, 0.45)";
                ctx.lineWidth = 34 + Math.sin(t * 20) * 6;
                ctx.shadowColor = "#ff7700";
                ctx.shadowBlur = 35;
                ctx.beginPath();
                ctx.moveTo(0, 0); ctx.lineTo(dist, 0);
                ctx.stroke();

                // 2. Focused golden solar beam
                ctx.strokeStyle = "#ffd700";
                ctx.lineWidth = 14 + Math.sin(t * 30) * 3;
                ctx.shadowColor = "#ffd700";
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.moveTo(0, 0); ctx.lineTo(dist, 0);
                ctx.stroke();

                // 3. Core white-hot laser
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(0, 0); ctx.lineTo(dist, 0);
                ctx.stroke();

                // 4. Solar flare particle rings along beam
                for (let p = 0; p < 8; p++) {
                    const px = (dist * (p / 8) + (t * 220) % (dist / 8)) % dist;
                    const py = Math.sin(t * 15 + p * 2) * 8;
                    ctx.fillStyle = "#fff59d";
                    ctx.beginPath();
                    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                // 5. Impact solar flare explosion at beam end
                ctx.restore();
                ctx.save();
                ctx.translate(tx, ty);
                ctx.beginPath();
                ctx.arc(0, 0, 28 + Math.sin(t * 25) * 8, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 230, 0, 0.65)";
                ctx.shadowColor = "#ff4500";
                ctx.shadowBlur = 30;
                ctx.fill();
                ctx.restore();
            } else if (beam.type === "varuna") {
                // VARUNA CONTINUOUS TIDAL TORRENT & FOAMING OCEAN WAVES
                ctx.save();
                ctx.translate(ox, oy);
                ctx.rotate(ang);

                // Undulating flowing water streams
                const waveSteps = 30;
                const stepLen = dist / waveSteps;

                // Stream 1: Deep ocean blue surge
                ctx.strokeStyle = "rgba(2, 132, 199, 0.75)";
                ctx.lineWidth = 26 + Math.sin(t * 12) * 4;
                ctx.shadowColor = "#0284c7";
                ctx.shadowBlur = 24;
                ctx.beginPath();
                for (let w = 0; w <= waveSteps; w++) {
                    const wx = w * stepLen;
                    const wy = Math.sin(t * 18 - w * 0.45) * 12;
                    if (w === 0) ctx.moveTo(wx, wy);
                    else ctx.lineTo(wx, wy);
                }
                ctx.stroke();

                // Stream 2: Crystalline aquamarine vortex
                ctx.strokeStyle = "rgba(0, 240, 255, 0.85)";
                ctx.lineWidth = 14 + Math.cos(t * 14) * 3;
                ctx.shadowColor = "#00f0ff";
                ctx.shadowBlur = 18;
                ctx.beginPath();
                for (let w = 0; w <= waveSteps; w++) {
                    const wx = w * stepLen;
                    const wy = Math.cos(t * 18 - w * 0.45) * 8;
                    if (w === 0) ctx.moveTo(wx, wy);
                    else ctx.lineTo(wx, wy);
                }
                ctx.stroke();

                // Stream 3: Foaming white wave crests & water droplets
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 4;
                ctx.beginPath();
                for (let w = 0; w <= waveSteps; w++) {
                    const wx = w * stepLen;
                    const wy = Math.sin(t * 22 - w * 0.5) * 6;
                    if (w === 0) ctx.moveTo(wx, wy);
                    else ctx.lineTo(wx, wy);
                }
                ctx.stroke();

                // Water splash droplets
                for (let d = 0; d < 10; d++) {
                    const dx = (dist * (d / 10) + (t * 280) % (dist / 10)) % dist;
                    const dy = Math.sin(t * 16 + d) * 18;
                    ctx.fillStyle = "#e0f2fe";
                    ctx.beginPath();
                    ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Ocean splash vortex at impact
                ctx.restore();
                ctx.save();
                ctx.translate(tx, ty);
                ctx.beginPath();
                ctx.arc(0, 0, 26 + Math.sin(t * 20) * 6, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(70, 197, 255, 0.65)";
                ctx.shadowColor = "#00f0ff";
                ctx.shadowBlur = 25;
                ctx.fill();
                ctx.restore();
            }

            ctx.restore();
        },

        // Brahmastra Cosmic Cataclysm (Sky Darkness, Cosmic Lightning & Falling Meteors)
        drawCosmicCataclysm: function (ctx, cataclysm, ambient, W, H) {
            if (!cataclysm || cataclysm.timer <= 0) return;
            const t = ambient || 0;

            ctx.save();
            // 1. Cosmic Void Sky Darkness Overlay
            const voidAlpha = Math.min(0.7, cataclysm.timer * 0.35);
            ctx.fillStyle = `rgba(10, 0, 26, ${voidAlpha})`;
            ctx.fillRect(0, 0, W, H);

            // 2. Cosmic Lightning Bolts crashing from the heavens
            if (cataclysm.activeLightning && cataclysm.activeLightning.length > 0) {
                cataclysm.activeLightning.forEach(function (bolt) {
                    ctx.save();
                    ctx.strokeStyle = "#ffffff";
                    ctx.shadowColor = "#df73ff";
                    ctx.shadowBlur = 24;
                    ctx.lineWidth = 3.5;
                    ctx.beginPath();
                    bolt.segments.forEach(function (pt, idx) {
                        if (idx === 0) ctx.moveTo(pt.x, pt.y);
                        else ctx.lineTo(pt.x, pt.y);
                    });
                    ctx.stroke();
                    ctx.restore();
                });
            }

            // 3. Falling Cosmic Meteors
            if (cataclysm.meteors && cataclysm.meteors.length > 0) {
                cataclysm.meteors.forEach(function (m) {
                    ctx.save();
                    ctx.translate(m.x, m.y);
                    // Cosmic purple fireball
                    ctx.beginPath();
                    ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
                    ctx.fillStyle = "#ffffff";
                    ctx.shadowColor = "#df73ff";
                    ctx.shadowBlur = 28;
                    ctx.fill();

                    ctx.strokeStyle = "#df73ff";
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(0, 0, m.radius + 6, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                });
            }

            // 4. Cataclysmic Reality Shockwave
            if (cataclysm.shockwaveRadius > 0) {
                ctx.save();
                ctx.strokeStyle = "rgba(223, 115, 255, " + Math.max(0, 1 - cataclysm.shockwaveRadius / (W * 0.6)) + ")";
                ctx.lineWidth = 5;
                ctx.shadowColor = "#ffffff";
                ctx.shadowBlur = 30;
                ctx.beginPath();
                ctx.arc(cataclysm.originX, cataclysm.originY, cataclysm.shockwaveRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            ctx.restore();
        },

        // Nagastra Lingering Poison Cloud
        drawPoisonCloud: function (ctx, cloud, ambient) {
            if (!cloud || cloud.life <= 0) return;
            const t = ambient || 0;
            const alpha = Math.min(0.65, (cloud.life / cloud.maxLife) * 0.7);

            ctx.save();
            ctx.translate(cloud.x, cloud.y);

            // Expanding toxic mist circles
            const rad = cloud.radius * (1.2 - (cloud.life / cloud.maxLife) * 0.2);
            for (let c = 0; c < 4; c++) {
                const cx = Math.sin(t * 3 + c * 1.8) * (rad * 0.35);
                const cy = Math.cos(t * 3 + c * 1.8) * (rad * 0.25);
                const r = rad * (0.6 + c * 0.15);

                const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, r);
                grad.addColorStop(0, `rgba(57, 255, 20, ${alpha})`);
                grad.addColorStop(0.6, `rgba(16, 185, 129, ${alpha * 0.6})`);
                grad.addColorStop(1, "rgba(5, 150, 105, 0)");

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Rising toxic acid bubbles
            for (let b = 0; b < 5; b++) {
                const bx = Math.sin(t * 4 + b * 2) * (rad * 0.5);
                const by = -((t * 35 + b * 20) % (rad * 0.9));
                ctx.fillStyle = "#a7f3d0";
                ctx.beginPath();
                ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    };

    global.GameWeapons = GameWeapons;
})(window);
