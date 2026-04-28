# Crypt Crawler — Game Design Document
*A single-player turn-based dungeon card game. Dark, moody, puzzle-forward.*

> **NOTE:** This GDD describes the original prototype design. The game has evolved into **Crypt Stalkers** with an authored dungeon, narrative, and theme. See **[PALE_VAULT_DESIGN.md](PALE_VAULT_DESIGN.md)** for the current authoritative design.
>
> Key differences from this GDD:
> - **No town.** The dungeon IS the game. No shops, no buildings, no hub.
> - **Salt replaces gold.** The mine's product is the sole resource - hoard it (greed) or spend it on wards/braziers (survival). Salt hoard affects endings.
> - **Traps and blocked doors are free.** They cost a dungeon turn (AI ticks), not currency.
> - **Equipment, consumables, abilities** found in the dungeon via props, not purchased.
> - **Death** reloads from checkpoint (room entry), not town respawn with gold penalty.
> - **Safe rooms** (warded, brazier-lit, sunlit) provide enhanced rest healing and no ambush risk.

---

## Vision

Crypt Crawler is a card-based dungeon crawler where **every dungeon is a puzzle**. The player navigates a small procedurally-generated crypt, gathering information through scouting, setting traps, and managing equipment and abilities defeat unique enemies. The dungeon is alive — monsters react to sound and light between turns, roam, reproduce, and investigate.

The tone is dark gothic horror, inspired by Darkest Dungeon. Art will come from **Latiencur's Crypt Stalkers** card deck (gothic creature illustrations).

---

## Core Loop

Town:
Player can perform different actions at different buildings, and upgrade them
* Smithy: Purchase equipment
* General store: Purchase consumables
* Tavern: Learn about other dungeons
* Old Shrine: Unlocks and upgrades divine abilities
* Hunter's lodge: Unlocks and upgrades hunting skills (ranged, scouting, stealth)
* Knight’s Chapterhouse: Train martial abilities and defensive techniques such as shield stances, counterattacks, and heavy weapon mastery.
* Alchemist’s Workshop: Craft potions, toxins, oils, and explosives using materials recovered from dungeons.
* Cartographer’s Study: Improves scouting accuracy, reveals additional dungeon structure, and unlocks advanced mapping tools.

Only Smithy, General Store, and Tavern are unlocked initially.

From the town, the player can move to any unlocked dungeon.
The initial dungeon is smaller, with easier monsters.

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
Randomly generated, number of rooms depending on difficulty.

- **Start**: Crypt Entrance. Player begins here, no enemies.
- **Other rooms**: Rooms form a graph. Each room can have corridors up, left, right or down randomly.
  - 80% of rooms contain monsters, randomly generated at the start of the dungeon.
  - One room in the dungeon is the Boss' Room. It's usually on the far end.

### Room States
| State | Meaning |
|-------|---------|
| `locked` | Invisible to player. Cannot be entered or selected. |
| `reachable` | Adjacent to visited room. Visible but fog-of-war on contents. |
| `visited` | Player has been here. Name revealed. |

### Movement Rules
- Player can only move to rooms **directly connected** to their current position.
- Previously visited rooms stay accessible for backtracking.
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
| Combat (victory or flee) | Loud |
| Rest | Quiet, restores 5HP per dungeon turn (upgradable) |

### Monster AI Behaviours (per turn)

Each monster type has specific inter-room AI that fires every dungeon turn. See the **Monster Roster** section below for the full table including both combat and out-of-combat mechanics.

**Consequences of AI movement:**
- A monster that moves into a previously-cleared room restores it to `reachable` with new enemies.
- Rats breeding can overflow a room unexpectedly.
- The Necromancer's zombie scout may appear in an adjacent room you thought was safe.
- The Grave Robber will loot treasure and try to escape the dungeon.
- Skullflower spreads to unlit rooms, transforming the environment.
- Gutborn Larvae seek hosts — if they infect a creature, it becomes a Gutborn with the host's abilities.

---

## Scouting & Information

The player has **no knowledge** of enemy contents when entering a new area. They must spend dungeon turns to gather intel, accepting risk each time.

