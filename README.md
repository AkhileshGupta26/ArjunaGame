# ARJUNA — The Bow & Beyond 🏹

An epic HTML5 Canvas & Web Audio Mahabharata archery trial game with physics-based mechanics, celestial Astras, and legendary chapters.

![Arjuna Game](https://img.shields.io/badge/Theme-Classical%20Epic%20Mythology-gold)
![Platform](https://img.shields.io/badge/Platform-HTML5%20Canvas%20%7C%20Vanilla%20JS-blue)
![Audio](https://img.shields.io/badge/Audio-Procedural%20Web%20Audio%20API-emerald)

---

## 🌟 Overview

Step into the shoes of **Savyasachi Arjuna** and other legendary warriors (**Karna**, **Ekalavya**, **Abhimanyu**) to face the sacred trials of Dhanurveda. Master projectile physics, wind adjustments, and reflection angles across six mythical chapters.

---

## 🏹 Game Features

- **Classical Epic Mythology Aesthetic**:
  - Deep midnight navy skies with twinkling constellations and procedural mountain silhouettes.
  - Regal Gold (`#f5c542`) and Warm Amber accents with Google Fonts *Cinzel Decorative*, *Cinzel*, and *Plus Jakarta Sans*.
  - Procedurally rigged classical archer avatar complete with glowing tilak, golden Kirita (crown), Kavacha armor, and celestial aura.

- **Realistic Archery & Ballistics Physics**:
  - Parabolic gravity trajectories, velocity accumulation, and dynamic crosswinds with directional indicators.
  - **Single-Point Concentration (Ekagrata)**: Slow-motion focus audio and visual cue when drawing the bow beyond critical threshold.
  - **Matsya Vedha (Oil Reflection Trial)**: Aim downward into a bronze oil cauldron to hit the hidden overhead rotating fish target guided solely by golden ripples and reflection mechanics.

- **Modular Architecture (System Design Principles)**:
  - Loosely coupled architecture with decoupled chapter modules (`chapter1.js` through `chapter6.js`).
  - Separation of concerns across Game Engine (`game.js`), Procedural Renderer (`renderer.js`), Character System (`characters.js`), Celestial Armory (`weapons.js`), Audio Synthesis (`audio.js`), and Config (`config.js`).

- **Divine Armory & Astras**:
  - **Gandiva Bow**: The celestial bow gifted by Agni.
  - **Vajra Wand**: Indra's thunderbolt wand with electric arc burst.
  - **Agni Wand**: Flaming fireburst with incendiary trail.
  - **Sudarshana Chakra**: Whirling supreme solar disc with golden trail.
  - **Nagastra**: Serpentine poisonous celestial arrow.
  - **Varuna Wand & Surya Wand**: Water tidal impact and solar blinding burst.
  - **Brahmashira Wand**: Supreme four-headed cosmos-splitting ultimate wand.

- **Hero Selection**:
  - **Arjuna (Savyasachi)**: +25% Draw speed, +10% arrow velocity.
  - **Karna (Radheya)**: Surya's armor, +25% impact power, hit shield.
  - **Ekalavya (Nishada Master)**: Zero breath sway at full draw, +35% bonus Punya coins.
  - **Abhimanyu (Chakravyuha Hero)**: +30% critical strike chance, rapid reload.

- **Pure Procedural Audio**:
  - Zero external MP3/WAV dependencies; 100% synthesized through HTML5 Web Audio API (bow pull, arrow whoosh, target thud, celestial shloka drone, wand electric arc, chakra hum).

---

## 🎮 How to Play

1. **Draw & Aim**: Touch or click and drag backward from the archer to adjust power and angle.
2. **Account for Wind**: Watch the wind indicator pill at the top bar to compensate your trajectory.
3. **Ekagrata Focus**: Hold draw until the aura radiates to trigger sacred focus.
4. **Release**: Release pointer to loose your celestial arrow or wand blast!

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/AkhileshGupta26/ArjunaGame.git

# Navigate to directory
cd ArjunaGame

# Start local server (no external dependencies required)
npm start
# or
node server.js
```

Open your browser at `http://localhost:3000/` and enjoy!

---

## 📜 License

ISC License. Built with devotion to the timeless epic of the Mahabharata.
