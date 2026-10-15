<div align="center">

# ⛏️ Minecraft Creative Inventory Collection Tracker

[![Live Demo](https://img.shields.io/badge/Live_Demo-mc--tracker.modhtom.com-7df53b?style=for-the-badge&logo=googlechrome&logoColor=white)](https://mc-tracker.modhtom.com/)
[![Version](https://img.shields.io/badge/Minecraft-26.2_%22Chaos_Cubed%22-blue?style=for-the-badge&logo=curseforge&logoColor=white)](https://mc-tracker.modhtom.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A pixel-accurate Minecraft Creative Mode inventory menu built to browse and track every collectible item in Minecraft Java Edition 26.2 ("Chaos Cubed").**

[🌐 **Explore the Live App**](https://mc-tracker.modhtom.com/) • [Report Bug](https://github.com/MODHTOM/MineInvo/issues) • [Request Feature](https://github.com/MODHTOM/MineInvo/issues)

</div>

---

## 📸 Overview

The **Minecraft Creative Inventory Collection Tracker** is designed for completionists, survival builders, and collectors. It faithfully recreates the classic stone-gray Creative Inventory GUI with authentic slot bevels, top/bottom category tabs, sound effects, and item textures.

Every item can be marked as collected or uncollected, pinned into a quick Hotbar, and backed up to JSON.

---

## 🌟 Features

- **🎮 Authentic Creative GUI:** Faithfully reproduces the 9-column Creative inventory menu, borders, scrollbar, and seamless tab connections.
- **📱 Fully Mobile-Friendly:** Automatically scales to fit any smartphone viewport (from 320px width up to 4K desktop) without clipping or horizontal overflow.
- **👆 Touch-Swipe Scrolling:** Swipe up and down directly across the item grid to smoothly browse item rows on mobile screens.
- **🏷️ Mobile Active Item Banner:** Displays the inspected item's name, ID, category, collection toggle, and pin button upon tapping any slot.
- **🧱 Complete 26.2 "Chaos Cubed" Dataset:**
  - **1,537 Total Items** with 100% texture coverage in crisp pixel art.
  - Sourced from official Java Edition 26.2 registries.
  - Includes all new 26.2 content: **Cinnabar Block Set**, **Sulfur Block Set**, **Sulfur Spikes**, **Potent Sulfur**, **Bucket of Sulfur Cube**, **Sulfur Cube Spawn Egg**, and the **"Bounce" Music Disc** by *fingerspit*.
- **🛡️ Collectible vs. Operator Utilities:** Clearly separates 1,518 survival-obtainable items from 19 technical/operator blocks (Command Blocks, Barriers, Debug Stick, Light blocks, etc.).
- **📈 Minecraft XP Progress Bar:** Live XP level counter showing total collected items, completion percentage, and category completion with victory confetti upon hitting 100%.
- **💾 Local Persistence & Backup:**
  - Auto-saves progress to browser `localStorage`.
  - **Export Backup:** One-click download of collection progress as a `.json` backup file.
  - **Import Backup:** Restore progress from a saved `.json` file or by pasting raw JSON with format validation.
  - **Reset Progress:** Safe reset with a confirmation modal.
- **🔊 Web Audio Sound Effects:** Real-time synthesized clicks, collection pops, and level-up chimes with a mute button.

---

## 🧭 Category Navigation

### Top Tabs
- 🧱 **Building Blocks** (`minecraft:bricks`)
- 🧶 **Colored Blocks** (`minecraft:cyan_wool`)
- 🌿 **Natural Blocks** (`minecraft:grass_block`)
- 🪧 **Functional Blocks** (`minecraft:oak_sign`)
- 🔴 **Redstone Blocks** (`minecraft:redstone`)
- 📚 **Saved Hotbars & Pinned Goals** (`minecraft:bookshelf`)
- 🧭 **Search All Items** (`minecraft:compass`)

### Bottom Tabs
- ⛏ **Tools & Utilities** (`minecraft:diamond_pickaxe`)
- ⚔ **Combat** (`minecraft:netherite_sword`)
- 🍎 **Food & Drinks** (`minecraft:golden_apple`)
- 🪙 **Ingredients** (`minecraft:iron_ingot`)
- 🥚 **Spawn Eggs** (`minecraft:creeper_spawn_egg`)
- 🕹 **Operator Utilities** (`minecraft:command_block`)
- 📦 **All Obtainable Items** (`minecraft:chest`)

---

## ⌨️ Controls & Shortcuts

| Action | Desktop | Mobile / Touch |
|---|---|---|
| Toggle item collected status | `Left Click` on item slot | `Tap` item slot |
| Pin / unpin item to Hotbar | `Shift + Left Click` or `Right Click` | Tap `★ Pin` on active item banner |
| Scroll rows | `Mouse Wheel` or drag scroll thumb | `Swipe Up / Down` on inventory grid |
| Jump to Search | Press `/` on your keyboard | Tap Search (Compass) tab |
| Clear Search | Press `Esc` or click `Clear` | Tap `Clear` button |
| Page Navigation | `◀` / `▶` buttons | `◀` / `▶` buttons |

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** Custom Minecraft pixel-accurate CSS (inset borders, bevels, `@font-face` Mojangles/Minecraftia)
- **Audio:** Web Audio API procedural sound synthesizer (zero external audio file latency)
- **Hosting:** [Netlify](https://www.netlify.com/) (SPA redirect rules & immutable asset caching via `netlify.toml`)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (version 18 or newer)
- npm (version 9 or newer)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/MODHTOM/MineInvo.git
cd MineInvo

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Production Build
```bash
# Compile and optimize for production
npm run build

# Preview production build locally
npm run preview
```

---

## ☁️ Deployment

This project includes a pre-configured `netlify.toml` file ready for one-click deployment:

1. Push your code to GitHub.
2. In [Netlify](https://app.netlify.com/), click **"Add new site"** → **"Import an existing project"**.
3. Select your repository. Netlify will automatically detect:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **"Deploy site"**.

---

## 📄 License & Disclaimer

This project is open-source under the [MIT License](LICENSE).

> **Disclaimer:** NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.
> Minecraft is a trademark of Mojang AB / Microsoft Corporation. All Minecraft assets, textures, names, and sounds belong to Mojang AB.