### Scout Tiers
| Action | Cost | What You Learn |
|--------|------|---------------|
| 👂 **Listen** | 1 dungeon turn (quiet) | Ambient sound hint (room's flavour text) |
| 🔑 **Peek** | 1 dungeon turn (quiet) | Rough count ("a few creatures") + first enemy type emoji |

The enemy count badge on the map tile is **hidden** until scouted. The player sees no `3✖` badge — only what they've earned through scouting.

---

## Preparation System

Once a room is cleared, the player can set traps for incoming monsters:

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
- **HP**: Starts at 40. Carried between rooms. Fully restored on dungeon exit.

### Positioning
- Enemies can be in front or back row
- Melee attacks only reach front row. Ranged can reach back row

### Turn Structure
 Player selects an available move (depends on current equipment, inventory, known abilities, etc.)
 Player selects target(s)
 Monsters attack
 Statuses tick

### Moves
Available moves are: 
Attack: using current weapon
Switch weapon: To any other
Attempt to flee
More unlocked later.

### Status Effects
| Effect | Icon | Description |
|--------|------|-------------|
| Bleed | 🩸 | Lose HP per turn, ticks down |
| Weaken | 💔 | Deal 25% less damage |
| Blind | 👁️ | 30% miss chance |
| Silence | 🔇 | Can't use Skills |
| Poison | 🐍 | Lose HP per turn (stacks, doesn't tick down) |
| Stun | ⚡ | Skip next action |

### Flee
The player can attempt to flee combat at any time, towards any direction. If unsuccessful, monsters get one more turn. If successful, the player appears in the new room. The dungeon turn ticks (medium noise). After that, some monsters might follow in upcoming turns.

---

## Weapons
There are 10 different main weapons, to be used in the main/side hand:
- Longsword
- Dagger
- Claymore
- Battleaxe
- Halberd
- Flail
- Bow
- Arquebus
- Fists
- Shield

Each weapon:
- is one-handed or two handed.
- has different reach
- has different associated abilities

There can be other weapons for quick use from the belt, like thrown daggers, darts, thrown axes... Those will be defined later.

---

## Monster Roster

Each monster has unique **combat** and **out-of-combat** mechanics:

| Monster | HP | ATK | Combat Mechanic | Strategy | Out of Combat Mechanic | Movement | Sees in Dark | Reacts to Light | On Closed Doors |
|---------|----|-----|-----------------|----------|------------------------|----------|:------------:|-----------------|-----------------|
| 🐀 Ravager Rat | 3 | 1 | Low HP, low damage, each rat has a chance to reproduce each turn | Attacks that affect multiple enemies | Each rat has a chance to reproduce each dungeon turn | Frequent, random | No | No | Squeezes under |
| 👁️ Wailing Banshee | 12 | 3 | Ranged. Scream drains strength and can cause you to lose a turn | Attack with ranged weapons before it drains you | Makes a lot of noise. Destroys valuables? | Occasional, random | Yes | No | Blocked |
| 🧛 Vampire | TBD | TBD | TBD | TBD | TBD | TBD | Yes | TBD | TBD |
| 👻 Mournful Ghost | 12 (75% miss) | 5 (ignores armor) | Does nothing unless you make loud noises. Armor penetration, ethereal (hits can miss?) | Ignore it | Armor penetration, ethereal (hits can miss?) | No | Yes | No | Ignores them |
| 🦴 Lurking Ghoul | 14 | 5 (15 from hidden) | Starts hidden, attacks hard, hides again | Hit when visible. Time attacks, defend the turn before. Don't lose sight. | Finds nearest human, tries to hide or ambush to feed (can attack other monsters) | Tends to hide, or moves to ambush if detecting victims | Yes | Moves away to hide | Ignores, waits behind |
| 🌑 The Shadow | TBD | TBD | Devours light | TBD | TBD | TBD | Yes | TBD | Goes through |
| 🦇 Bat | TBD | TBD | Sees in the dark — TBD | TBD | TBD | TBD | Yes | TBD | Blocked |
| 🧙 Necromancer | 8 | 6 | Ranged attacks, curses, brings back fallen zombies/skeletons | Kill it fast with ranged attacks | Summons zombies every 3 turns; keeps a few around, sends rest to attack player if aware | Stationary | No | Carries light; sends zombies to investigate | Opens |
| 🗡️ Grave Robber | 10 | 0 | Moves away, looks for an opening, then flees | Block exits and corner him | Loots everything it can. Carries a torch, makes light. | Away from danger, towards exit. Leaves if reaches exit. | No | Carries light, evades other lights | Opens, picks locks, disables traps |
| 🧟 Rotting Zombie | 8 | 3 | Just attacks | Destroy its commander, it becomes inert | Tied and controlled by necromancer, cultist, or witch | Goes where master commands; returns to master if under attack | No | Ignores | Bashes them |
| 🧹 Witch | 10 | TBD | Powerful telegraphed magic attacks? Puts you in trance/stun? | TBD | TBD | TBD | No | TBD | Opens |
| 🌿 Skullflower | 12 base (increases; fire/light stops growth) | 5 | Controls other dead enemies? | Burn it, expose it to light | Slowly grows bigger (HP increases). Spreads to unlit rooms. Loses HP in lit rooms. Transforms environment (destroys loot? weakens doors?)? | No, but propagates to other rooms | Senses (no vision) | Withers | Can spread through |
| ⛪ Cultist | 10 | 4 | TBD | TBD | TBD | TBD | No | TBD | Opens |
| 💀 Skeleton | 16 | 7 | Attacks, becomes pile of bones when defeated, reassembles after a turn | Kill before it comes back. Bludgeoning defeats permanently. | Scouts the dungeon | Scouts the dungeon | Yes | Investigates | Bashes them |
| 👿 Demon | 150 | 20 | Regenerates, multiple attacks per turn? | Don't let it be summoned | Regenerates, multiple attacks per turn? | TBD | Yes | TBD | Destroys |
| 🪱 Gutborn | Depends on host | Depends on host (no advanced abilities) | Whatever the host did + generate larvae | Kill while larva, or deal with as host (minus advanced abilities) | Spawns a larva | Seeks more hosts | Depends on host | Avoids | As host |
| 🐛 Gutborn Larva | 1 | 0 (takeover if unseen) | Tries to take you or other creatures over. Telegraphs attack. | Kill before it infects. Redirect to enemies. | Infects a corporeal host. After 3 turns, becomes Gutborn. | Towards life, flees light | No | Flees | Squeezes under |
| ☠️ Lich King (Boss) | 90 | 15 | Revives fallen enemies each round | AoE to keep adds down. High DPS. | Static. Boss room only. | Static | Yes | TBD | N/A |


## Map Fog of War

- **Unvisited rooms** appear nearly invisible (18% opacity), no name, no enemy count.
- **Adjacent unvisited rooms** appear at full opacity but show `???` name and no enemy count.
- **Enemy count badge** is hidden unless the room has been scouted (Peek or Full Scout tier).
- **Corridors** only appear if at least one connected room has been visited.
- **Labels** only appear on visited rooms, or on the current room (always labeled).

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
