// Canvas Graphics & World Scene Renderer
(function (global) {
    "use strict";

    const GameRenderer = {
        drawBackground: function (ctx, w, h, ambient) {
            // Cosmic Deep Indian Palace Sky Gradient
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, "#050f1b");
            sky.addColorStop(0.55, "#0a1d32");
            sky.addColorStop(1, "#0f2b48");
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);

            // Shimmering Golden Celestial Stars
            ctx.save();
            for (let i = 0; i < 48; i++) {
                const sx = (Math.sin(i * 99.7) * 43758.5 % 1 + 1) * w * 0.5;
                const sy = (Math.cos(i * 43.1) * 23421.3 % 1 + 1) * h * 0.28;
                const alpha = 0.25 + Math.sin(ambient * 1.5 + i) * 0.2;
                ctx.fillStyle = `rgba(255, 235, 160, ${alpha})`;
                ctx.fillRect(sx, sy, 2, 2);
            }
            ctx.restore();

            // Ground Silhouette
            const g = GameConfig.ground(w, h);
            ctx.fillStyle = "#040b14";
            ctx.fillRect(0, g, w, h - g);

            // Ornate Palace Temple Rim / Courtyard Flagstones
            ctx.strokeStyle = "rgba(245, 197, 66, 0.4)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, g);
            ctx.lineTo(w, g);
            ctx.stroke();

            for (let x = 0; x < w; x += 60) {
                ctx.strokeStyle = "rgba(245, 197, 66, 0.12)";
                ctx.beginPath();
                ctx.moveTo(x, g);
                ctx.lineTo(x + 20, h);
                ctx.stroke();
            }
        },

        drawWindStreaks: function (ctx, w, h, wind, ambient) {
            if (wind <= 0) return;
            ctx.save();
            ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 7; i++) {
                const wx = ((ambient * 140 * wind + i * 160) % (w + 100)) - 50;
                const wy = h * 0.2 + (i * 45) % (h * 0.5);
                ctx.beginPath();
                ctx.moveTo(wx, wy);
                ctx.lineTo(wx + 40 * wind, wy);
                ctx.stroke();
            }
            ctx.restore();
        },

        drawStandardTarget: function (ctx, tpos, scale, groundY) {
            const r = tpos.r;

            // Wooden Target Stand
            ctx.strokeStyle = "#5a3a24";
            ctx.lineWidth = 5 * scale;
            ctx.beginPath();
            ctx.moveTo(tpos.x, tpos.y + r);
            ctx.lineTo(tpos.x - r * 0.6, groundY);
            ctx.moveTo(tpos.x, tpos.y + r);
            ctx.lineTo(tpos.x + r * 0.6, groundY);
            ctx.stroke();

            // Concentric Rings: White, Black, Blue, Red, Yellow (Bullseye)
            const ringColors = ["#f8f9fa", "#212529", "#1971c2", "#e03131", "#ffd43b"];
            [1.0, 0.8, 0.6, 0.4, 0.2].forEach(function (frac, idx) {
                ctx.beginPath();
                ctx.arc(tpos.x, tpos.y, r * frac, 0, Math.PI * 2);
                ctx.fillStyle = ringColors[idx];
                ctx.fill();
                ctx.strokeStyle = "rgba(0,0,0,0.3)";
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Bullseye Center Dot
            ctx.beginPath();
            ctx.arc(tpos.x, tpos.y, r * 0.08, 0, Math.PI * 2);
            ctx.fillStyle = "#d9480f";
            ctx.fill();
        },

        drawRunningBeast: function (ctx, tpos, scale, leaping) {
            ctx.save();
            ctx.translate(tpos.x, tpos.y);
            ctx.scale(scale, scale);

            // Beast Body (Wild Boar / Stag)
            ctx.fillStyle = leaping ? "#e59b20" : "#4e342e";
            ctx.shadowColor = leaping ? "#ffd700" : "#000000";
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.ellipse(0, 0, 24, 14, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.beginPath();
            ctx.moveTo(18, -4);
            ctx.lineTo(32, 2);
            ctx.lineTo(18, 8);
            ctx.closePath();
            ctx.fill();

            // Legs running animation
            ctx.strokeStyle = "#3e2723";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(-12, 10);
            ctx.lineTo(-18, 22);
            ctx.moveTo(12, 10);
            ctx.lineTo(18, 22);
            ctx.stroke();

            // Eye
            ctx.fillStyle = "#ff1744";
            ctx.beginPath();
            ctx.arc(24, 0, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        drawMatsyaVedha: function (ctx, w, h, tpos, scale, groundY, canopyOpen, revealed, ambient) {
            // 1. Vaulted Royal Ceiling Canopy ABOVE (CONCEALS FISH FROM DIRECT SIGHT)
            const canopyY = h * 0.32;
            ctx.save();

            // Rafters
            ctx.fillStyle = "#11263c";
            ctx.fillRect(w * 0.45, 0, w * 0.55, canopyY);

            // Royal Crimson Silk Drapes covering the rotating fish
            const drapeOpen = canopyOpen * (w * 0.22);
            ctx.fillStyle = "#3e1220";
            ctx.fillRect(w * 0.45, 0, w * 0.3 - drapeOpen, canopyY * 0.95);
            ctx.fillRect(w * 0.75 + drapeOpen, 0, w * 0.25, canopyY * 0.95);

            // Golden silk tassels trim
            ctx.strokeStyle = "#f5c542";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(w * 0.45, canopyY * 0.95);
            ctx.lineTo(w, canopyY * 0.95);
            ctx.stroke();

            // Mystery label or revealed fish
            if (!revealed) {
                ctx.font = "800 13px 'Cinzel', Georgia, serif";
                ctx.textAlign = "center";
                ctx.fillStyle = "rgba(255, 224, 130, 0.65)";
                ctx.fillText("✦ REVOLVING FISH (CONCEALED ABOVE) ✦", w * 0.74, canopyY * 0.5);
                ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
                ctx.fillStyle = "rgba(163, 196, 219, 0.7)";
                ctx.fillText("Observe oil reflection below to aim upward", w * 0.74, canopyY * 0.5 + 20);
            } else {
                // REVEALED OVERHEAD REVOLVING GOLDEN FISH!
                ctx.save();
                ctx.translate(tpos.x, tpos.y);
                ctx.rotate(tpos.angle);
                GameRenderer.drawGoldenFishSprite(ctx, 0, 0, tpos.r * 2.2);
                ctx.restore();
            }
            ctx.restore();

            // 2. Bronze Oil Cauldron (Kunda) on the Ground
            const bx = w * (h > w ? 0.72 : 0.76);
            const by = groundY - 25 * scale;
            const rx = Math.min(w * 0.2, h * 0.3);
            const ry = Math.min(h * 0.08, w * 0.08);

            // Bronze cauldron rim
            ctx.beginPath();
            ctx.ellipse(bx, by + ry * 0.4, rx * 1.05, ry * 1.15, 0, 0, Math.PI * 2);
            ctx.fillStyle = "#5c391b";
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(bx, by, rx + 4, ry + 4, 0, 0, Math.PI * 2);
            ctx.fillStyle = "#ffd573";
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = "#103b4d";
            ctx.fill();

            // Shimmering Oil Surface & Reflection of the Fish
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(bx, by, rx - 3, ry - 3, 0, 0, Math.PI * 2);
            ctx.clip();

            const oilGrad = ctx.createRadialGradient(bx, by, 5, bx, by, rx);
            oilGrad.addColorStop(0, "#195669");
            oilGrad.addColorStop(0.7, "#0d313d");
            oilGrad.addColorStop(1, "#05181f");
            ctx.fillStyle = oilGrad;
            ctx.fillRect(bx - rx, by - ry, rx * 2, ry * 2);

            // Animated waves
            for (let r = 0; r < 3; r++) {
                const waveR = ((ambient * 25 + r * 30) % (rx * 0.9));
                ctx.beginPath();
                ctx.ellipse(bx, by, waveR, waveR * 0.4, 0, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(91, 243, 192, 0.22)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // REFLECTION OF THE REVOLVING GOLDEN FISH!
            const refAngle = tpos.angle;
            const refX = bx + Math.cos(refAngle) * (rx * 0.55);
            const refY = by + Math.sin(refAngle) * (ry * 0.55);

            ctx.save();
            ctx.translate(refX, refY);
            ctx.scale(0.7, 0.45);
            ctx.rotate(-refAngle);
            ctx.globalAlpha = 0.85;
            GameRenderer.drawGoldenFishSprite(ctx, 0, 0, tpos.r * 1.8);
            ctx.restore();

            ctx.restore();

            ctx.font = "900 12px 'Cinzel', Georgia, serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#f5c542";
            ctx.fillText("OIL REFLECTION POOL", bx, by + ry + 22);
        },

        drawGoldenFishSprite: function (ctx, x, y, length) {
            ctx.save();
            ctx.translate(x, y);

            // Body
            ctx.beginPath();
            ctx.moveTo(length * 0.45, 0);
            ctx.bezierCurveTo(length * 0.2, -length * 0.32, -length * 0.25, -length * 0.25, -length * 0.45, 0);
            ctx.bezierCurveTo(-length * 0.25, length * 0.25, length * 0.2, length * 0.32, length * 0.45, 0);
            ctx.fillStyle = "#f5c542";
            ctx.shadowColor = "#f5c542";
            ctx.shadowBlur = 12;
            ctx.fill();

            // Tail
            ctx.beginPath();
            ctx.moveTo(-length * 0.42, 0);
            ctx.lineTo(-length * 0.65, -length * 0.3);
            ctx.lineTo(-length * 0.55, 0);
            ctx.lineTo(-length * 0.65, length * 0.3);
            ctx.closePath();
            ctx.fillStyle = "#e5a11c";
            ctx.fill();

            // Eye
            ctx.beginPath();
            ctx.arc(length * 0.28, -length * 0.06, length * 0.08, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(length * 0.28, -length * 0.06, length * 0.04, 0, Math.PI * 2);
            ctx.fillStyle = "#0c2838";
            ctx.fill();

            ctx.restore();
        },

        drawWandDuelArena: function (ctx, bpos, boss, shieldAngle, enemyBolts) {
            ctx.save();
            ctx.translate(bpos.x, bpos.y);

            // Rotating Electric Shield
            ctx.save();
            ctx.rotate(shieldAngle);
            ctx.strokeStyle = boss.ward === "fire" ? "#ff5e28" : "#00f0ff";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, bpos.r + 18, 0, Math.PI * 1.4);
            ctx.stroke();

            for (let n = 0; n < 3; n++) {
                const ang = n * (Math.PI * 2 / 3);
                ctx.beginPath();
                ctx.arc(Math.cos(ang) * (bpos.r + 18), Math.sin(ang) * (bpos.r + 18), 5, 0, Math.PI * 2);
                ctx.fillStyle = boss.ward === "fire" ? "#ffab00" : "#ffffff";
                ctx.fill();
            }
            ctx.restore();

            // Boss Body
            ctx.fillStyle = "#8a243d";
            ctx.beginPath();
            ctx.arc(0, -20, 14, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#1e3d59";
            ctx.fillRect(-12, -6, 24, 38);

            // Electric Wand in hand
            ctx.strokeStyle = boss.ward === "fire" ? "#ff5e28" : "#00f0ff";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(12, 10);
            ctx.lineTo(26, -18);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(26, -18, 7, 0, Math.PI * 2);
            ctx.fillStyle = boss.ward === "fire" ? "#ffab00" : "#00f0ff";
            ctx.shadowColor = boss.ward === "fire" ? "#ffab00" : "#00f0ff";
            ctx.shadowBlur = 12;
            ctx.fill();

            ctx.restore();

            // Enemy Wand Bolts
            enemyBolts.forEach(function (bolt) {
                ctx.save();
                ctx.fillStyle = bolt.color;
                ctx.shadowColor = bolt.color;
                ctx.shadowBlur = 14;
                ctx.beginPath();
                ctx.arc(bolt.x, bolt.y, 8, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(bolt.x, bolt.y);
                ctx.lineTo(bolt.x - bolt.vx * 0.04, bolt.y - bolt.vy * 0.04);
                ctx.stroke();
                ctx.restore();
            });
        },

        drawTrajectory: function (ctx, startX, startY, angle, pull, wep, wind, groundY, w, h) {
            const speed = (Math.sqrt(Math.max(180, h * 0.9) * Math.max(w * 0.92, h * 0.45)) * 1.25)
                * (0.35 + pull * 0.85) * wep.speedMult;

            const grav = Math.max(180, h * 0.9) * wep.gravityMult;
            const windForce = wind * (1 - wep.windPierce) * 38;

            let cx = startX;
            let cy = startY;
            let cvx = Math.cos(angle) * speed;
            let cvy = -Math.sin(angle) * speed;
            const step = 0.035;

            ctx.save();
            for (let i = 0; i < 24; i++) {
                cvx += windForce * step;
                cvy += grav * step;
                cx += cvx * step;
                cy += cvy * step;

                if (cy > groundY) break;

                ctx.beginPath();
                ctx.arc(cx, cy, 3 * (1 - i / 26), 0, Math.PI * 2);
                ctx.fillStyle = wep.color;
                ctx.shadowColor = wep.color;
                ctx.shadowBlur = 6;
                ctx.fill();
            }
            ctx.restore();
        },

        drawStuckArrow: function (ctx, x, y, angle, color) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.strokeStyle = color || "#ffe082";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();
            ctx.restore();
        }
    };

    global.GameRenderer = GameRenderer;
})(window);
