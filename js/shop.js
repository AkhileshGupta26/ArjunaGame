// Armory Shop & Character Selector UI
(function (global) {
    "use strict";

    let activeTab = "weapons"; // 'weapons' or 'characters'
    let selectedWeaponId = "gandiva";
    let selectedCharacterId = "arjuna";

    const GameShop = {
        open: function (tab = "weapons") {
            activeTab = tab;
            const progress = GameConfig.loadProgress();
            selectedWeaponId = progress.equippedWeapon || "gandiva";
            selectedCharacterId = progress.selectedCharacter || "arjuna";

            const hud = document.getElementById("hud");
            const menu = document.getElementById("menu");
            if (hud) hud.classList.add("hidden");
            if (menu) menu.classList.remove("hidden");

            GameShop.render();
        },

        render: function () {
            const menu = document.getElementById("menu");
            if (!menu) return;

            const progress = GameConfig.loadProgress();
            const weapons = GameWeapons.getAll();
            const characters = GameCharacters.getAll();

            const isWepTab = activeTab === "weapons";
            const selectedWep = GameWeapons.getById(selectedWeaponId);
            const selectedChar = GameCharacters.getById(selectedCharacterId);

            // Left Preview Box Content
            let previewTitle = "";
            let previewDesc = "";
            let statsHtml = "";

            if (isWepTab) {
                previewTitle = `<span style="color:${selectedWep.color};">${selectedWep.name}</span>`;
                previewDesc = selectedWep.desc;
                statsHtml = `
                    <div class="stat-row">
                        <span>Projectile Velocity</span>
                        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${Math.min(100, selectedWep.speedMult * 55)}%;"></div></div>
                    </div>
                    <div class="stat-row">
                        <span>Draw &amp; Cast Speed</span>
                        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${Math.min(100, selectedWep.drawSpeed * 58)}%;"></div></div>
                    </div>
                    <div class="stat-row">
                        <span>Wind Resistance</span>
                        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${selectedWep.windPierce * 100}%;"></div></div>
                    </div>
                    <div class="stat-row">
                        <span>Special Perk</span>
                        <span style="color:${selectedWep.color};font-size:12px;">${selectedWep.special}</span>
                    </div>
                `;
            } else {
                previewTitle = `<span style="color:${selectedChar.color};">${selectedChar.name}</span>`;
                previewDesc = selectedChar.desc;
                statsHtml = `
                    <div class="stat-row">
                        <span>Title</span>
                        <span style="color:${selectedChar.color};font-size:12px;">${selectedChar.title}</span>
                    </div>
                    <div class="stat-row">
                        <span>Draw Speed Bonus</span>
                        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${selectedChar.drawBonus * 70}%;"></div></div>
                    </div>
                    <div class="stat-row">
                        <span>Breath Stillness</span>
                        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${selectedChar.swayReduction * 100}%;"></div></div>
                    </div>
                    <div class="stat-row">
                        <span>Hero Perk</span>
                        <span style="color:${selectedChar.color};font-size:12px;">${selectedChar.perk}</span>
                    </div>
                `;
            }

            // Right Items List Content
            let itemsHtml = "";
            if (isWepTab) {
                itemsHtml = weapons.map(function (w) {
                    const isUnlocked = progress.weapons.includes(w.id);
                    const isEquipped = progress.equippedWeapon === w.id;
                    const isSelected = selectedWep.id === w.id;

                    let btn = "";
                    if (isEquipped) {
                        btn = `<span class="action-btn equipped">Equipped</span>`;
                    } else if (isUnlocked) {
                        btn = `<button type="button" class="action-btn equip" onclick="GameShop.equipWeapon('${w.id}')">Equip</button>`;
                    } else {
                        btn = `<button type="button" class="action-btn buy" onclick="GameShop.buyWeapon('${w.id}')">Buy 🪙 ${w.cost}</button>`;
                    }

                    return `
                        <div class="item-list-card ${isSelected ? 'selected' : ''}" onclick="GameShop.selectWeapon('${w.id}')">
                            <div class="item-list-left">
                                <span class="item-list-icon" style="color:${w.color};text-shadow:0 0 10px ${w.color};">${w.icon}</span>
                                <div class="item-list-info">
                                    <strong>${w.name}</strong>
                                    <small style="color:${w.color};">${w.special}</small>
                                </div>
                            </div>
                            <div>${btn}</div>
                        </div>
                    `;
                }).join('');
            } else {
                itemsHtml = characters.map(function (c) {
                    const isUnlocked = progress.characters.includes(c.id);
                    const isSelectedChar = progress.selectedCharacter === c.id;
                    const isCurrent = selectedChar.id === c.id;

                    let btn = "";
                    if (isSelectedChar) {
                        btn = `<span class="action-btn equipped">Selected</span>`;
                    } else if (isUnlocked) {
                        btn = `<button type="button" class="action-btn equip" onclick="GameShop.selectHero('${c.id}')">Choose</button>`;
                    } else {
                        btn = `<button type="button" class="action-btn buy" onclick="GameShop.unlockHero('${c.id}')">Unlock 🪙 1000</button>`;
                    }

                    return `
                        <div class="item-list-card ${isCurrent ? 'selected' : ''}" onclick="GameShop.previewHero('${c.id}')">
                            <div class="item-list-left">
                                <span class="item-list-icon" style="color:${c.color};text-shadow:0 0 10px ${c.color};">${c.icon}</span>
                                <div class="item-list-info">
                                    <strong>${c.name}</strong>
                                    <small style="color:${c.color};">${c.perk}</small>
                                </div>
                            </div>
                            <div>${btn}</div>
                        </div>
                    `;
                }).join('');
            }

            menu.innerHTML = `
                <div class="page shop-page">
                    <div class="shop-header">
                        <div>
                            <div class="eyebrow">Celestial Arsenal &amp; Heroes</div>
                            <h2>DIVINE ARMORY</h2>
                        </div>
                        <div style="display:flex;gap:12px;align-items:center;">
                            <div class="shop-treasury-pill">🪙 ${progress.coins.toLocaleString()}</div>
                            <button type="button" class="btn-secondary" onclick="GameShop.close()">‹ Close Armory</button>
                        </div>
                    </div>

                    <div class="modal-tabs">
                        <button type="button" class="tab-btn ${isWepTab ? 'active' : ''}" onclick="GameShop.switchTab('weapons')">⚔ Weapons, Astras &amp; Chakra</button>
                        <button type="button" class="tab-btn ${!isWepTab ? 'active' : ''}" onclick="GameShop.switchTab('characters')">👑 Choose Legendary Hero</button>
                    </div>

                    <div class="shop-content">
                        <div class="shop-preview-box">
                            <canvas id="shop-preview-canvas" width="260" height="260"></canvas>
                            <div class="shop-item-title">${previewTitle}</div>
                            <div class="shop-item-desc">${previewDesc}</div>
                            ${statsHtml}
                        </div>

                        <div class="shop-list-box">${itemsHtml}</div>
                    </div>
                </div>
            `;

            GameShop.drawPreview();
        },

        switchTab: function (tab) {
            activeTab = tab;
            GameShop.render();
        },

        selectWeapon: function (id) {
            selectedWeaponId = id;
            GameShop.render();
        },

        previewHero: function (id) {
            selectedCharacterId = id;
            GameShop.render();
        },

        buyWeapon: function (id) {
            const progress = GameConfig.loadProgress();
            const wep = GameWeapons.getById(id);
            if (!wep) return;

            if (progress.coins >= wep.cost) {
                progress.coins -= wep.cost;
                progress.weapons.push(id);
                progress.equippedWeapon = id;
                GameConfig.saveProgress(progress);

                GameAudio.play("coin");
                GameAudio.play("shankha");
                if (global.GameUI) global.GameUI.notify("Weapon Acquired!", `${wep.name} is now equipped!`, 2.0);
                GameShop.render();
            } else {
                GameAudio.play("pull");
                if (global.GameUI) global.GameUI.notify("Insufficient Treasury", `You need ${wep.cost - progress.coins} more coins! Complete more levels.`);
            }
        },

        equipWeapon: function (id) {
            const progress = GameConfig.loadProgress();
            progress.equippedWeapon = id;
            GameConfig.saveProgress(progress);

            const wep = GameWeapons.getById(id);
            if (wep.type === "chakra") GameAudio.play("chakra");
            else if (wep.id === "nagastra") GameAudio.play("nagastra");
            else GameAudio.play("zap");

            if (global.GameUI) global.GameUI.notify("Equipped", `${wep.name} ready for battle!`);
            GameShop.render();
        },

        selectHero: function (id) {
            const progress = GameConfig.loadProgress();
            progress.selectedCharacter = id;
            GameConfig.saveProgress(progress);

            const char = GameCharacters.getById(id);
            GameAudio.play("shankha");
            if (global.GameUI) global.GameUI.notify("Hero Selected", `${char.name} now enters the trials!`);
            GameShop.render();
        },

        unlockHero: function (id) {
            const progress = GameConfig.loadProgress();
            const cost = 1000;
            if (progress.coins >= cost) {
                progress.coins -= cost;
                progress.characters.push(id);
                progress.selectedCharacter = id;
                GameConfig.saveProgress(progress);

                GameAudio.play("coin");
                GameAudio.play("shankha");
                GameShop.render();
            } else {
                GameAudio.play("pull");
                if (global.GameUI) global.GameUI.notify("Insufficient Treasury", `Unlock hero requires 1,000 coins.`);
            }
        },

        close: function () {
            if (global.Game) {
                if (global.Game.isRunning()) {
                    global.Game.resume();
                } else {
                    global.Game.showLevelSelect();
                }
            }
        },

        drawPreview: function () {
            const cv = document.getElementById("shop-preview-canvas");
            if (!cv) return;
            const pctx = cv.getContext("2d");
            pctx.clearRect(0, 0, 260, 260);

            const cx = 130;
            const cy = 130;
            const t = Date.now() / 1000;

            if (activeTab === "weapons") {
                const wep = GameWeapons.getById(selectedWeaponId);

                // Orbiting particles
                for (let i = 0; i < 8; i++) {
                    const ang = t * 2 + i * (Math.PI * 2 / 8);
                    const ox = cx + Math.cos(ang) * 90;
                    const oy = cy + Math.sin(ang) * 90;
                    pctx.beginPath();
                    pctx.arc(ox, oy, 4, 0, Math.PI * 2);
                    pctx.fillStyle = wep.color;
                    pctx.shadowColor = wep.color;
                    pctx.shadowBlur = 12;
                    pctx.fill();
                }

                pctx.save();
                pctx.translate(cx, cy);

                if (wep.type === "chakra") {
                    // Sudarshana Chakra Spinning Preview
                    pctx.rotate(t * 5);
                    pctx.beginPath();
                    pctx.arc(0, 0, 48, 0, Math.PI * 2);
                    pctx.fillStyle = "#ffd700";
                    pctx.shadowColor = "#ffd700";
                    pctx.shadowBlur = 24;
                    pctx.fill();

                    for (let b = 0; b < 12; b++) {
                        const ba = b * (Math.PI * 2 / 12);
                        pctx.beginPath();
                        pctx.moveTo(Math.cos(ba) * 44, Math.sin(ba) * 44);
                        pctx.lineTo(Math.cos(ba + 0.25) * 68, Math.sin(ba + 0.25) * 68);
                        pctx.lineTo(Math.cos(ba + 0.45) * 44, Math.sin(ba + 0.45) * 44);
                        pctx.fillStyle = "#fff9c4";
                        pctx.fill();
                    }
                } else if (wep.id === "nagastra") {
                    // Serpent Astra Preview
                    pctx.rotate(Math.sin(t * 3) * 0.2);
                    pctx.strokeStyle = "#39ff14";
                    pctx.shadowColor = "#39ff14";
                    pctx.shadowBlur = 18;
                    pctx.lineWidth = 8;
                    pctx.beginPath();
                    pctx.moveTo(-60, 0);
                    pctx.bezierCurveTo(-20, -30, 20, 30, 50, 0);
                    pctx.stroke();

                    pctx.fillStyle = "#00e676";
                    pctx.beginPath();
                    pctx.arc(52, 0, 14, 0, Math.PI * 2);
                    pctx.fill();
                } else if (wep.type === "wand") {
                    // Wand Preview
                    pctx.rotate(Math.sin(t) * 0.15);
                    pctx.shadowColor = wep.color;
                    pctx.shadowBlur = 20;

                    pctx.beginPath();
                    pctx.moveTo(-60, 60);
                    pctx.lineTo(50, -50);
                    pctx.strokeStyle = "#5a3a2a";
                    pctx.lineWidth = 10;
                    pctx.stroke();

                    pctx.strokeStyle = wep.color;
                    pctx.lineWidth = 4.5;
                    pctx.stroke();

                    pctx.beginPath();
                    pctx.arc(58, -58, 18, 0, Math.PI * 2);
                    pctx.fillStyle = wep.color;
                    pctx.fill();
                } else {
                    // Bow Preview
                    pctx.rotate(Math.sin(t) * 0.15);
                    pctx.shadowColor = wep.color;
                    pctx.shadowBlur = 20;

                    pctx.beginPath();
                    pctx.moveTo(-50, -75);
                    pctx.bezierCurveTo(20, -55, 35, -20, 20, 0);
                    pctx.bezierCurveTo(35, 20, 20, 55, -50, 75);
                    pctx.strokeStyle = "#402419";
                    pctx.lineWidth = 11;
                    pctx.stroke();

                    pctx.strokeStyle = wep.color;
                    pctx.lineWidth = 6;
                    pctx.stroke();

                    pctx.beginPath();
                    pctx.moveTo(-50, -75);
                    pctx.lineTo(-20, 0);
                    pctx.lineTo(-50, 75);
                    pctx.strokeStyle = "#ffffff";
                    pctx.lineWidth = 2;
                    pctx.stroke();
                }
                pctx.restore();
            } else {
                // Character Preview
                const char = GameCharacters.getById(selectedCharacterId);
                const wep = GameWeapons.getById(selectedWeaponId);
                GameCharacters.drawCharacter(pctx, char.id, cx, cy + 50, 1.35, 0.6, 0.4, true, wep, t);
            }
        }
    };

    global.GameShop = GameShop;
})(window);
