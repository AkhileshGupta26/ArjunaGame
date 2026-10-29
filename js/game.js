// Main Game Controller & Astra Combat Engine (Special Effects & 4-Weapon Deck System)
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
        heroBtn: document.getElementById("hud-hero-btn"),
        heroIcon: document.getElementById("hud-hero-icon"),
        heroName: document.getElementById("hud-hero-name"),
        wepBtn: document.getElementById("hud-weapon-btn"),
        wepIcon: document.getElementById("hud-wep-icon"),
        wepName: document.getElementById("hud-wep-name"),
        loadoutBar: document.getElementById("hud-loadout-bar"),
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

    const DHARMIC_SHLOKAS = [
        { sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन", english: "Thy right is to work alone, never to its fruits. (Bhagavad Gita 2.47)" },
        { sanskrit: "यतो धर्मस्ततो जयः", english: "Where there is Dharma, there is Victory. (Mahabharata)" },
        { sanskrit: "योगः कर्मसु कौशलम्", english: "Supreme excellence in action is Yoga. (Bhagavad Gita 2.50)" },
        { sanskrit: "अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते", english: "By relentless practice is mastery achieved, O Kaunteya. (Gita 6.35)" },
        { sanskrit: "एकाग्रता परमं तपः", english: "Laser single-pointed concentration is the supreme penance." },
        { sanskrit: "धर्मो रक्षति रक्षितः", english: "Dharma protects those who uphold righteousness." }
    ];

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

    function addFloatingText(text, x, y, color = "#f5c542") {
        floatingTexts.push({
            text: text,
            x: x,
            y: y,
            color: color,
            vy: -40,
            life: 1.5,
            maxLife: 1.5
        });
    }

    function triggerFlash(intensity = 0.3) {
        screenFlash = intensity;
    }

    function addShake(duration = 0.2, intensity = 8) {
        shakeTime = duration;
        shakeIntensity = intensity;
    }

    function spawnBurst(x, y, color, count = 20, speed = 1) {
        const sc = GameConfig.scale(W, H);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (Math.random() * 140 + 30) * speed * sc;
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

    // 4-Slot Loadout HUD Updater (Gandiva + Max 3 Magical Wands)
    function renderLoadoutBar() {
        if (!ui.loadoutBar) return;
        const progress = GameConfig.loadProgress();
        const activeLoadout = progress.activeLoadout || ["agni", "vajra", "brahmashira"];
        const equipped = progress.equippedWeapon || "gandiva";

        const slots = [
            { id: "gandiva", num: "1", isGandiva: true },
            { id: activeLoadout[0] || null, num: "2" },
            { id: activeLoadout[1] || null, num: "3" },
            { id: activeLoadout[2] || null, num: "4" }
        ];

        ui.loadoutBar.innerHTML = slots.map((s, idx) => {
            if (!s.id) {
                return `
                    <div class="loadout-slot" data-slot="${idx}" onclick="GameShop.open('weapons')">
                        <span class="slot-num-badge">${s.num}</span>
                        <span class="slot-icon" style="color:var(--muted);font-size:18px;">+</span>
                        <span class="slot-name" style="color:var(--muted);">Empty</span>
                    </div>
                `;
            }
            const w = GameWeapons.getById(s.id);
            const isActive = equipped === s.id;
            const cdRemaining = (run && run.cooldowns && run.cooldowns[s.id]) || 0;
            const isCd = cdRemaining > 0;
            const totalCd = w.cooldown || 1;
            const pct = isCd ? Math.min(100, (cdRemaining / totalCd) * 100) : 0;

            return `
                <div class="loadout-slot ${isActive ? 'active' : ''}" data-slot="${idx}" data-wepid="${w.id}" onclick="Game.selectLoadoutSlot(${idx})" title="[${s.num}] ${w.name}">
                    <span class="slot-num-badge">${s.num}</span>
                    <span class="slot-icon" style="color:${w.color};">${w.icon}</span>
                    <span class="slot-name">${w.name.split(' ')[0]}</span>
                    <div class="slot-cooldown-overlay ${isCd ? '' : 'hidden'}">
                        <span class="cooldown-timer-text">${cdRemaining.toFixed(1)}s</span>
                        <div class="slot-cooldown-progress" style="height:${pct}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function updateCoinUI() {
        const progress = GameConfig.loadProgress();
        if (ui.coinVal) ui.coinVal.textContent = progress.coins.toLocaleString();
        const wep = GameWeapons.getById(progress.equippedWeapon);
        if (ui.wepName) ui.wepName.textContent = wep.name.split(" ")[0];
        if (ui.wepIcon) ui.wepIcon.textContent = wep.icon;
        const char = GameCharacters.getById(progress.selectedCharacter);
        if (ui.heroName) ui.heroName.textContent = char.name.split(" ")[0];
        if (ui.heroIcon) ui.heroIcon.textContent = char.icon;
        renderLoadoutBar();
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

        if (item.mode === "hunt") {
            const bx = W * 0.42 + (Math.sin(t * 1.6) * W * 0.28);
            const by = g - 40 * sc - (item.leaping ? Math.abs(Math.sin(t * 4)) * 75 * sc : 0);
            return { x: bx, y: by, r: 28 * sc };
        }

        if (item.mode === "fish") {
            const rotSpeed = item.movingSpeed || 1.2;
            const fa = t * rotSpeed;
            const poolX = W * 0.38;
            const poolY = g - 12 * sc;
            const fishX = W * 0.62 + Math.cos(fa) * 110 * sc;
            const fishY = H * 0.22 + Math.sin(fa) * 35 * sc;
            const eyeX = fishX + Math.cos(fa + 0.3) * 14 * sc;
            const eyeY = fishY + Math.sin(fa + 0.3) * 14 * sc;

            return {
                x: fishX,
                y: fishY,
                r: 16 * sc,
                eyeX: eyeX,
                eyeY: eyeY,
                poolX: poolX,
                poolY: poolY,
                poolW: 130 * sc,
                poolH: 26 * sc,
                angle: fa
            };
        }

        // Standard archery target stand
        const distRatio = item.longRange ? 0.88 : (item.moving ? 0.76 : 0.82);
        const tx = W * distRatio;
        const ty = g - 78 * sc - (item.moving ? Math.sin(t * 2.2) * 45 * sc : 0);
        return { x: tx, y: ty, r: 34 * sc };
    }

    // Resolve Target Hit
    function resolveHit(isHit, score = 10, hitX, hitY, hitReason = "") {
        if (!run) return;
        const item = currentLevel();
        const progress = GameConfig.loadProgress();
        const char = GameCharacters.getById(progress.selectedCharacter);
        const wep = GameWeapons.getById(progress.equippedWeapon);

        if (isHit) {
            streak++;
            run.hits++;
            const mult = (1 + streak * 0.25) * char.coinBonus;
            const coinsEarned = Math.round(score * 12 * mult);
            progress.coins += coinsEarned;

            triggerFlash(0.25);
            addShake(0.18, 9);
            spawnBurst(hitX, hitY, wep.color, 32, 1.4);

            let banner = "✦ HIT! ✦";
            if (score === 10) {
                banner = "🎯 BULLSEYE!";
                GameAudio.play("bullseye", streak);
            } else {
                GameAudio.play("thud");
            }

            if (item.mode === "fish") banner = "✦ MATSYA VEDHA! ✦";
            if (streak >= 3) banner = `✦ ${streak}X STREAK! ✦`;

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

    // Launch Weapon / Astra / Beam
    function releaseArrow() {
        if (!run || run.arrow || run.used >= currentLevel().arrows) return;
        const progress = GameConfig.loadProgress();
        const wep = GameWeapons.getById(progress.equippedWeapon);
        const char = GameCharacters.getById(progress.selectedCharacter);
        const p = GameConfig.origin(W, H);
        const sc = GameConfig.scale(W, H);
        const g = GameConfig.ground(W, H);
        const tpos = getTargetPos(run.time);

        // Refuel Cooldown Check
        const cdRemaining = (run.cooldowns && run.cooldowns[wep.id]) || 0;
        if (cdRemaining > 0) {
            notify("Wand Refueling...", `${wep.name} ready in ${cdRemaining.toFixed(1)}s! Switch to Gandiva [1].`, 1.6);
            GameAudio.play("pull");
            run.drawing = false;
            run.pull = 0;
            return;
        }

        // Apply weapon cooldown
        if (wep.cooldown > 0) {
            run.cooldowns[wep.id] = wep.cooldown;
        }

        run.used++;
        run.drawing = false;
        run.pull = 0;
        run.revealed = false;

        const baseSpeed = (Math.sqrt(Math.max(180, H * 0.9) * Math.max(W * 0.92, H * 0.45)) * 1.25)
            * (0.35 + (run.pull || 0.8) * 0.85) * wep.speedMult * char.speedBonus;

        // ==============================================================
        // SPECIAL EFFECTS LOGIC PER WEAPON
        // ==============================================================

        if (wep.isBeam) {
            // SURYA SOLAR BEAM / VARUNA OCEAN SURGE (Continuous 2.8s Channel)
            run.activeBeams.push({
                type: wep.id,
                originX: p.x,
                originY: p.y,
                targetX: tpos.x,
                targetY: tpos.y,
                timer: wep.beamDuration || 2.8,
                maxTimer: wep.beamDuration || 2.8,
                wep: wep
            });

            if (wep.id === "surya") {
                GameAudio.play("solar_beam");
                notify("☀️ Surya Solar Beam!", "Thermonuclear solar laser incinerating targets!");
                triggerFlash(0.35);
                addShake(0.5, 6);
            } else {
                GameAudio.play("water_surge");
                notify("🌊 Varuna Ocean Torrent!", "Continuous rushing tidal waves submerging targets!");
                addShake(0.4, 5);
            }

            // Immediately apply beam damage ticks over duration
            setTimeout(() => {
                if (run) resolveHit(true, 10, tpos.x, tpos.y, `${wep.name} Channel Complete!`);
            }, 1200);

            return;
        }

        if (wep.id === "brahmashira") {
            // BRAHMASTRA: COSMIC ENVIRONMENT DESTROYER
            run.arrow = {
                x: p.x,
                y: p.y,
                vx: Math.cos(run.angle) * (baseSpeed * 1.3),
                vy: -Math.sin(run.angle) * (baseSpeed * 1.3),
                life: 0,
                trail: [],
                wep: wep
            };

            // Trigger Cosmic Cataclysm
            run.cosmicCataclysm = {
                timer: 3.8,
                maxTimer: 3.8,
                originX: tpos.x,
                originY: tpos.y,
                shockwaveRadius: 0,
                activeLightning: [],
                meteors: [
                    { x: tpos.x - 70, y: -40, radius: 18, vy: 580 },
                    { x: tpos.x + 10, y: -90, radius: 24, vy: 640 },
                    { x: tpos.x + 80, y: -60, radius: 20, vy: 600 }
                ],
                nextLightning: 0.15
            };

            GameAudio.play("cosmic");
            triggerFlash(0.6);
            addShake(1.5, 16);
            notify("🌌 BRAHMASTRA CATACLYSM!", "Cosmic lightning and meteors destroying the enemy environment!");
            return;
        }

        if (wep.id === "vajra") {
            // VAJRA ELECTRIC WAND: 3 ELECTRIC SHOCK BALLS
            [-0.12, 0, 0.12].forEach((spread, bIdx) => {
                run.specialProjectiles.push({
                    isShockBall: true,
                    ballIndex: bIdx,
                    x: p.x,
                    y: p.y,
                    vx: Math.cos(run.angle + spread) * baseSpeed,
                    vy: -Math.sin(run.angle + spread) * baseSpeed,
                    wep: wep,
                    radius: 12 * sc,
                    trail: [],
                    life: 0
                });
            });

            GameAudio.play("zap");
            GameAudio.play("shock_ball");
            addShake(0.12, 5);
            notify("⚡ Vajra Tri-Shock!", "3 High-voltage electric shock balls unleashed!");
            return;
        }

        if (wep.id === "agni") {
            // AGNI FLAME WAND: FIERY COMET + 3 FALLING AGNI METEORITES
            run.arrow = {
                x: p.x,
                y: p.y,
                vx: Math.cos(run.angle) * baseSpeed,
                vy: -Math.sin(run.angle) * baseSpeed,
                life: 0,
                trail: [],
                wep: wep
            };

            // 3 Agni Meteorites falling from sky onto target area
            run.specialProjectiles.push(
                { isAgniMeteor: true, x: tpos.x - 55, y: -40, vx: 45, vy: 480, wep: wep, life: 0, trail: [] },
                { isAgniMeteor: true, x: tpos.x, y: -80, vx: 15, vy: 520, wep: wep, life: 0, trail: [] },
                { isAgniMeteor: true, x: tpos.x + 55, y: -50, vx: -35, vy: 500, wep: wep, life: 0, trail: [] }
            );

            GameAudio.play("fire");
            notify("🔥 Agni Meteor Shower!", "Fiery meteorites raining from the heavens!");
            addShake(0.15, 6);
            return;
        }

        // Standard projectile (Gandiva, Chakra, Nagastra, Vayu)
        run.arrow = {
            x: p.x,
            y: p.y,
            vx: Math.cos(run.angle) * baseSpeed,
            vy: -Math.sin(run.angle) * baseSpeed,
            pull: run.pull,
            life: 0,
            trail: [],
            wep: wep
        };

        GameAudio.play("release");
        if (wep.type === "chakra") GameAudio.play("chakra");
        else if (wep.id === "nagastra") {
            GameAudio.play("nagastra");
            GameAudio.play("venom");
        } else GameAudio.play("whoosh");

        addShake(0.08, 3);
    }

    // Wand Duel Simulation
    function updateWandCombat(dt) {
        const lvl = currentLevel();
        const b = GameLevels.getBoss(lvl.boss);
        const sc = GameConfig.scale(W, H);
        run.shieldAngle += dt * 2.2;
        run.bossClock -= dt;

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

            // Parry
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
                    notify("Struck!", "Shoot enemy bolts out of the air!");
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

        // Arrow hits boss
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
                const doneCount = chapter.levels.filter((lvl, lIdx) => {
                    const gIdx = GameLevels.getAllLevels().findIndex(x => x.chapter === idx && x.chapterLevelIndex === lIdx);
                    return progress.completed.includes(gIdx);
                }).length;

                return `
                    <div class="chapter-card" style="--accent:${chapter.accent};" onclick="Game.selectChapter(${idx})">
                        <span class="chapter-icon">${chapter.icon}</span>
                        <div class="chapter-content">
                            <span class="eyebrow">${chapter.place}</span>
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
                            <div class="eyebrow">CLASSICAL EPIC MYTHOLOGY</div>
                            <h1>ARJUNA</h1>
                            <p class="subtext">Wield celestial Dhanush &amp; Divine Astras across legendary trials.</p>
                        </div>
                        <div style="display:flex;gap:12px;align-items:center;">
                            <div class="shop-treasury-pill">🪙 ${progress.coins.toLocaleString()}</div>
                            <button type="button" class="btn-secondary" onclick="GameShop.open('characters')">👑 Hero: <span style="color:var(--gold);">${activeChar.name.split(' ')[0]}</span></button>
                            <button type="button" class="btn-primary" onclick="GameShop.open('weapons')">🛒 WEAPON SHOP</button>
                        </div>
                    </header>
                    <div class="cards-grid">${cardsHtml}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 4px;font-size:13px;color:var(--muted);">
                        <span>Total Stars: <strong style="color:var(--gold);">${totalStars} ★</strong></span>
                        <span>Completed: <strong style="color:var(--mint);">${progress.completed.length} / ${GameLevels.getAllLevels().length} Stages</strong></span>
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
                        <span style="font-size:18px;color:${isDone ? 'var(--mint)' : 'var(--muted)'};font-weight:900;">${isDone ? '✓' : '›'}</span>
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

            let modeBadge = "🎯 Dual Archery Trial";
            if (item.mode === "fish") modeBadge = "✧ Matsya Vedha — Oil Reflection";
            if (item.mode === "wand_duel") modeBadge = "⚡ Wand & Divine Astra Duel";
            if (item.mode === "hunt") modeBadge = "🐗 Dynamic Beast Hunt";

            let details = item.desc || "Pull back and aim for target center with supreme focus.";
            let goalStr = item.mode === "wand_duel"
                ? "Defeat " + GameLevels.getBoss(item.boss).name
                : `Goal: ${item.goal} Targets · ${item.arrows} Arrows · Wind: ${item.wind} m/s`;

            menu.innerHTML = `
                <div class="page panel-center">
                    <div class="eyebrow">${GameLevels.getChapter(item.chapter).name} · Stage ${item.chapterLevelIndex + 1}</div>
                    <h2>${item.name}</h2>
                    <div style="margin:12px 0;"><span class="level-badge-mode" style="font-size:13px;padding:6px 16px;">${modeBadge}</span></div>
                    <p class="subtext" style="font-size:15px;max-width:520px;margin:12px auto 20px;">${details}</p>
                    <div style="display:inline-block;padding:10px 22px;border:1px solid var(--gold-border);border-radius:20px;background:rgba(245,197,66,0.1);color:var(--gold-bright);font-weight:800;font-size:14px;">
                        ${goalStr}
                    </div>
                    <div class="actions-row">
                        <button type="button" class="btn-secondary" onclick="Game.showLevelSelect()">‹ Back</button>
                        <button type="button" class="btn-primary" onclick="Game.launchLevel()">Start Trial →</button>
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
                specialProjectiles: [],
                activeBeams: [],
                cosmicCataclysm: null,
                poisonClouds: [],
                cooldowns: {},
                stuck: [],
                wait: 0,
                wind: item.wind || 0,
                canopyOpen: 0,
                revealed: false,
                sunShield: char.id === "karna" ? 1 : 0,
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

        selectLoadoutSlot: function (slotIdx) {
            const progress = GameConfig.loadProgress();
            const activeLoadout = progress.activeLoadout || ["agni", "vajra", "brahmashira"];
            let wepId = "gandiva";
            if (slotIdx === 0) wepId = "gandiva";
            else if (slotIdx === 1) wepId = activeLoadout[0] || "gandiva";
            else if (slotIdx === 2) wepId = activeLoadout[1] || "gandiva";
            else if (slotIdx === 3) wepId = activeLoadout[2] || "gandiva";

            progress.equippedWeapon = wepId;
            GameConfig.saveProgress(progress);
            updateCoinUI();
            const wObj = GameWeapons.getById(wepId);
            notify(wObj.icon + " " + wObj.name, wObj.special, 1.4);
            GameAudio.play("coin");
        },

        resume: function () {
            state = "play";
            menu.classList.add("hidden");
            hud.classList.remove("hidden");
        },

        levelCompleted: function (isVictory) {
            state = "complete";
            hud.classList.add("hidden");
            menu.classList.remove("hidden");
            const item = currentLevel();

            let starsEarned = 0;
            let coinsEarned = 0;

            if (isVictory) {
                const progress = GameConfig.loadProgress();
                if (!progress.completed.includes(levelIndex)) {
                    progress.completed.push(levelIndex);
                }

                starsEarned = 1;
                if (run.used <= item.arrows * 0.75) starsEarned = 2;
                if (run.used <= item.goal + 1) starsEarned = 3;

                const currentStars = (progress.stars && progress.stars[levelIndex]) || 0;
                if (starsEarned > currentStars) {
                    if (!progress.stars) progress.stars = {};
                    progress.stars[levelIndex] = starsEarned;
                }

                coinsEarned = 150 + starsEarned * 75;
                progress.coins += coinsEarned;
                GameConfig.saveProgress(progress);

                GameAudio.play("shankha");
            } else {
                GameAudio.play("pull");
            }

            const starsHtml = [1, 2, 3].map(s => {
                return `<span style="font-size:36px;color:${s <= starsEarned ? 'var(--gold)' : 'rgba(255,255,255,0.18)'};margin:0 4px;text-shadow:0 0 16px var(--gold-glow);">★</span>`;
            }).join('');

            const shloka = DHARMIC_SHLOKAS[levelIndex % DHARMIC_SHLOKAS.length];

            menu.innerHTML = `
                <div class="page panel-center">
                    <div class="eyebrow">${isVictory ? 'Victory &amp; Righteousness' : 'Stage Incomplete'}</div>
                    <h2>${isVictory ? 'STAGE CLEARED! ⚔️' : 'WARRIOR FELL IN TRIAL'}</h2>
                    <div style="margin:14px 0;">${starsHtml}</div>
                    
                    <div style="margin:14px auto 18px;padding:12px 20px;border-radius:12px;background:rgba(245,197,66,0.06);border:1px solid rgba(245,197,66,0.25);max-width:540px;">
                        <div style="font-family:'Cinzel',serif;font-size:16px;color:var(--gold-bright);font-weight:700;letter-spacing:0.8px;margin-bottom:4px;">“${shloka.sanskrit}”</div>
                        <div style="font-size:12.5px;color:var(--muted);font-style:italic;">${shloka.english}</div>
                    </div>

                    <p class="subtext" style="font-size:14px;max-width:480px;margin:6px auto 16px;">
                        ${isVictory
                            ? `You have conquered <strong>${item.name}</strong> upholding the sacred Dhanurveda code.`
                            : "Your quiver was exhausted or balance broken. Re-center your Ekagrata focus and engage."}
                    </p>
                    ${isVictory ? `
                        <div style="display:inline-block;padding:10px 24px;border:1.5px solid var(--gold);border-radius:24px;background:rgba(255,215,0,0.12);color:var(--gold);font-weight:900;font-size:16px;margin-bottom:18px;">
                            +${coinsEarned} 🪙 Punya Added to Treasury!
                        </div>
                    ` : ''}
                    <div class="actions-row">
                        <button type="button" class="btn-secondary" onclick="Game.showLevelSelect()">Stages</button>
                        <button type="button" class="btn-secondary" onclick="GameShop.open('weapons')">🛒 Shop</button>
                        ${isVictory && levelIndex + 1 < GameLevels.getAllLevels().length
                            ? `<button type="button" class="btn-primary" onclick="Game.showLevelBrief(${levelIndex + 1})">Next Stage →</button>`
                            : `<button type="button" class="btn-primary" onclick="Game.launchLevel()">Try Again ↺</button>`}
                    </div>
                </div>
            `;
        }
    };

    // Keyboard Shortcuts (1, 2, 3, 4 for 4-Weapon Deck)
    window.addEventListener("keydown", function (e) {
        if (state !== "play") return;
        if (e.key === "1") Game.selectLoadoutSlot(0);
        else if (e.key === "2") Game.selectLoadoutSlot(1);
        else if (e.key === "3") Game.selectLoadoutSlot(2);
        else if (e.key === "4") Game.selectLoadoutSlot(3);
    });

    // Touch & Mouse Drag Controls
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
            if (run.drawing && run.pull >= 0.22) {
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
    if (ui.heroBtn) {
        ui.heroBtn.addEventListener("click", () => {
            const progress = GameConfig.loadProgress();
            const chars = progress.characters;
            const currIdx = chars.indexOf(progress.selectedCharacter);
            const nextChar = chars[(currIdx + 1) % chars.length];
            progress.selectedCharacter = nextChar;
            GameConfig.saveProgress(progress);
            updateCoinUI();
            const cObj = GameCharacters.getById(nextChar);
            notify(cObj.icon + " " + cObj.name, cObj.perk);
            GameAudio.play("shankha");
        });
    }
    if (ui.wepBtn) {
        ui.wepBtn.addEventListener("click", () => {
            const progress = GameConfig.loadProgress();
            const weps = progress.weapons;
            const currIdx = weps.indexOf(progress.equippedWeapon);
            const nextWep = weps[(currIdx + 1) % weps.length];
            progress.equippedWeapon = nextWep;
            GameConfig.saveProgress(progress);
            updateCoinUI();
            const wObj = GameWeapons.getById(nextWep);
            notify(wObj.icon + " " + wObj.name, wObj.special);
            GameAudio.play("coin");
        });
    }
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

            // Cooldown Updates
            if (run.cooldowns) {
                for (const k in run.cooldowns) {
                    if (run.cooldowns[k] > 0) {
                        run.cooldowns[k] = Math.max(0, run.cooldowns[k] - effectiveDt);
                    }
                }
            }

            // Continuous Beams (Surya & Varuna)
            if (run.activeBeams && run.activeBeams.length > 0) {
                for (let b = run.activeBeams.length - 1; b >= 0; b--) {
                    const bm = run.activeBeams[b];
                    bm.timer -= effectiveDt;
                    // Continuous damage tick
                    if (Math.random() < 0.25) {
                        spawnBurst(bm.targetX, bm.targetY, bm.wep.color, 4, 1.2);
                    }
                    if (bm.timer <= 0) {
                        run.activeBeams.splice(b, 1);
                    }
                }
            }

            // Brahmastra Cosmic Cataclysm Update
            if (run.cosmicCataclysm && run.cosmicCataclysm.timer > 0) {
                const cat = run.cosmicCataclysm;
                cat.timer -= effectiveDt;
                cat.shockwaveRadius += 450 * effectiveDt;
                cat.nextLightning -= effectiveDt;

                if (cat.nextLightning <= 0) {
                    cat.nextLightning = 0.22 + Math.random() * 0.15;
                    const lx = W * (0.62 + Math.random() * 0.32);
                    const segments = [{ x: lx, y: 0 }];
                    let curY = 0;
                    let curX = lx;
                    while (curY < GameConfig.ground(W, H)) {
                        curY += 28 + Math.random() * 20;
                        curX += (Math.random() - 0.5) * 36;
                        segments.push({ x: curX, y: Math.min(GameConfig.ground(W, H), curY) });
                    }
                    cat.activeLightning = [{ segments: segments, life: 0.18 }];
                    GameAudio.play("zap");
                    spawnBurst(curX, GameConfig.ground(W, H), "#df73ff", 16, 1.5);
                }

                if (cat.meteors) {
                    cat.meteors.forEach((m, mIdx) => {
                        m.y += m.vy * effectiveDt;
                        if (m.y >= GameConfig.ground(W, H) && !m.crashed) {
                            m.crashed = true;
                            spawnBurst(m.x, GameConfig.ground(W, H), "#ffffff", 25, 2.0);
                            GameAudio.play("meteor");
                            addShake(0.3, 12);
                            resolveHit(true, 10, m.x, GameConfig.ground(W, H) - 30, "Brahmastra Cataclysm Hit!");
                        }
                    });
                }

                if (cat.timer <= 0) {
                    run.cosmicCataclysm = null;
                }
            }

            // Nagastra Poison Clouds Update
            if (run.poisonClouds && run.poisonClouds.length > 0) {
                const tpos = getTargetPos(run.time);
                for (let pc = run.poisonClouds.length - 1; pc >= 0; pc--) {
                    const c = run.poisonClouds[pc];
                    c.life -= effectiveDt;
                    // Check if target is inside toxic cloud
                    const distToTarget = Math.hypot(c.x - tpos.x, c.y - tpos.y);
                    if (distToTarget <= c.radius + tpos.r && Math.random() < 0.15) {
                        spawnBurst(tpos.x, tpos.y, "#39ff14", 6, 0.8);
                        resolveHit(true, 10, tpos.x, tpos.y, "Poison Cloud Dissolution!");
                    }
                    if (c.life <= 0) run.poisonClouds.splice(pc, 1);
                }
            }

            // Special Projectiles (3 Shock Balls & Agni Meteorites)
            if (run.specialProjectiles && run.specialProjectiles.length > 0) {
                const g = GameConfig.ground(W, H);
                const tpos = getTargetPos(run.time);

                for (let sp = run.specialProjectiles.length - 1; sp >= 0; sp--) {
                    const proj = run.specialProjectiles[sp];
                    proj.x += proj.vx * effectiveDt;
                    proj.y += proj.vy * effectiveDt;
                    proj.life += effectiveDt;

                    proj.trail.push({ x: proj.x, y: proj.y });
                    if (proj.trail.length > 12) proj.trail.shift();

                    const dist = Math.hypot(proj.x - tpos.x, proj.y - tpos.y);

                    if (dist <= tpos.r + 14) {
                        if (proj.isShockBall) {
                            spawnBurst(proj.x, proj.y, "#00f0ff", 24, 1.6);
                            spawnElectricArcs(proj.x, proj.y, 6);
                            GameAudio.play("zap");
                        } else if (proj.isAgniMeteor) {
                            spawnBurst(proj.x, proj.y, "#ff4500", 28, 1.8);
                            GameAudio.play("meteor");
                        }
                        resolveHit(true, 10, proj.x, proj.y);
                        run.specialProjectiles.splice(sp, 1);
                        continue;
                    } else if (proj.y >= g || proj.x > W + 40 || proj.life > 4) {
                        if (proj.isAgniMeteor) {
                            spawnBurst(proj.x, g, "#ff4500", 18, 1.2);
                            GameAudio.play("meteor");
                        }
                        run.specialProjectiles.splice(sp, 1);
                        continue;
                    }
                }
            }

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
                            if (wep.id === "nagastra") {
                                run.poisonClouds.push({ x: arrow.x, y: arrow.y, radius: 46 * GameConfig.scale(W, H), life: 3.5, maxLife: 3.5 });
                            }
                            resolveHit(true, 10, arrow.x, arrow.y, "Matsya Vedha Complete!");
                            break;
                        } else if (arrow.y < H * 0.12 || arrow.x > W + 20) {
                            resolveHit(false, 0, arrow.x, arrow.y, "Passed overhead rafters! Lead the reflection.");
                            break;
                        }
                    } else if (lvl.mode === "hunt") {
                        const dist = Math.hypot(arrow.x - tpos.x, arrow.y - tpos.y);
                        if (dist <= tpos.r + 8) {
                            if (wep.id === "nagastra") {
                                run.poisonClouds.push({ x: arrow.x, y: arrow.y, radius: 46 * GameConfig.scale(W, H), life: 3.5, maxLife: 3.5 });
                            }
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

                            if (wep.id === "nagastra") {
                                run.poisonClouds.push({ x: arrow.x, y: arrow.y, radius: 46 * GameConfig.scale(W, H), life: 3.5, maxLife: 3.5 });
                            }
                            resolveHit(true, ringScore, arrow.x, arrow.y);
                            break;
                        } else if (arrow.y >= g || arrow.x > W + 30 || arrow.life > 4) {
                            if (wep.id === "nagastra") {
                                run.poisonClouds.push({ x: arrow.x, y: g, radius: 46 * GameConfig.scale(W, H), life: 3.5, maxLife: 3.5 });
                            }
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

            // Brahmastra Cosmic Cataclysm Void & Lightning
            if (run.cosmicCataclysm) {
                GameWeapons.drawCosmicCataclysm(ctx, run.cosmicCataclysm, ambient, W, H);
            }

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

            // Nagastra Lingering Poison Clouds
            if (run.poisonClouds && run.poisonClouds.length > 0) {
                run.poisonClouds.forEach(cloud => {
                    GameWeapons.drawPoisonCloud(ctx, cloud, ambient);
                });
            }

            // Draw Selected Legendary Hero Character
            GameCharacters.drawCharacter(ctx, char.id, p.x, p.y, sc, run.angle, run.pull, run.drawing, wep, ambient);

            // Trajectory Arc
            if (run.drawing && run.pull > 0.15 && !run.arrow) {
                GameRenderer.drawTrajectory(ctx, p.x, p.y, run.angle, run.pull, wep, lvl.wind || 0, g, W, H);
            }

            // Flying Main Projectile
            if (run.arrow) {
                GameWeapons.drawProjectile(ctx, run.arrow, ambient);
            }

            // Special Sub-Projectiles (3 Electric Shock Balls & Agni Meteorites)
            if (run.specialProjectiles && run.specialProjectiles.length > 0) {
                run.specialProjectiles.forEach(proj => {
                    GameWeapons.drawProjectile(ctx, proj, ambient);
                });
            }

            // Continuous Beams (Surya Solar Laser & Varuna Ocean Torrent)
            if (run.activeBeams && run.activeBeams.length > 0) {
                run.activeBeams.forEach(bm => {
                    GameWeapons.drawContinuousBeam(ctx, bm, ambient, W, H);
                });
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

        // Update Cooldown Overlay on Loadout Bar in Realtime
        if (state === "play") {
            renderLoadoutBar();
        }

        window.requestAnimationFrame(frame);
    }

    // Initialize Game
    global.Game = Game;
    global.GameUI = { notify: notify };

    resize();
    Game.home();
})(window);
