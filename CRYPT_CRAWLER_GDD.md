# Crypt Crawler — Game Design Document
*A single-player turn-based dungeon card game. Dark, moody, puzzle-forward.*

---

## Vision

Crypt Crawler is a card-based dungeon crawler where **every monster is a puzzle**. The player navigates a small procedurally-generated crypt, gathering information through scouting, setting traps, and managing a card deck to defeat unique enemies. The dungeon is alive — monsters react to sound and light between turns, roam, reproduce, and investigate.

The tone is dark gothic horror, inspired by Darkest Dungeon. Art will come from **Latiencur's Crypt Stalkers** card deck (gothic creature illustrations).

---

## Core Loop

```
MAP SCREEN
  ↓  Player scouts / moves / prepares
DUNGEON TURN TICKS — monsters react
  ↓  Player enters room
COMBAT SCREEN — turn-based card battle
  ↓  Victory / Flee
MAP SCREEN — loot spent, deck upgraded
  ↓  ...
BOSS ROOM — The Lich King
```

---

## Dungeon Structure

### Layout
7 rooms, fixed-slot, branching graph:

```
        [BOSS]
       /      \
  [BR1]       [BR2]    ← shop or rest
      |  [MID]  |      ← combat
  [LEFT]     [RIGHT]   ← combat
        \    /
        [START]
```

- **Start**: Crypt Entrance. Player begins here, no enemies.
- **Left / Right**: Two combat rooms on the first branch.
- **Mid**: Third combat room, accessible from left or right.
- **Branch 1 / Branch 2**: One is always a Rest room. The other is Shop (60%) or a second Rest room.
- **Boss**: The Lich's Throne. Always last.

### Room States
| State | Meaning |
|-------|---------|
| `locked` | Invisible to player. Cannot be entered or selected. |
| `reachable` | Adjacent to visited room. Visible but fog-of-war on contents. |
| `visited` | Player has been here. Name revealed. |
| `cleared` | All enemies defeated (or room was non-combat). Connections unlocked. |

### Movement Rules
- Player can only move to rooms **directly connected** to their current position.
- Cleared rooms stay accessible for backtracking.
- **Blocked doors** (🚧, 10g) prevent monster roaming through that connection.

---

## Dungeon Turn System

Every player action advances the dungeon clock by one **Dungeon Turn**. Between turns, the monster AI ticks.

### Actions That Cost a Dungeon Turn
| Action | Noise Level |
|--------|-------------|
| Move to adjacent room | Medium |
| Listen at door | Quiet |
| Peek through keyhole | Quiet |
| Full scout | Quiet (but risky — can attract) |
| Combat (victory or flee) | Loud |
| Rest | Quiet |
| Shop visit | Quiet |

### Monster AI Behaviours (per turn)

Each monster type has specific inter-room AI that fires every dungeon turn:

| Monster | Behaviour |
|---------|-----------|
| **Ravager Rat** | Noise-attracted (moves toward player on medium+ noise). Roams randomly. **Reproduces** 40% chance/turn (+1 rat in their room). |
| **Rotting Zombie** | Noise-attracted. Roams. Sent by Necromancer to investigate. |
| **Mournful Ghost** | **Light-flees** on loud noise (moves away from player). Roams. |
| **Blood Wraith** | Light-flees on loud noise. Stays put otherwise. |
| **Necromancer** | **Sends a Zombie** to investigate adjacent rooms on medium+ noise (60% chance). Does not roam itself. |
| **Skeleton** | Static. Does not roam or react. |
| **Wailing Banshee** | Static. Does not roam. |
| **Lurking Ghoul** | Static. Does not roam. |
| **The Shadow** | Roams randomly (20%/turn). |
| **Boss Lich** | Static. Boss room only. |

**Consequences of AI movement:**
- A monster that moves into a previously-cleared room restores it to `reachable` with new enemies.
- Rats breeding can overflow a room unexpectedly.
- The Necromancer's zombie scout may appear in an adjacent room you thought was safe.

---

## Scouting & Information

