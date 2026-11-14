# GAIC_We_are_going_on_an_Adventure
# QVAC Offline Text Adventure

An interactive, terminal-based text adventure game powered entirely by local AI inference using the **QVAC JavaScript SDK**. Play branching narratives across multiple genres with zero internet connection required after initial model setup.

---

## 📖 Game Description

**QVAC Offline Text Adventure** puts you in the center of a dynamic, AI-directed story directly inside your console. At the start of each session, you choose from three distinct worlds:

1. **Dark Fantasy** — Explore ancient crypts, wield forbidden magic, and survive deadly monsters.
2. **Sci-Fi** — Navigate derelict space stations, alien anomalies, and the dangers of deep space.
3. **Cyberpunk** — Hack mega-corporations and survive high-stakes encounters in neon-lit streets.

Each turn, the local Dungeon Master model (`LLAMA_3_2_1B_INST_Q4_0`) generates a concise, suspenseful narrative paragraph and presents **3 distinct choices**. Your decisions shape the escalating tension across a structured **6-turn arc**, culminating in a unique conclusion based on your final move.

---

## ⚙️ Token Usage & Context Architecture

To ensure fast inference speeds and stay safely within the **1,024-token offline context window**, the game enforces strict token budgeting:

| Metric | Allocation / Limit | Purpose |
| :--- | :--- | :--- |
| **Total Context Ceiling** | `1,024 tokens` | Maximum offline context window supported per inference pass. |
| **Output per Turn** | `30–70 tokens` (`max_tokens: 75`) | Caps each AI response to 1 suspenseful paragraph (1–2 sentences) plus 3 brief choices. |
| **System Prompt** | `~75 tokens` | Defines the selected genre, formatting rules, and turn-waiting behavior. |
| **User Prompt per Turn** | `~15–25 tokens` | Passes the player's selected option (`1`, `2`, or `3`) and pacing instructions. |
| **Sliding History Window** | `Last 6 messages` (`~300–450 tokens`) | Keeps the system prompt plus the 3 most recent exchanges in memory, preventing context overflow while preserving immediate story continuity. |

**Total Active Context per Prompt:** Roughly **400–550 tokens** per turn—well below the 1,024-token ceiling, guaranteeing smooth, low-latency generation offline.

---

## 🚀 Prerequisites & Installation

* **Node.js** (v18 or higher recommended)
* **Internet connection** (only required on first run to download the quantized model weights)

### Setup

```bash
# 1. Create and enter the project directory
mkdir qvac-text-adventure
cd qvac-text-adventure

# 2. Initialize Node.js with ES Modules
npm init -y
npm pkg set type=module

# 3. Install the QVAC SDK
npm install @qvac/sdk



### 🎮 How to Play

    Save the game code as game.js in your project directory.

    Start the game from your terminal:
    Bash

    node game.js

    Once the model finishes loading into memory, disconnect from the internet if you wish to run completely offline.

    Select your genre (1, 2, or 3).

    Read each turn's scenario and enter 1, 2, or 3 to make your choice (or type exit at any prompt to quit and unload the model cleanly).


###🛠️ Project Structure

qvac-text-adventure/
├── game.js          # Main game loop, genre menu, token windowing, and QVAC SDK calls
├── package.json     # Node.js ES module configuration and @qvac/sdk dependency
└── README.md        # Project documentation
