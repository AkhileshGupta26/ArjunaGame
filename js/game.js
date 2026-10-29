// Main Game Controller & Physics Engine (Loose Coupling)
(function (global) {
    "use strict";

    const canvas = document.getElementById("world");
    const ctx = canvas.getContext("2d");
    const menu = document.getElementById("menu");
    const hud = document.getElementById("hud");

    const ui = {
        back: document.getElementById("hud-back"),
        title: document.getElementById("hud-level-title"),
        objective: document.getElementById("hud-objective"),
        windPill: document.getElementById("hud-wind-pill"),
        windArrow: document.getElementById("hud-wind-arrow"),
        windVal: document.getElementById("hud-wind-val"),
        coinVal: document.getElementById("hud-coin-val"),
        wepBtn: document.getElementById("hud-weapon-btn"),
        wepIcon: document.getElementById("hud-wep-icon"),
        wepName: document.getElementById("hud-wep-name"),
        shopBtn: document.getElementById("hud-shop-btn"),
        soundBtn: document.getElementById("hud-sound-btn"),
        toast: document.getElementById("toast"),
        status: document.getElementById("hud-status"),
        hint: document.getElementById("hud-hint"),
        healthContainer: document.getElementById("health-container"),
        foeName: document.getElementById("foe-name"),
        foeHpVal: document.getElementById("foe-hp-val"),
        foeBarFill: document.getElementById("foe-bar-fill")
    };

    let W = window.innerWidth;
    let H = window.innerHeight;
    let state = "home";
    let chapterIndex = 0;
    let levelIndex = 0;
    let run = null;
    let ambient = 0;
    let lastTime = 0;
    let pointer = null;
    let slowMotionTimer = 0;
    let screenFlash = 0;
    let shakeTime = 0;
    let shakeIntensity = 0;
    let particles = [];
    let floatingTexts = [];
    let electricArcs = [];
    let streak = 0;
    let toastTimer = 0;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }
    window.addEventListener("resize", resize);

    function currentLevel() {
        return GameLevels.getLevel(levelIndex);
    }

    function notify(title, subtitle = "", duration = 1.6) {
        if (!ui.toast) return;
        ui.toast.innerHTML = "<strong>" + title + "</strong>" + (subtitle ? "<small>" + subtitle + "</small>" : "");
        ui.toast.style.opacity = "1";
        ui.toast.style.transform = "translateX(-50%) translateY(0)";
        toastTimer = duration;
    }

    function addFloatingText(text, x, y, color = "#ffd77a") {
        floatingTexts.push({
            text: text,
            x: x,
            y: y,
            color: color,
            vy: -35,
            life: 1.4,
            maxLife: 1.4
        });
    }

    function triggerFlash(intensity = 0.3) {
        screenFlash = intensity;
    }

    function addShake(duration = 0.18, intensity = 8) {
        shakeTime = duration;
        shakeIntensity = intensity;
    }

    function spawnBurst(x, y, color, count = 20, speed = 1) {
        const sc = GameConfig.scale(W, H);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (Math.random() * 120 + 30) * speed * sc;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color: color,
                size: Math.random() * 4 + 2,
                life: 1.0,
                maxLife: 1.0
            });
        }
    }

    function spawnElectricArcs(x, y, count = 5) {
        const sc = GameConfig.scale(W, H);
        for (let i = 0; i < count; i++) {
            electricArcs.push({
                x: x,
                y: y,
                tx: x + (Math.random() - 0.5) * 140 * sc,
                ty: y + (Math.random() - 0.5) * 140 * sc,
                life: 0.25,
                color: "#00f0ff"
            });
        }
    }

    function updateCoinUI() {
        const progress = GameConfig.loadProgress();
        if (ui.coinVal) ui.coinVal.textContent = progress.coins.toLocaleString();
        const wep = GameWeapons.getById(progress.equippedWeapon);
        if (ui.wepName) ui.wepName.textContent = wep.name.split(" ")[0];
        if (ui.wepIcon) ui.wepIcon.textContent = wep.icon;
    }

    // Target Calculation
    function getTargetPos(t) {
        const item = currentLevel();
        const sc = GameConfig.scale(W, H);
        const g = GameConfig.ground(W, H);

        if (item.mode === "wand_duel") {
            return {
                x: W * (run ? run.bossX : 0.82),
                y: H * (run ? run.bossY : 0.52),
                r: 32 * sc
            };
        }

        if (item.mode === "fish") {
            const centerX = W * (H > W ? 0.72 : 0.76);
            const centerY = H * 0.22;
            const radius = Math.min(W * 0.16, H * 0.22);
            const speed = (item.moving ? 1.6 : 1.0) * (item.small ? 1.8 : 1.0);
            const angle = t * speed;

            return {
                centerX: centerX,
                centerY: centerY,
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * (radius * 0.35),
                r: item.small ? 16 : 24,
                eyeX: centerX + Math.cos(angle) * radius - 14,
                eyeY: centerY + Math.sin(angle) * (radius * 0.35) - 3,
                angle: angle,
                radius: radius
            };
        }

        if (item.mode === "hunt") {
            const trackSpeed = (item.beastSpeed || 1) * W * 0.28;
            const bx = (W * 0.35 + (t * trackSpeed) % (W * 0.65));
            const leap = item.leaping ? Math.abs(Math.sin(t * 4)) * 65 * sc : 0;
            return {
                x: bx,
                y: g - 25 * sc - leap,
                r: 26 * sc
            };
        }

        // Standard Archery Target
        const fraction = item.longRange ? 0.88 : [0.72, 0.82, 0.88][run ? run.hits % 3 : 0];
        const targetY = g - 65 * sc + (item.moving ? Math.sin(t * 1.8) * 45 * sc : 0);

        return {
            x: W * fraction,
            y: targetY,
            r: (item.small ? 22 : 32) * sc
        };
    }

    // Resolve Target Hit or Miss
    function resolveHit(isHit, scoreVal, hitX, hitY, hitReason = "") {
        const progress = GameConfig.loadProgress();
        const wep = run.arrow ? run.arrow.wep : GameWeapons.getById(progress.equippedWeapon);
        const char = GameCharacters.getById(progress.selectedCharacter);

        if (isHit) {
            run.hits++;
            streak++;
            triggerFlash(0.25);
            addShake(0.18, 9);

            spawnBurst(hitX, hitY, wep.color, 45, 1.4);
            spawnBurst(hitX, hitY, "#fff5a5", 25, 0.9);

            if (wep.type === "chakra") {
                GameAudio.play("chakra");
            } else if (wep.id === "nagastra") {
                GameAudio.play("nagastra");
                spawnBurst(hitX, hitY, "#39ff14", 30, 1.5);
            } else if (wep.id === "vajra") {
                GameAudio.play("zap");
                spawnElectricArcs(hitX, hitY, 6);
            } else if (wep.id === "agni") {
                GameAudio.play("fire");
                spawnBurst(hitX, hitY, "#ff3d00", 35, 1.6);
            } else {
                GameAudio.play("bullseye", streak);
            }

            let coinsEarned = 25;
            let banner = "+10 BULLSEYE! 🎯";
            if (currentLevel().mode === "fish") {
                banner = "✦ MATSYA VEDHA! ✦";
                coinsEarned = 50;
                GameAudio.play("shankha");
            } else if (scoreVal === 10) {
                banner = "🎯 PERFECT BULLSEYE!";
                coinsEarned = 35;
            } else if (scoreVal >= 8) {
                banner = "EXCELLENT! 8x";
                coinsEarned = 20;
            }

            coinsEarned = Math.round(coinsEarned * char.coinBonus);
            progress.coins += coinsEarned;
            GameConfig.saveProgress(progress);
            updateCoinUI();

            addFloatingText(banner, hitX, hitY - 45, wep.color);
            addFloatingText(`+${coinsEarned} 🪙`, hitX, hitY - 22, "#ffd77a");

            notify("Magnificent Shot!", `${run.hits} / ${currentLevel().goal} Targets`);

            if (run.hits >= currentLevel().goal) {
                slowMotionTimer = 1.4;
                run.wait = 1.6;
            } else {
                run.wait = 1.2;
            }
        } else {
            streak = 0;
            spawnBurst(hitX, hitY, "#a8c0d4", 14, 0.5);
            notify("Missed", hitReason || "Calm your breath and lead your target.", 1.4);
            run.wait = 1.1;
        }

        if (run.arrow) {
            run.stuck.push({
                x: hitX,
                y: hitY,
                angle: Math.atan2(run.arrow.vy, run.arrow.vx),
                life: 1.5,
                color: wep.color
            });
        }

        run.arrow = null;
    }

    // Launch Arrow
    function releaseArrow() {
        if (!run || run.arrow || run.used >= currentLevel().arrows) return;
        const progress = GameConfig.loadProgress();
        const wep = GameWeapons.getById(progress.equippedWeapon);
        const char = GameCharacters.getById(progress.selectedCharacter);
        const p = GameConfig.origin(W, H);

        const speed = (Math.sqrt(Math.max(180, H * 0.9) * Math.max(W * 0.92, H * 0.45)) * 1.25)
            * (0.35 + run.pull * 0.85) * wep.speedMult * char.speedBonus;

        run.arrow = {
            x: p.x,
            y: p.y,
            vx: Math.cos(run.angle) * speed,
            vy: -Math.sin(run.angle) * speed,
            pull: run.pull,
            life: 0,
            trail: [],
            wep: wep
        };

        run.used++;
        run.drawing = false;
        run.pull = 0;
        run.revealed = false;

        GameAudio.play("release");
        if (wep.type === "chakra") GameAudio.play("chakra");
        else if (wep.id === "nagastra") GameAudio.play("nagastra");
        else if (wep.id === "vajra") GameAudio.play("zap");
        else if (wep.id === "agni") GameAudio.play("fire");
        else GameAudio.play("whoosh");

        addShake(0.08, 3);
    }

    // Wand Combat Simulation
    function updateWandCombat(dt) {
        const lvl = currentLevel();
        const b = GameLevels.getBoss(lvl.boss);
        const sc = GameConfig.scale(W, H);
        run.shieldAngle += dt * 2.2;
        run.bossClock -= dt;

        // Boss casts
        if (run.bossClock <= 0 && run.bossHP > 0) {
            run.bossClock = 1.6 + Math.random() * 0.8;
            GameAudio.play("zap");
            const bpos = getTargetPos(run.time);
            const ppos = GameConfig.origin(W, H);
            const ang = Math.atan2(ppos.y - bpos.y, ppos.x - bpos.x);

            run.enemyBolts.push({
                x: bpos.x - 30,
                y: bpos.y,
                vx: Math.cos(ang) * (260 * sc),
                vy: Math.sin(ang) * (260 * sc),
                life: 4.0,
                color: b.ward === "fire" ? "#ff5e28" : "#00f0ff"
            });
        }

        const ppos = GameConfig.origin(W, H);
        for (let i = run.enemyBolts.length - 1; i >= 0; i--) {
            const bolt = run.enemyBolts[i];
            bolt.x += bolt.vx * dt;
            bolt.y += bolt.vy * dt;
            bolt.life -= dt;

            // Arrow to bolt clash / parry
            if (run.arrow) {
                const d = Math.hypot(run.arrow.x - bolt.x, run.arrow.y - bolt.y);
                if (d < 30 * sc) {
                    spawnBurst(bolt.x, bolt.y, "#ffffff", 25, 1.5);
                    spawnElectricArcs(bolt.x, bolt.y, 6);
                    GameAudio.play("zap");
                    addFloatingText("PARRIED! ⚡", bolt.x, bolt.y - 20, "#00f0ff");
                    run.enemyBolts.splice(i, 1);
                    continue;
                }
            }

            // Player hit
            const dPlayer = Math.hypot(bolt.x - ppos.x, bolt.y - ppos.y);
            if (dPlayer < 28 * sc) {
                if (run.sunShield > 0) {
                    run.sunShield = 0;
                    addFloatingText("SURYA SHIELD BROKEN! ☀️", ppos.x, ppos.y - 40, "#ffd700");
                    triggerFlash(0.2);
                    GameAudio.play("shankha");
                } else {
                    run.playerHP = Math.max(0, run.playerHP - 15);
                    triggerFlash(0.3);
                    addShake(0.15, 7);
                    GameAudio.play("pull");
                    notify("Struck!", "Dodge or shoot incoming bolts out of the air!");
                    if (run.playerHP <= 0) {
                        Game.levelCompleted(false);
                    }
                }
                run.enemyBolts.splice(i, 1);
                continue;
            }

            if (bolt.life <= 0 || bolt.x < -20) {
                run.enemyBolts.splice(i, 1);
            }
        }

        // Arrow hit boss
        if (run.arrow) {
            const bpos = getTargetPos(run.time);
            const d = Math.hypot(run.arrow.x - bpos.x, run.arrow.y - bpos.y);
            if (d < bpos.r + 14) {
                const progress = GameConfig.loadProgress();
                const char = GameCharacters.getById(progress.selectedCharacter);
                const dmg = Math.round(45 * char.damageBonus);
                run.bossHP = Math.max(0, run.bossHP - dmg);
                ui.foeHpVal.textContent = `${run.bossHP} / ${run.bossMaxHP}`;
                ui.foeBarFill.style.width = `${(run.bossHP / run.bossMaxHP) * 100}%`;

                resolveHit(true, 10, run.arrow.x, run.arrow.y);
                if (run.bossHP <= 0) {
                    Game.levelCompleted(true);
                }
            }
        }
    }

    // Main Game Public API
    const Game = {
        isRunning: function () {
            return state === "play" && run !== null;
        },

        home: function () {
            state = "home";
            run = null;
            hud.classList.add("hidden");
            menu.classList.remove("hidden");
            updateCoinUI();

            const chapters = GameLevels.getChapters();
            const progress = GameConfig.loadProgress();

            const cardsHtml = chapters.map(function (chapter, idx) {
                let stars = 0;
                chapter.levels.forEach(function (lvl, lIdx) {
                    const gIdx = GameLevels.getAllLevels().findIndex(x => x.chapter === idx && x.chapterLevelIndex === lIdx);
                    stars += (progress.stars && progress.stars[gIdx]) || 0;
                });

                return `
                    <div class="chapter-card" style="--tint:${chapter.tint};--accent:${chapter.color};" onclick="Game.selectChapter(${idx})">
                        <span class="chapter-icon">${chapter.icon}</span>
                        <div class="chapter-content">
                            <span class="eyebrow">Chapter ${chapter.numeral} · ${stars} ★</span>
                            <strong>${chapter.name}</strong>
                            <div class="dots-row">
                                ${chapter.levels.map((lvl, lIdx) => {
                                    const gIdx = GameLevels.getAllLevels().findIndex(x => x.chapter === idx && x.chapterLevelIndex === lIdx);
                                    return `<i class="dot-circle ${progress.completed.includes(gIdx) ? 'done' : ''}"></i>`;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            let totalStars = 0;
            Object.values(progress.stars || {}).forEach(s => { totalStars += Number(s) || 0; });

            const activeChar = GameCharacters.getById(progress.selectedCharacter);

            menu.innerHTML = `
                <div class="page">
                    <header class="header-section">
                        <div>
                            <div class="eyebrow">Classical Epic Mythology</div>
                            <h1>ARJUNA</h1>
                            <p class="subtext">Wield celestial Dhanush, Sudarshana Chakra &amp; Divine Astras.</p>
                        </div>
                        <div style="display:flex;gap:12px;align-items:center;">
                            <div class="shop-treasury-pill">🪙 ${progress.coins.toLocaleString()}</div>
                            <button type="button" class="btn-secondary" onclick="GameShop.open('characters')">👑 Hero: <span style="color:var(--gold);">${activeChar.name.split(' ')[0]}</span></button>
                            <button type="button" class="btn-primary" onclick="GameShop.open('weapons')">🛒 Armory Shop</button>
                        </div>
                    </header>
                    <div class="cards-grid">${cardsHtml}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 4px;font-size:14px;color:var(--muted);">
                        <span>Total Stars: <strong style="color:var(--gold);">${totalStars} ★</strong></span>
                        <span>Completed: <strong style="color:var(--mint);">${progress.completed.length} / ${GameLevels.getAllLevels().length} Trials</strong></span>
                    </div>
                </div>
            `;
        },

        selectChapter: function (idx) {
            chapterIndex = idx;
            Game.showLevelSelect();
        },

        showLevelSelect: function () {
            state = "levels";
            run = null;
            hud.classList.add("hidden");
            menu.classList.remove("hidden");
            const chapter = GameLevels.getChapter(chapterIndex);
            const progress = GameConfig.loadProgress();

            const levelsHtml = chapter.levels.map(function (lvl, lIdx) {
                const gIdx = GameLevels.getAllLevels().findIndex(x => x.chapter === chapterIndex && x.chapterLevelIndex === lIdx);
                const starsCount = (progress.stars && progress.stars[gIdx]) || 0;
                const starsStr = [1, 2, 3].map(s => s <= starsCount ? '★' : '☆').join(' ');
                const isDone = progress.completed.includes(gIdx);

                let modeLabel = lvl.mode.toUpperCase();
                if (lvl.mode === "fish") modeLabel = "MATSYA VEDHA";
                if (lvl.mode === "wand_duel") modeLabel = "WAND DUEL";
                if (lvl.mode === "hunt") modeLabel = "BEAST HUNT";

                return `
                    <div class="level-card" onclick="Game.showLevelBrief(${gIdx})">
                        <span class="level-num">${String(lIdx + 1).padStart(2, '0')}</span>
                        <div class="level-info" style="flex:1;">
                            <span class="level-badge-mode">${modeLabel}</span>
                            <strong>${lvl.name}</strong>
                            <span class="level-stars">${starsStr}</span>
                        </div>
                        <span style="font-size:20px;color:${isDone ? 'var(--mint)' : 'var(--gold)'};font-weight:900;">${isDone ? '✓' : '›'}</span>
                    </div>
                `;
            }).join('');

            menu.innerHTML = `
                <div class="page">
                    <header class="header-section">
                        <div>
                            <div class="eyebrow">${chapter.place}</div>
                            <h2>${chapter.name}</h2>
                        </div>
                        <div style="display:flex;gap:12px;">
                            <button type="button" class="btn-secondary" onclick="Game.home()">‹ Back to Chapters</button>
                            <button type="button" class="btn-primary" onclick="GameShop.open('weapons')">🛒 Shop</button>
                        </div>
                    </header>
                    <div class="levels-grid">${levelsHtml}</div>
                </div>
            `;
        },

        showLevelBrief: function (gIdx) {
            levelIndex = gIdx;
            const item = currentLevel();

            let modeBadge = "🎯 Archery Target Practice";
            if (item.mode === "fish") modeBadge = "✧ Matsya Vedha — Oil Reflection";
            if (item.mode === "wand_duel") modeBadge = "⚡ Shastra & Electric Wand Combat";
            if (item.mode === "hunt") modeBadge = "🐗 Dynamic Beast Hunt";

            let details = item.desc || "Draw with steady breath and strike the target.";
            let goalStr = item.mode === "wand_duel"
                ? "Defeat " + GameLevels.getBoss(item.boss).name
                : `Goal: ${item.goal} Targets · ${item.arrows} Arrows · Wind: ${item.wind} m/s`;

            menu.innerHTML = `
                <div class="page panel-center">
                    <div class="eyebrow">${GameLevels.getChapter(item.chapter).name} · Trial ${item.chapterLevelIndex + 1}</div>
                    <h2>${item.name}</h2>
                    <div style="margin:14px 0;"><span class="level-badge-mode" style="font-size:13px;padding:6px 16px;">${modeBadge}</span></div>
                    <p class="subtext" style="font-size:16px;max-width:540px;margin:12px auto 20px;">${details}</p>
                    <div style="display:inline-block;padding:10px 22px;border:1px solid var(--gold);border-radius:24px;background:rgba(245,197,66,0.12);color:var(--gold-bright);font-weight:800;font-size:15px;">
                        ${goalStr}
                    </div>
                    <div class="actions-row">
                        <button type="button" class="btn-secondary" onclick="Game.showLevelSelect()">‹ Back</button>
                        <button type="button" class="btn-primary" onclick="Game.launchLevel()">Begin Trial →</button>
                    </div>
                </div>
            `;
        },

        launchLevel: function () {
            const item = currentLevel();
            state = "play";
            menu.classList.add("hidden");
            hud.classList.remove("hidden");
            streak = 0;

            const progress = GameConfig.loadProgress();
            const char = GameCharacters.getById(progress.selectedCharacter);
            updateCoinUI();

            ui.title.textContent = item.name;
            ui.objective.textContent = item.mode === "wand_duel"
                ? "Defeat " + GameLevels.getBoss(item.boss).name
                : `Targets: 0 / ${item.goal} · Arrows: ${item.arrows}`;

            ui.windVal.textContent = (item.wind || 0).toFixed(1) + " m/s";
            ui.windArrow.style.transform = `rotate(${item.wind > 0 ? 0 : 180}deg)`;

            if (item.mode === "wand_duel") {
                ui.healthContainer.classList.remove("hidden");
                const b = GameLevels.getBoss(item.boss);
                ui.foeName.textContent = b.name;
                ui.foeHpVal.textContent = `${b.hp} / ${b.hp}`;
                ui.foeBarFill.style.width = "100%";
            } else {
                ui.healthContainer.classList.add("hidden");
            }

            run = {
                time: 0,
                hits: 0,
                used: 0,
                drawing: false,
                pull: 0,
                angle: item.mode === "fish" ? 1.15 : 0.65,
                arrow: null,
                stuck: [],
                wait: 0,
                wind: item.wind || 0,
                canopyOpen: 0,
                revealed: false,
                sunShield: char.id === "karna" ? 1 : 0,
                // Wand combat state
                playerHP: 100,
                bossHP: item.mode === "wand_duel" ? GameLevels.getBoss(item.boss).hp : 100,
                bossMaxHP: item.mode === "wand_duel" ? GameLevels.getBoss(item.boss).hp : 100,
                bossX: 0.82,
                bossY: 0.52,
                bossClock: 1.8,
                enemyBolts: [],
                shieldAngle: 0
            };

            notify("Trial Commenced", item.mode === "fish" ? "Look into the oil pool to aim upwards!" : "Steady your breath and draw the weapon.");
            GameAudio.play("shankha");
        },

        resume: function () {
            state = "play";
            menu.classList.add("hidden");
            hud.classList.remove("hidden");
        },

        levelCompleted: function (isVictory) {
            state = "result";
            hud.classList.add("hidden");
            menu.classList.remove("hidden");

            const item = currentLevel();
            let starsEarned = 0;
            let coinsEarned = 0;

            if (isVictory) {
                starsEarned = 3;
                coinsEarned = 150 + (item.chapter + 1) * 25;
                const progress = GameConfig.loadProgress();
                if (!progress.completed.includes(levelIndex)) {
                    progress.completed.push(levelIndex);
                }
                const currentStars = (progress.stars && progress.stars[levelIndex]) || 0;
                progress.stars[levelIndex] = Math.max(currentStars, starsEarned);
                progress.coins += coinsEarned;
                GameConfig.saveProgress(progress);
                GameAudio.play("shankha");
            } else {
                GameAudio.play("pull");
            }

            const starsHtml = [1, 2, 3].map(s => {
                return `<span style="font-size:38px;color:${s <= starsEarned ? 'var(--gold)' : 'rgba(255,255,255,0.2)'};margin:0 4px;text-shadow:0 0 16px var(--gold-glow);">★</span>`;
            }).join('');

            menu.innerHTML = `
                <div class="page panel-center">
                    <div class="eyebrow">${isVictory ? 'Triumph &amp; Glory' : 'Breath &amp; Concentration'}</div>
                    <h2>${isVictory ? 'VICTORY ACHIEVED! ✧' : 'TRIAL INCOMPLETE'}</h2>
                    <div style="margin:16px 0;">${starsHtml}</div>
                    <p class="subtext" style="font-size:16px;max-width:500px;margin:10px auto 20px;">
                        ${isVictory
                            ? `You have conquered <strong>${item.name}</strong> with legendary mastery.`
                            : "Your arrows were spent before reaching the goal. Focus your breath and loose again."}
                    </p>
                    ${isVictory ? `
                        <div style="display:inline-block;padding:12px 28px;border:1.5px solid var(--gold);border-radius:30px;background:rgba(245,197,66,0.18);color:var(--gold-bright);font-weight:900;font-size:18px;margin-bottom:20px;">
                            +${coinsEarned} 🪙 Added to Treasury!
                        </div>
                    ` : ''}
                    <div class="actions-row">
                        <button type="button" class="btn-secondary" onclick="Game.showLevelSelect()">Trials List</button>
                        <button type="button" class="btn-secondary" onclick="GameShop.open('weapons')">🛒 Armory Shop</button>
                        ${isVictory && levelIndex + 1 < GameLevels.getAllLevels().length
                            ? `<button type="button" class="btn-primary" onclick="Game.showLevelBrief(${levelIndex + 1})">Next Trial →</button>`
                            : `<button type="button" class="btn-primary" onclick="Game.launchLevel()">Try Again ↺</button>`}
                    </div>
                </div>
            `;
        }
    };

    // Pointer Event Listeners
    canvas.addEventListener("pointerdown", function (e) {
        if (state !== "play" || !run) return;
        if (e.clientY < 75) return;
        if (run.arrow || run.wait > 0) return;

        e.preventDefault();
        pointer = {
            id: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            x: e.clientX,
            y: e.clientY
        };
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        run.drawing = true;
        GameAudio.play("pull", 0.5);
    });

    canvas.addEventListener("pointermove", function (e) {
        if (!pointer || pointer.id !== e.pointerId || state !== "play" || !run) return;
        pointer.x = e.clientX;
        pointer.y = e.clientY;

        const dx = pointer.startX - pointer.x;
        const dy = pointer.startY - pointer.y;
        const dist = Math.hypot(dx, dy);

        const progress = GameConfig.loadProgress();
        const wep = GameWeapons.getById(progress.equippedWeapon);
        const char = GameCharacters.getById(progress.selectedCharacter);
        const maxPullDist = 170 / (wep.drawSpeed * char.drawBonus);

        if (dx > 4 || Math.abs(dy) > 4) {
            let rawAngle = Math.atan2(-dy, dx);
            if (currentLevel().mode === "fish") {
                run.angle = GameConfig.clamp(rawAngle + 0.5, 0.75, 1.45);
            } else {
                run.angle = GameConfig.clamp(rawAngle, 0.12, 1.35);
            }
            run.pull = GameConfig.clamp(dist / maxPullDist, 0, 1);
        }
    });

    canvas.addEventListener("pointerup", function (e) {
        if (pointer && pointer.id === e.pointerId && state === "play" && run) {
            if (run.drawing && run.pull >= 0.25) {
                releaseArrow();
            } else {
                run.drawing = false;
                run.pull = 0;
            }
            pointer = null;
        }
    });

    canvas.addEventListener("pointercancel", function () {
        pointer = null;
        if (run) { run.drawing = false; run.pull = 0; }
    });

    // UI Event Handlers
    if (ui.back) ui.back.addEventListener("click", () => Game.showLevelSelect());
    if (ui.shopBtn) ui.shopBtn.addEventListener("click", () => GameShop.open("weapons"));
    if (ui.wepBtn) ui.wepBtn.addEventListener("click", () => GameShop.open("weapons"));
    if (ui.soundBtn) {
        ui.soundBtn.addEventListener("click", () => {
            const on = GameAudio.toggleSound();
            ui.soundBtn.textContent = on ? "🔊" : "🔇";
        });
    }

    // Main Game Frame Loop
    function frame(timestamp) {
        const dt = lastTime ? GameConfig.clamp((timestamp - lastTime) / 1000, 0, 0.05) : 1 / 60;
        lastTime = timestamp;

        ambient += dt;
        if (toastTimer > 0) {
            toastTimer -= dt;
            if (toastTimer <= 0 && ui.toast) {
                ui.toast.style.opacity = "0";
                ui.toast.style.transform = "translateX(-50%) translateY(-10px)";
            }
        }

        if (slowMotionTimer > 0) {
            slowMotionTimer -= dt;
        }

        let effectiveDt = dt * (slowMotionTimer > 0 ? 0.35 : 1.0);
        if (screenFlash > 0) screenFlash = Math.max(0, screenFlash - dt * 2);
        if (shakeTime > 0) shakeTime -= dt;

        // Particle updates
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * effectiveDt;
            p.y += p.vy * effectiveDt;
            p.vy += 120 * effectiveDt;
            p.life -= effectiveDt;
            if (p.life <= 0) particles.splice(i, 1);
        }

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.y += ft.vy * effectiveDt;
            ft.life -= effectiveDt;
            if (ft.life <= 0) floatingTexts.splice(i, 1);
        }

        for (let i = electricArcs.length - 1; i >= 0; i--) {
            electricArcs[i].life -= effectiveDt;
            if (electricArcs[i].life <= 0) electricArcs.splice(i, 1);
        }

        if (state === "play" && run) {
            run.time += effectiveDt;

            if (run.wait > 0) {
                run.wait -= effectiveDt;
                if (run.wait <= 0) {
                    if (run.hits >= currentLevel().goal) {
                        Game.levelCompleted(true);
                    } else if (run.used >= currentLevel().arrows) {
                        Game.levelCompleted(false);
                    }
                }
            }

            const lvl = currentLevel();

            // Arrow Flight Physics Simulation
            if (run.arrow) {
                const arrow = run.arrow;
                const wep = arrow.wep;
                const steps = 6;
                const sdt = effectiveDt / steps;
                const g = GameConfig.ground(W, H);

                const grav = Math.max(180, H * 0.9) * wep.gravityMult;
                const windForce = lvl.wind * (1 - wep.windPierce) * 38;

                for (let s = 0; s < steps && run.arrow; s++) {
                    arrow.vx += windForce * sdt;
                    arrow.vy += grav * sdt;

                    arrow.x += arrow.vx * sdt;
                    arrow.y += arrow.vy * sdt;
                    arrow.life += sdt;

                    arrow.trail.push({ x: arrow.x, y: arrow.y });
                    if (arrow.trail.length > 18) arrow.trail.shift();

                    const tpos = getTargetPos(run.time);

                    if (lvl.mode === "fish") {
                        const canopyY = H * 0.32;
                        if (arrow.y <= canopyY && !run.revealed) {
                            run.revealed = true;
                            run.canopyOpen = 1.0;
                            triggerFlash(0.2);
                        }

                        const distToFish = Math.hypot(arrow.x - tpos.x, arrow.y - tpos.y);
                        const distToEye = Math.hypot(arrow.x - tpos.eyeX, arrow.y - tpos.eyeY);

                        if (distToEye <= tpos.r + 8 || distToFish <= tpos.r + 4) {
                            resolveHit(true, 10, arrow.x, arrow.y, "Matsya Vedha Complete!");
                            break;
                        } else if (arrow.y < H * 0.12 || arrow.x > W + 20) {
                            resolveHit(false, 0, arrow.x, arrow.y, "Passed overhead rafters! Lead the reflection.");
                            break;
                        }
                    } else if (lvl.mode === "hunt") {
                        const dist = Math.hypot(arrow.x - tpos.x, arrow.y - tpos.y);
                        if (dist <= tpos.r + 8) {
                            resolveHit(true, 10, arrow.x, arrow.y);
                            break;
                        } else if (arrow.y >= g || arrow.x > W + 30) {
                            resolveHit(false, 0, arrow.x, g, "Arrow hit the ground.");
                            break;
                        }
                    } else {
                        const dist = Math.hypot(arrow.x - tpos.x, arrow.y - tpos.y);
                        if (dist <= tpos.r) {
                            let ringScore = 10;
                            if (dist > tpos.r * 0.25) ringScore = 9;
                            if (dist > tpos.r * 0.5) ringScore = 7;
                            if (dist > tpos.r * 0.75) ringScore = 5;

                            resolveHit(true, ringScore, arrow.x, arrow.y);
                            break;
                        } else if (arrow.y >= g || arrow.x > W + 30 || arrow.life > 4) {
                            resolveHit(false, 0, arrow.x, Math.min(arrow.y, g), "Missed the target.");
                            break;
                        }
                    }
                }
            }

            if (lvl.mode === "wand_duel") {
                updateWandCombat(effectiveDt);
            }
        }

        // Draw Frame
        ctx.clearRect(0, 0, W, H);
        ctx.save();

        if (shakeTime > 0) {
            ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
        }

        GameRenderer.drawBackground(ctx, W, H, ambient);

        if (state === "play" && run) {
            const lvl = currentLevel();
            const sc = GameConfig.scale(W, H);
            const g = GameConfig.ground(W, H);
            const p = GameConfig.origin(W, H);
            const progress = GameConfig.loadProgress();
            const wep = GameWeapons.getById(progress.equippedWeapon);
            const char = GameCharacters.getById(progress.selectedCharacter);

            GameRenderer.drawWindStreaks(ctx, W, H, lvl.wind || 0, ambient);

            if (lvl.mode === "fish") {
                const tpos = getTargetPos(run.time);
                GameRenderer.drawMatsyaVedha(ctx, W, H, tpos, sc, g, run.canopyOpen, run.revealed, ambient);
            } else if (lvl.mode === "wand_duel") {
                const bpos = getTargetPos(run.time);
                const b = GameLevels.getBoss(lvl.boss);
                GameRenderer.drawWandDuelArena(ctx, bpos, b, run.shieldAngle, run.enemyBolts);
            } else if (lvl.mode === "hunt") {
                const tpos = getTargetPos(run.time);
                GameRenderer.drawRunningBeast(ctx, tpos, sc, lvl.leaping);
            } else {
                const tpos = getTargetPos(run.time);
                GameRenderer.drawStandardTarget(ctx, tpos, sc, g);
            }

            // Draw Selected Legendary Hero Character
            GameCharacters.drawCharacter(ctx, char.id, p.x, p.y, sc, run.angle, run.pull, run.drawing, wep, ambient);

            // Trajectory Arc
            if (run.drawing && run.pull > 0.15 && !run.arrow) {
                GameRenderer.drawTrajectory(ctx, p.x, p.y, run.angle, run.pull, wep, lvl.wind || 0, g, W, H);
            }

            // Flying Projectile (Arrow, Chakra, or Serpent)
            if (run.arrow) {
                GameWeapons.drawProjectile(ctx, run.arrow, ambient);
            }

            run.stuck.forEach(function (st) {
                GameRenderer.drawStuckArrow(ctx, st.x, st.y, st.angle, st.color);
            });
        }

        // Particle rendering
        particles.forEach(function (p) {
            ctx.save();
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        electricArcs.forEach(function (arc) {
            ctx.save();
            ctx.strokeStyle = arc.color;
            ctx.shadowColor = arc.color;
            ctx.shadowBlur = 12;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(arc.x, arc.y);
            const midX = (arc.x + arc.tx) * 0.5 + (Math.random() - 0.5) * 30;
            const midY = (arc.y + arc.ty) * 0.5 + (Math.random() - 0.5) * 30;
            ctx.lineTo(midX, midY);
            ctx.lineTo(arc.tx, arc.ty);
            ctx.stroke();
            ctx.restore();
        });

        floatingTexts.forEach(function (ft) {
            ctx.save();
            ctx.globalAlpha = ft.life / ft.maxLife;
            ctx.font = "900 " + Math.max(14, 18 * GameConfig.scale(W, H)) + "px 'Cinzel', Georgia, serif";
            ctx.textAlign = "center";
            ctx.fillStyle = ft.color;
            ctx.shadowColor = "#000000";
            ctx.shadowBlur = 8;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        });

        if (screenFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${screenFlash * 0.4})`;
            ctx.fillRect(0, 0, W, H);
        }

        ctx.restore();

        window.requestAnimationFrame(frame);
    }

    // Initialize Game
    global.Game = Game;
    global.GameUI = { notify: notify };

    resize();
    Game.home();
    window.requestAnimationFrame(frame);
})(window);