The player has **no knowledge** of enemy contents when entering a new area. They must spend dungeon turns to gather intel, accepting risk each time.

### Scout Tiers
| Action | Cost | What You Learn |
|--------|------|---------------|
| 👂 **Listen** | 1 dungeon turn (quiet) | Ambient sound hint (room's flavour text) |
| 🔑 **Peek** | 1 dungeon turn (quiet) | Rough count ("a few creatures") + first enemy type emoji |
| 🕵 **Full Scout** | 1 dungeon turn (quiet) | Full enemy list by name |

The enemy count badge on the map tile is **hidden** until scouted. The player sees no `3✖` badge — only what they've earned through scouting.

---

## Preparation System

Before entering a room the player can:

| Action | Cost | Effect |
|--------|------|--------|
| 🪤 **Snare** | 15g | Enemies skip their first attack turn |
| 💡 **Flash Trap** | 20g | Damages all enemies on entry. Disrupts Shadows. |
| 🔔 **Noise Lure** | 20g | Reduces enemy count (draws one away) |
| 🚧 **Block Door** | 10g | Seals connection — prevents monster roaming through it |

---

## Combat System

Turn-based card game. Player goes first.

### Resources
- **HP**: Starts at 60. Carried between rooms.
- **Energy**: 3 per turn (can be permanently upgraded to 4 or 5 via Soul Crystal).
- **Block**: Absorbs damage before HP. Resets each turn.

### Turn Structure
1. Draw 5 cards from deck.
2. Play cards spending energy.
3. End Turn → enemies act → statuses tick → new turn.

### Cards

**Starter Deck (11 cards)**
| Card | Cost | Type | Effect |
|------|------|------|--------|
| Slash ×3 | 1 | Attack | 8 dmg |
| Iron Ward ×2 | 1 | Defend | 7 block |
| Fortify | 0 | Defend | 4 block (free) |
| Swift Cut | 1 | Attack | 10 dmg |
| Heavy Bash | 2 | Attack | 14 dmg |
| Soul Drain | 1 | Attack | 6 dmg, heal 3 |
| Hex Bolt | 1 | Attack | 5 dmg + Weaken |
| Meditate | 1 | Skill | Draw 2 cards |

**Shop / Reward Cards (15 total)**
Cleave, Backstab, Bloodlust, Stone Wall, Refocus, Envenom, Blind Dust, Sunder, Power Word, Holy Water, Holy Smite, Bell of Silence, Burst Strike, Mass Smite, Dispel.

### Status Effects
| Effect | Icon | Description |
|--------|------|-------------|
| Bleed | 🩸 | Lose HP per turn, ticks down |
| Weaken | 💔 | Deal 25% less damage |
| Blind | 👁️ | 30% miss chance |
| Silence | 🔇 | Can't play Skill cards |
| Poison | 🐍 | Lose HP per turn (stacks, doesn't tick down) |
| Stun | ⚡ | Skip next action |

### Flee
The player can flee combat at any time. They return to the map at the room they fled from, with current HP. The dungeon turn ticks (medium noise).

---

## Monster Roster & Combat Mechanics

Each monster has a **unique in-combat mechanic** that requires a different strategy:

| Monster | HP | ATK | Mechanic | Strategy |
|---------|----|-----|----------|----------|
| 🐀 Ravager Rat | 8 | 3 | **Swarm**: each living rat chips 1 dmg/turn | Use AoE (Mass Smite, Cleave). Kill fast. |
| 💀 Skeleton | 28 | 7 | **Reassemble**: revives at 5 HP unless killed with 10+ finishing blow | Save Burst Strike for the kill. |
| 🧟 Rotting Zombie | 40 | 9 | **Controlled**: doubles ATK if Necromancer is alive | Kill the Necromancer first. |
| 👻 Mournful Ghost | 22 | 12 | **Phase**: 50% evade vs physical. Holy always hits | Use Holy Water, Holy Smite. |
| 🧛 Blood Wraith | 30 | 10 | **Lifesteal**: heals 50% of damage dealt. Holy ×1.5 | Burst it down; holy cards are essential. |
| 👁️ Wailing Banshee | 22 | 8 | **Drain Aura**: −1 max energy/turn (min 1). Silence stops it | Bell of Silence immediately. |
| 🧙 Necromancer | 20 | 6 | **Summon**: revives/summons a Zombie every 2 turns | Priority target 1. |
| 🦴 Lurking Ghoul | 32 | 6 | **Ambush**: crouches 2 turns, then leaps for 3× damage | Don't idle. Build block fast. |
| 🌑 The Shadow | 25 | 11 | **Light Drain**: reduces light level each turn. Darkness = discard a card | Kill quickly or carry torches. |
| ☠️ Lich King (Boss) | 90 | 15 | **Raise Dead**: revives fallen enemies each round | AoE to keep adds down. High DPS. |

---

## Shop

The Wandering Merchant appears in one room per run (60% chance, otherwise replaced by a Rest room).

| Item | Cost | Effect |
|------|------|--------|
| 🧪 Vial of Blood | 20g | Restore 15 HP |
| ⚗️ Dark Elixir | 35g | Restore 30 HP |
| 💎 Soul Crystal | 40g | Permanently +1 max energy |
| 🕯️ Curse Removal | 25g | Remove any card from your deck |
| Cards ×3 | 25g each | 3 random cards from the reward pool |

---

## Rest Rooms

Restore **30% of max HP** (18 HP at base stats). Cannot be re-rested. Cleared after first use.

---

## Map Fog of War

- **Unvisited rooms** appear nearly invisible (18% opacity), no name, no enemy count.
- **Adjacent unvisited rooms** appear at full opacity but show `???` name and no enemy count.
- **Enemy count badge** is hidden unless the room has been scouted (Peek or Full Scout tier).
- **Corridors** only appear if at least one connected room has been visited.
- **Labels** only appear on visited/cleared rooms, or on the current room (always labeled).

---

## Debug Mode

A developer tool accessible via the **🛠 Debug** toggle in the map side panel.

**Debug mode enables:**
- Full visibility of all rooms (names, enemy counts, enemy types) regardless of fog
- Click-to-teleport to any room without adjacency restrictions
- A live AI action log panel (right side overlay) showing every monster movement, reproduction event, or door-block, with the dungeon turn number
- Turn counter visible in map UI

---

## Planned Features (Backlog)

- **F-10–F-16**: Remaining monster AI — Witch enchantment, Demon summoning circle, Cultist ritual, Grave Robber avoidance, Bat light phobia, Skullflower spreading, Gutborn burst + larvae
- **F-18**: Full ambient monster room behaviour (sound/light leaking between rooms influences idle state)
- **F-19**: Dungeon clock pressure — escalating consequences the longer the player takes (ticks 4–6: enemies alerted; 7–9: spawns in visited rooms; 10+: roaming monster enters current room)
- **F-21**: Light level system — deeper integration with Bat/Shadow/Vampire/Ghost behaviour
- **F-24**: Bestiary — persistent knowledge system that fills in as player encounters each monster
- **Art integration** — swap ASCII tile interiors for Latiencur's Crypt Stalkers card art

---

## Tech Stack

- **React + Vite** (JSX, inline styles, no Tailwind)
- Single `.jsx` file component architecture
- No external state library
- Player copies file to local repo, commits manually

### Art Pipeline
When Latiencur's art is integrated:
```js
const CREATURE_IMAGES = {
  gutborn:     "https://img.itch.zone/aW1nLzI1OTE5MzkxLmpwZw==/original/cctu34.jpg",
  demon:       "https://img.itch.zone/aW1nLzI1NzA4OTM1LmpwZw==/original/Ubc9%2Fm.jpg",
  skeleton:    "https://img.itch.zone/aW1nLzI1NTE2MTA0LmpwZw==/original/Q5%2BMoM.jpg",
  // ... (see full list in codebase)
};
```
Each `RoomTile` / `CurrentRoomTile` background will swap from CSS to `background-image: url(CREATURE_IMAGES[primaryEnemy])`.

---

*Document version: 0.4 — March 2026*
