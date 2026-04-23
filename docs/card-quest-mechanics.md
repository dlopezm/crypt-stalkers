# Card Quest — Game Mechanics Reference

A compiled overview of the mechanics that make up *Card Quest* (Winterspring / Emergent Games, available on Steam, iOS and Android). Compiled from the [Card Quest Wiki](https://card-quest.fandom.com/wiki/Card_Quest_Wiki), official Steam discussions, and Alexander King's [design post-mortem on the game's resource systems](https://blog.literallyaking.com/2025/07/23/design-patterns-for-resource-mechanics-in-card-quest/).

Use this document as a design reference only — exact numbers (caps, damages, costs) may drift between patches.

---

## 1. Core Loop

- You pick a **Class** (Fighter / Rogue / Hunter / Wizard) and optionally a **Subclass** that tweaks stats and starting state.
- You equip items into **Equipment slots**. Each equipped item injects a fixed set of cards into your deck. Your deck is therefore the sum of your gear, not built card-by-card.
- You travel across a **Region** made of branching dungeons. Each node is a combat, a shop, a shrine, a rest, or a story event.
- Combat is **turn-based** on a single horizontal lane with a handful of positional "ranges" (Melee / Short / Long). You play cards until you end the turn; enemies then execute telegraphed actions.
- Between fights you manage **Persistent resources** (HP, Souls, Alcohol, Toxicity, etc.) that don't reset per battle.
- Beat the region boss → unlock perks / items / subclasses → try a harder region or a different class.

---

## 2. Classes

The four base classes and their established subclasses:

| Class | Identity | Subclasses |
|---|---|---|
| **Fighter** | Tanky front-liner. Soaks hits, converts damage into retaliation, struggles to open distance. | Berserker, Paladin, Dwarven Warrior |
| **Rogue** | Tempo / condition abuser. Wins via Hidden, Unaware, and Helpless targets; bleeds and backstabs. | Swashbuckler, Assassin |
| **Hunter** | Ranged kiter. Immune to most "damage on contact" effects; plays a twin Stamina/Arrows economy. | Sharpshooter, Fey Archer, Amazon, Arbalest |
| **Wizard** | Spellcaster. Lowest Stamina but unique secondary resources; massive AoE and crowd control. | Pyromancer, Necromancer, Storm Master, Lich, Enchantress |

Subclasses are unlocked by completing specific in-game conditions (usually: finish a region with a particular build / route / item set).

---

## 3. Equipment Slots

Each class has roughly six slots. Every slotted item contributes a bundle of cards (typically 2–4) to the deck.

### Fighter
- **Style** (school) — Guardian, Berserker, Paladin, etc. Defines passive rules and baseline cards.
- **Primary Weapon** — Arming Sword, Bastard Sword, Long Sword, Flail, Spear, Forest Axe, Black Sword, Holy Sword, Throwing Axes…
- **Secondary** — Heater / Round / Kite / Holy Shield, Hatchet, off-hand weapon.
- **Armor** — Bear Hide, Boar Skin, Army Chainmail, Plate Armor, Cursed Armor.
- **Trinket** — rings, amulets, relics.
- **Bag** — consumables.

### Rogue
- **Style** — determines Hidden / Dodge / Frenzy routing.
- **Primary** — Short Sword, Dagger, Vampire Dagger, Cursed Disk, Secret Knife.
- **Secondary** — Off-hand Dagger, Throwing Knives, Garrotte.
- **Cloak / Armor** — Black Cloak, light leathers.
- **Trinket**, **Bag**.

### Hunter
- **Style** — Ranger, Sharpshooter, Fey Archer, Amazon.
- **Primary Bow** — Short Bow, Composite Bow, Arcane Crossbow, Manticore Arrow.
- **Secondary** — Meat Cleaver, Net, Mushroom Quiver.
- **Armor**, **Trinket**, **Bag**.

### Wizard
- **School** — Arcane, Pyromancy, Necromancy, Storm, Enchantment.
- **Book** (3 Arcane, 3 Pyromancy, 2 Necromancy, Storm, etc.) — the primary spell set.
- **Scroll Set** — Scrolls of the Dead, Heat Scrolls, Thunder Stones, Lightning Scrolls, Mirror Scrolls, Ward Scrolls.
- **Focus / Trinket** — Mana Pearl, Blink Stone, Storm Ring, Shadow Crown.
- **Robe / Armor**, **Bag**.

Equipment is gathered as loot from specific region nodes. Example starting items: Rogue → Garrotte, Fighter → Sausage, Wizard → Mana Pearl, Hunter → Manticore Arrow.

---

## 4. Resource Systems

Cards cost a combination of resources. The game's design explicitly mixes four *archetypes*:

1. **Stockpile** — starts at cap, spent down, partially refilled per turn (Stamina, Arrows, Disk Energy).
2. **Power-up** — starts empty, generated then spent (Arcane Charges, Tactics, Frenzy, Souls).
3. **Threshold** — not directly spent; triggers effects when above / below a line (Rage, Fire Magic, Demonic Awareness, Fey Magic, Hunger).
4. **Persistent** — carries across battles (HP, Souls, Revenants, Alcohol, Toxicity).

### Universal
- **Health (HP)** — persistent; reaching 0 = run over.
- **Stamina** — stockpile; starts at cap each battle, regenerates ~+5/turn but does not refill fully. Most cards cost Stamina.

### Fighter
- **Tactics** (Power-up, cap 3–4) — generated passively and via Dodge/Resist cards. Fuels strong attacks and utility.
- **Rage** (Threshold) — built by absorbing hits with "Resist Hit" cards. At ≥5 → *Enraged* (more damage, costlier defense). Decays −1/turn.
- **Alcohol** (Persistent Threshold) — gained from drinking consumables. >6 → *Drunk* (+1 Stamina to all cards). Doesn't reset between fights.

### Rogue
- **Frenzy** (Power-up) — stacked by attacks, emptied by finishers; grants passive damage while held.
- **Disk Energy** (Stockpile, 4/4) — powerful attacks cost 2, defensive cards regenerate 1. Asymmetric to punish greed.
- **Demonic Awareness** (Threshold, cap 9) — built by attacks, decays −1/turn. At 9 → weapon *Awakens* (major buff).
- **Hunger** (Threshold) — ticks up passively; at cap you take self-damage. Only purged by finisher cards.

### Hunter
- **Arrows** (Stockpile, 6/6) — most ranged attacks cost Arrows *and* Stamina. Different bows have different caps and recovery costs.
- **Fey Magic** (Threshold, cap 9) — built by attacks, decays −2/turn. At ≥4 triggers *Faery Realm* (enemies Unaware, +2 dmg, −2 Stamina). Dropping below 4 resets to 0 (encourages on/off cycling).
- **Toxicity** (Persistent Threshold) — gained from potions. >6 adds Stamina penalties and damage.

### Wizard
- **Arcane Charges** (Power-up) — primary caster currency. Generators are weak/expensive; spenders are strong/underpriced in Stamina.
- **Fire Magic** (Threshold, cap 10) — overflow deals 3 self-damage. Decays −2/turn.
- **Souls** (Persistent Power-up) — Necromancer currency that carries between battles.
- **Revenants** (Persistent Power-up) — parallel Book-of-the-Dead currency that stacks *on top of* Souls + Stamina costs.
- **Mirror / Ward charges** — some scroll sets produce their own mini-economies.

---

## 5. Combat Turn Structure

1. Draw up to hand cap.
2. Play cards: attacks, defenses (pre-committed against incoming telegraphed hits), movement, conditions.
3. Optionally pay Stamina to **mulligan** (cost varies by class; 5 Stamina for a single card redraw).
4. End turn → resources partially regenerate, thresholds decay, enemies execute their telegraphed intents in order.
5. Deck cycles fully before repeats; deck size is *not* fixed at 17 — it depends on equipment.

### Positioning
- Lane has discrete distances. Weapons have reach requirements (melee-only, any range, ranged-only).
- Some cards push, pull, or move self; Rogues and Hunters rely heavily on this.
- Up to ~8 enemies can be present simultaneously. Reinforcements queue.

### Damage Rules
- **Damage on Contact** — melee attacks against a guarded/spiked target make the attacker take the guard damage. Dodging enemies *cannot* dodge this reflected damage.
- Ranged attacks are immune to contact damage (main Hunter selling point).
- Armor typically blocks flat amounts per hit; some cards bypass armor entirely.

---

## 6. Conditions / Statuses

Conditions inhibit action or enable bonus damage. They can be on you or on enemies.

### Debilitating (typically *on enemies*)
- **Stunned** — skips next attack; counts as *Helpless*.
- **Unaware** — hasn't noticed the player yet; next attack against them deals bonus damage / lands as backstab; counts as *Helpless*. Consumed on first hit.
- **Hidden** — attacks from a Hidden source land as if the target were Unaware. Breaks on attack unless refreshed by Style.
- **Helpless** — umbrella state (Stunned OR Unaware) — Rogue finishers key off this.
- **Poisoned** — damage over time. Killing the last enemy via Poison tick grants a bonus turn of resource regeneration (useful for Necromancy / Fey).
- **Bleeding** — damage over time, often stacks per stack count.
- **Aflame / Burning** — Pyromancer DoT, interacts with Fire Magic threshold.
- **Paralyzed** — Hunter's Paralyzing Arrow tick (~4 dmg/turn).
- **Frozen / Chilled** — slows or skips telegraphed actions (Storm / Thunder).
- **Cursed** — varies by source; usually increases costs or applies over-time harm.
- **Rooted / Netted** — can't move; good for kiting classes.
- **Forest Rot** — environmental DoT from Enchanted Forest; treated like poison.

### Beneficial (typically *on player*)
- **Hidden / Invisible** — next attack is a guaranteed backstab.
- **Dodging** — next incoming melee attack auto-dodges (doesn't block reflected damage).
- **Enraged** (Fighter, Rage ≥ 5).
- **Faery Realm** (Fey Archer, Fey Magic ≥ 4).
- **Awakened weapon** (Rogue, Demonic Awareness = 9).
- **Ward / Barrier / Magic Circle** — absorbs X incoming damage; Enchantress starts fights with one.
- **Spiked / Electric Charge** — reflect damage on contact; can kill attackers outright.
- **Blessed / Faith** — Paladin resource that amplifies holy cards (drained by Dark Sword — don't mix).
- **Drunk** (Fighter) — double-edged, powerful when intended.

### Hidden Enemy Rules
- Most first-round fights can spawn hidden enemies at end of round 1.
- They may enter with **Fury** active → attack the moment they reveal.
- Up to 6 hidden enemies per room, subject to the ~8-enemy cap.
- Killing everything too fast turn 1 is the main trigger — pace yourself.
- Rare depth-5 (pre-boss) rooms can spawn hidden enemies on round 2.

---

## 7. Monster / Enemy Abilities

Enemies share a vocabulary of traits. Common ones:

- **Fury** — attacks twice, or immediately upon spawn.
- **Armor X** — reduces incoming damage by X per hit.
- **Regeneration** — heals per turn.
- **Dodge** — chance / guaranteed avoidance of melee.
- **Shielded** — blocks the first N damage per turn.
- **Ranged Attacker** — hits from any distance; kiting doesn't help.
- **Charging** — telegraphs a high-damage attack over multiple turns; interrupt with stun.
- **Summoner** — produces additional hidden / ambient enemies.
- **Burrowing / Stealth** — enters play Hidden.
- **Poisonous / Bleeding / Flaming bite** — applies a condition on hit.
- **Enrages below X HP** — stat buff at low HP.
- **Reflect** — mini-spikes aura.
- **Unaware at start** — some elite humanoids and bosses start this way; first hit is massive but strips the buff.
- **Phase / Revive** — bosses like Arch Lich change form or self-resurrect.
- **Spawn on death** — Trolls regenerate, Skeletons re-rise without purifying damage, etc.

Notable boss archetypes: **Troll Champion**, **Arch Lich**, **Dragon** (Dwarven Mountains), assorted region-final liches and matriarchs. Each has multi-phase telegraphed scripts rather than random AI.

---

## 8. Consumables & Items

Consumables live in the **Bag** slot and are one-shot plays during combat (or between nodes for some).

### Potions / Concoctions
- **Healing Concoction** — restore HP.
- **Sensory Decoction** — reveal hidden enemies / buff perception.
- Various potions that add **Toxicity** to Hunters — overuse punishes.

### Food / Buffs
- **Spicy Sausage** — Fighter starter; +Stamina or heal.
- **Magic Mushrooms** — add cards / bonus effects; risky.
- **Rage Mushrooms** — instant Rage to the Fighter.
- **Holy Water** — anti-undead damage / remove curse.

### Scrolls (Wizard, usable by anyone who equips them)
- **Scrolls of the Dead** — raise undead minion.
- **Heat Scrolls / Lightning Scrolls / Thunder Stones** — single-use AoE.
- **Mirror Scrolls** — reflect / duplicate.
- **Ward Scrolls** — protective barrier.
- **Blink Stone** — teleport / reposition.

### Alcohol
- Drinking items build Fighter's **Alcohol** persistent threshold. Dwarven Warrior resists the penalty.

### Quest / Key Items
- **Cursed Box**, **Shadow Crown**, **Alchemy Set** (Cathedral).
- End-game unique items earned from defeating region bosses.

---

## 9. Regions & Progression

Three main regions, each with branching nodes:

1. **Cursed City** — Old/Alley/River Town, Cathedral. Undead, cultists, plague.
2. **Dwarven Mountains** — Mountain's Foot, Old Mines, Goblin Village, Dragon's Lair. Goblins, golems, dragons.
3. **Enchanted Forest** — Green Woods, Troll Thicket, Beast Trail. Trolls, fey, beasts, forest rot.

Each level-up between nodes offers a **Perk** (choose from a short list), not a fixed reward. Beating a region often unlocks:
- A new **Subclass** for the class you used.
- **Equipment drops** specific to that region.
- Harder difficulty variants.

### Mulligan Economy
- Starting-hand mulligan cost varies by class.
- Single-card redraw during a turn costs 5 Stamina.

---

## 10. Class–Equipment Synergy Rules

A few load-bearing interaction rules the game never explicitly teaches:

- **Pyromancer and Necromancer** need matching Book + Scroll sets to generate enough Fire Magic / Souls. Mixed schools stall.
- **Dark Sword drains Faith** — do not combine with Paladin / Blessed Shield.
- **Spear** pairs best with **Guardian School** (Fighter).
- **Storm Master** wants defensive scrolls to survive its own Fire Magic overflow when dragons are around.
- **Enchantress** begins every battle with 1 Arcane Charge, 1 Wizard summon, and a Magic Circle — build around those.
- **Lich** trades 2 HP for +5 max Souls — pure Necromancer scaling.
- **Dwarven Warrior** — +2 HP, +2 Energy, Alcohol-resistant. Shield-and-board default pick.

---

## 11. Quick Glossary

| Term | Meaning |
|---|---|
| Deck | Sum of cards from all equipped items; fixed per loadout. |
| Stockpile | Resource that starts full and is spent down (Stamina, Arrows, Disk). |
| Power-up | Resource that starts empty and is generated then spent (Charges, Tactics, Frenzy, Souls). |
| Threshold | Resource measured in bands; triggers effects above/below lines (Rage, Fire, Fey, Awareness, Hunger, Alcohol, Toxicity). |
| Telegraph | An enemy's announced intent for next turn, shown before you commit. |
| Helpless | Stunned OR Unaware; consumed on first hit; enables finishers. |
| Hidden | Source is invisible; attacks from it land as backstabs. |
| Contact damage | Reflected damage that bypasses Dodge. |
| Mulligan | Stamina-priced card / hand redraw. |

---

## Sources

- [Card Quest Wiki](https://card-quest.fandom.com/wiki/Card_Quest_Wiki) — class, equipment, conditions pages.
- [Card Quest on Steam](https://store.steampowered.com/app/493080/Card_Quest/) and its community discussions ([item locations](https://steamcommunity.com/app/493080/discussions/0/135510669606436309/), [equipment types](https://steamcommunity.com/app/493080/discussions/0/135509472113929302/), [subclass unlocks](https://steamcommunity.com/app/493080/discussions/0/3183345176707689427/), [tips & tricks](https://steamcommunity.com/app/493080/discussions/0/1483235412197507288/), [hidden enemies](https://steamcommunity.com/app/493080/discussions/0/1489992080502092583/)).
- Alexander King, *[Design Patterns for Resource Mechanics in Card Quest](https://blog.literallyaking.com/2025/07/23/design-patterns-for-resource-mechanics-in-card-quest/)*.
- Developer devlog at [cardquestgame.wordpress.com](https://cardquestgame.wordpress.com/).
