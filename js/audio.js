// Web Audio Synthesizer Engine
(function (global) {
    "use strict";

    let audioCtx = null;
    let soundEnabled = true;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioClass = window.AudioContext || window.webkitAudioContext;
            if (AudioClass) audioCtx = new AudioClass();
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume().catch(function () {});
        }
        return audioCtx;
    }

    const GameAudio = {
        isEnabled: function () {
            return soundEnabled;
        },

        toggleSound: function () {
            soundEnabled = !soundEnabled;
            if (soundEnabled) GameAudio.play("bullseye", 1);
            return soundEnabled;
        },

        play: function (type, extra = 1) {
            if (!soundEnabled) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const now = ctx.currentTime;

                if (type === "shankha") {
                    // Sacred Shankha (Conch Horn)
                    [110, 112].forEach(function (f) {
                        const osc = ctx.createOscillator();
                        const filter = ctx.createBiquadFilter();
                        const gain = ctx.createGain();
                        osc.type = "sawtooth";
                        osc.frequency.setValueAtTime(f, now);
                        osc.frequency.exponentialRampToValueAtTime(f * 1.55, now + 0.8);
                        osc.frequency.exponentialRampToValueAtTime(f * 1.33, now + 1.8);
                        filter.type = "bandpass";
                        filter.frequency.setValueAtTime(360, now);
                        filter.frequency.exponentialRampToValueAtTime(850, now + 0.6);
                        filter.frequency.exponentialRampToValueAtTime(420, now + 1.8);
                        filter.Q.value = 4.5;
                        gain.gain.setValueAtTime(0.001, now);
                        gain.gain.linearRampToValueAtTime(0.07, now + 0.4);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
                        osc.connect(filter);
                        filter.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(now);
                        osc.stop(now + 2.1);
                    });
                    return;
                }

                if (type === "bullseye") {
                    // Wooden impact + ascending pentatonic raga chime
                    const thud = ctx.createOscillator();
                    const thudGain = ctx.createGain();
                    thud.type = "triangle";
                    thud.frequency.setValueAtTime(120, now);
                    thud.frequency.exponentialRampToValueAtTime(40, now + 0.16);
                    thudGain.gain.setValueAtTime(0.14, now);
                    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                    thud.connect(thudGain);
                    thudGain.connect(ctx.destination);
                    thud.start(now);
                    thud.stop(now + 0.2);

                    const ragaNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                    const noteIdx = Math.min(Math.max(0, (extra || 1) - 1), ragaNotes.length - 1);
                    const chimeFreq = ragaNotes[noteIdx];

                    [1, 2.76].forEach(function (mult, idx) {
                        const chime = ctx.createOscillator();
                        const cGain = ctx.createGain();
                        chime.type = "sine";
                        chime.frequency.setValueAtTime(chimeFreq * mult, now);
                        cGain.gain.setValueAtTime(0.05 / (idx + 1), now);
                        cGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.7 - idx * 0.15);
                        chime.connect(cGain);
                        cGain.connect(ctx.destination);
                        chime.start(now);
                        chime.stop(now + 0.75);
                    });
                    return;
                }

                if (type === "zap" || type === "electric") {
                    // High-voltage electric crackle
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(850 + Math.random() * 400, now);
                    osc.frequency.exponentialRampToValueAtTime(95, now + 0.22);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.23);
                    return;
                }

                if (type === "fire" || type === "flame") {
                    // Roaring fireball eruption
                    const osc = ctx.createOscillator();
                    const filter = ctx.createBiquadFilter();
                    const gain = ctx.createGain();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(140, now);
                    osc.frequency.linearRampToValueAtTime(60, now + 0.3);
                    filter.type = "lowpass";
                    filter.frequency.setValueAtTime(400, now);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.33);
                    return;
                }

                if (type === "chakra") {
                    // Sudarshana Chakra spinning hum & razor slice
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                    osc.frequency.exponentialRampToValueAtTime(520, now + 0.4);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.43);
                    return;
                }

                if (type === "nagastra") {
                    // Serpent Hiss & strike
                    const osc = ctx.createOscillator();
                    const filter = ctx.createBiquadFilter();
                    const gain = ctx.createGain();
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(920, now);
                    osc.frequency.linearRampToValueAtTime(320, now + 0.35);
                    filter.type = "bandpass";
                    filter.frequency.setValueAtTime(1800, now);
                    filter.Q.value = 5.0;
                    gain.gain.setValueAtTime(0.07, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.36);
                    return;
                }

                if (type === "coin") {
                    // Metallic Gold Coin Clink
                    [987.77, 1318.51].forEach(function (f, i) {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = "sine";
                        osc.frequency.setValueAtTime(f, now + i * 0.07);
                        gain.gain.setValueAtTime(0.001, now);
                        gain.gain.linearRampToValueAtTime(0.05, now + i * 0.07 + 0.01);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(now + i * 0.07);
                        osc.stop(now + i * 0.07 + 0.32);
                    });
                    return;
                }

                if (type === "pull") {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(110 + extra * 60, now);
                    gain.gain.setValueAtTime(0.015, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.14);
                    return;
                }

                if (type === "release") {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(260, now);
                    osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);
                    gain.gain.setValueAtTime(0.06, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.18);
                    return;
                }

                if (type === "whoosh") {
                    const osc = ctx.createOscillator();
                    const filter = ctx.createBiquadFilter();
                    const gain = ctx.createGain();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(950, now + 0.12);
                    osc.frequency.exponentialRampToValueAtTime(180, now + 0.32);
                    filter.type = "bandpass";
                    filter.frequency.setValueAtTime(600, now);
                    filter.frequency.linearRampToValueAtTime(1400, now + 0.12);
                    gain.gain.setValueAtTime(0.001, now);
                    gain.gain.linearRampToValueAtTime(0.04, now + 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.35);
                    return;
                }
            } catch (e) {
                // Non-blocking audio
            }
        }
    };

    global.GameAudio = GameAudio;
    global.sound = GameAudio.play;
})(window);
