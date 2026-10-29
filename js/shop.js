// Armory Shop & Astra Loadout Deck Manager UI
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
            const activeLoadout = progress.activeLoadout || ["agni", "vajra", "brahmashira"];

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
                const cdStr = selectedWep.cooldown > 0 ? `${selectedWep.cooldown.toFixed(1)}s Refuel` : "0s (Instant / Unlimited)";
                statsHtml = `
                    <div class="stat-row">
                        <span>Refuel Cooldown</span>
                        <span style="color:${selectedWep.cooldown > 0 ? '#ff5252' : 'var(--mint)'};font-weight:800;font-size:12px;">${cdStr}</span>
                    </div>
                    <div class="stat-row">
                        <span>Projectile Velocity</span>
                        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${Math.min(100, selectedWep.speedMult * 55)}%;"></div></div>
                    </div>
                    <div class="stat-row">
                        <span>Wind Penetration</span>
                        <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${selectedWep.windPierce * 100}%;"></div></div>
                    </div>
                    <div class="stat-row">
                        <span>Special Power</span>
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
            let loadoutDeckHtml = "";

            if (isWepTab) {
                // 4-Slot Loadout Deck Header
                const gandivaWep = GameWeapons.getById("gandiva");
                const isGandivaActive = progress.equippedWeapon === "gandiva";

                const slotsHtml = [0, 1, 2].map((slotIdx) => {
                    const wandId = activeLoadout[slotIdx];
                    const w = wandId ? GameWeapons.getById(wandId) : null;
                    const isActive = w && progress.equippedWeapon === w.id;

                    if (!w) {
                        return `
                            <div style="flex:1;padding:8px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.2);text-align:center;">
                                <div style="font-size:11px;color:var(--muted);font-family:'Cinzel',serif;">Slot ${slotIdx + 2}</div>
                                <small style="color:var(--muted);font-size:10px;">[Empty]</small>
                            </div>
                        `;
                    }

                    return `
                        <div style="flex:1;padding:8px 10px;border-radius:10px;background:linear-gradient(135deg,rgba(11,26,44,0.9),rgba(6,17,30,0.95));border:1.5px solid ${isActive ? 'var(--gold)' : 'rgba(245,197,66,0.3)'};box-shadow:${isActive ? '0 0 14px var(--gold-glow)' : 'none'};display:flex;align-items:center;gap:8px;cursor:pointer;" onclick="GameShop.equipWeapon('${w.id}')">
                            <span style="font-size:20px;color:${w.color};">${w.icon}</span>
                            <div style="flex:1;overflow:hidden;">
                                <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:800;color:#ffffff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">[${slotIdx + 2}] ${w.name.split(' ')[0]}</div>
                                <small style="color:${isActive ? 'var(--gold-bright)' : 'var(--muted)'};font-size:10px;">${isActive ? '★ In Hand' : 'Tap to Hold'}</small>
                            </div>
                        </div>
                    `;
                }).join('');

                loadoutDeckHtml = `
                    <div style="margin-bottom:14px;padding:12px 16px;border-radius:14px;background:rgba(6,17,30,0.85);border:1px solid var(--gold-border);">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-family:'Cinzel',serif;font-size:13px;font-weight:800;color:var(--gold-bright);">✦ ACTIVE 4-SLOT LOADOUT (1 Gandiva + Max 3 Magical Wands)</span>
                            <small style="color:var(--muted);font-size:11px;">Keys 1, 2, 3, 4 during battle</small>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <!-- Permanent Slot 1: Gandiva Dhanush -->
                            <div style="flex:1;padding:8px 10px;border-radius:10px;background:linear-gradient(135deg,rgba(11,26,44,0.9),rgba(6,17,30,0.95));border:1.5px solid ${isGandivaActive ? 'var(--gold)' : 'rgba(245,197,66,0.3)'};box-shadow:${isGandivaActive ? '0 0 14px var(--gold-glow)' : 'none'};display:flex;align-items:center;gap:8px;cursor:pointer;" onclick="GameShop.equipWeapon('gandiva')">
                                <span style="font-size:20px;color:${gandivaWep.color};">${gandivaWep.icon}</span>
                                <div style="flex:1;overflow:hidden;">
                                    <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:800;color:#ffffff;">[1] Gandiva</div>
                                    <small style="color:${isGandivaActive ? 'var(--gold-bright)' : 'var(--mint)'};font-size:10px;">${isGandivaActive ? '★ In Hand' : 'Core Bow'}</small>
                                </div>
                            </div>
                            ${slotsHtml}
                        </div>
                    </div>
                `;

                itemsHtml = weapons.map(function (w) {
                    const isUnlocked = progress.weapons.includes(w.id);
                    const isEquippedInHand = progress.equippedWeapon === w.id;
                    const isInLoadout = w.id === "gandiva" || activeLoadout.includes(w.id);
                    const isSelected = selectedWep.id === w.id;

                    let btn = "";
                    if (w.id === "gandiva") {
                        btn = isEquippedInHand
                            ? `<span class="action-btn equipped">In Hand</span>`
                            : `<button type="button" class="action-btn equip" onclick="GameShop.equipWeapon('gandiva')">Hold</button>`;
                    } else if (isEquippedInHand) {
                        btn = `<span class="action-btn equipped">In Hand</span>`;
                    } else if (isInLoadout) {
                        btn = `
                            <div style="display:flex;gap:6px;">
                                <button type="button" class="action-btn equip" onclick="GameShop.equipWeapon('${w.id}')">Hold</button>
                                <button type="button" style="padding:6px 10px;border-radius:16px;font-size:11px;border:1px solid rgba(255,255,255,0.2);color:var(--muted);background:none;" onclick="GameShop.toggleLoadout('${w.id}')">✕</button>
                            </div>
                        `;
                    } else {
                        btn = `<button type="button" class="action-btn buy" onclick="GameShop.toggleLoadout('${w.id}')">+ Add to Deck</button>`;
                    }

                    const badgeRefuel = w.cooldown > 0 ? `<span style="font-size:10px;color:#ff8a80;margin-left:6px;">(${w.cooldown}s refuel)</span>` : `<span style="font-size:10px;color:var(--mint);margin-left:6px;">(unlimited)</span>`;

                    return `
                        <div class="item-list-card ${isSelected ? 'selected' : ''}" onclick="GameShop.selectWeapon('${w.id}')">
                            <div class="item-list-left">
                                <span class="item-list-icon" style="color:${w.color};text-shadow:0 0 10px ${w.color};">${w.icon}</span>
                                <div class="item-list-info">
                                    <strong>${w.name} ${badgeRefuel}</strong>
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
                        btn = `<button type="button" class="action-btn buy" onclick="GameShop.unlockHero('${c.id}')">Unlock</button>`;
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
                            <div class="eyebrow">Celestial Arsenal &amp; 4-Slot Loadout</div>
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

                        <div class="shop-list-box">
                            ${loadoutDeckHtml}
                            ${itemsHtml}
                        </div>
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

        toggleLoadout: function (id) {
            if (id === "gandiva") return;
            const progress = GameConfig.loadProgress();
            if (!Array.isArray(progress.activeLoadout)) progress.activeLoadout = ["agni", "vajra", "brahmashira"];

            const idx = progress.activeLoadout.indexOf(id);
            if (idx >= 0) {
                if (progress.activeLoadout.length > 1) {
                    progress.activeLoadout.splice(idx, 1);
                    if (progress.equippedWeapon === id) {
                        progress.equippedWeapon = "gandiva";
                    }
                }
            } else {
                if (progress.activeLoadout.length >= 3) {
                    progress.activeLoadout.shift(); // replace oldest wand
                }
                progress.activeLoadout.push(id);
                progress.equippedWeapon = id;
            }
            GameConfig.saveProgress(progress);
            GameAudio.play("coin");
            GameShop.render();
        },

        equipWeapon: function (id) {
            const progress = GameConfig.loadProgress();
            progress.equippedWeapon = id;
            // Ensure equipped weapon is in loadout if it's a magical wand
            if (id !== "gandiva" && !progress.activeLoadout.includes(id)) {
                if (progress.activeLoadout.length >= 3) progress.activeLoadout.shift();
                progress.activeLoadout.push(id);
            }
            GameConfig.saveProgress(progress);

            const wep = GameWeapons.getById(id);
            if (wep.type === "chakra") GameAudio.play("chakra");
            else if (wep.id === "nagastra") GameAudio.play("nagastra");
            else if (wep.id === "vajra") GameAudio.play("zap");
            else if (wep.id === "agni") GameAudio.play("fire");
            else GameAudio.play("coin");

            if (global.GameUI) global.GameUI.notify("Equipped", `${wep.name} ready in hand!`);
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
            if (!progress.characters.includes(id)) {
                progress.characters.push(id);
            }
            progress.selectedCharacter = id;
            GameConfig.saveProgress(progress);

            GameAudio.play("shankha");
            GameShop.render();
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
