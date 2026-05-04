# Dice Combat — System Design

---

## Context

The Pale Vault's combat system. The player descends into the salt mine alone — a single character against rooms full of varied threats — and every fight is resolved by **rolling dice you choose, one at a time, until you decide to stop**. Push your luck, gamble color clashes, and assign the surviving faces to targets. Bust, and the turn is gone.

This document is the canonical spec. It supersedes the prototype in [src/dice-combat/](src/dice-combat/) and is the contract for re-implementation.

**Inspirations:** Slice & Dice (open enemy intent, dice-as-tools), Pelusas / Quacks of Quedlinburg (push-your-luck color/bust math), Dicey Dungeons (faces as actions).

**Why this system, in this game:** the Pale Vault's central question is *"who pays for what you take?"* Push-your-luck is a greed engine in mechanical form. The player who keeps rolling for *just one more point of damage* is the player who keeps mining for *just one more wagon of salt*. The bust is the cost. The system *is* the theme.

---

## Theme: The Dice Are the Mine

Each color on a die is a *kind* of harm or help drawn from the mine itself: blood, salt, fire, coldfire, brine, hymn, iron. When you push your luck, you mix these substances together — and like the baron's deepest galleries, *the more you take, the more likely the whole thing collapses*. The bust is not bad luck. It's the cost of greed, paid in tempo.

A conservative player can clear the dungeon. An aggressive player kills faster, but busts often, and busting against the wrong enemy heals it, marks them, or wastes the turn entirely. The game never punishes restraint. It only punishes the *expectation* of getting away with more.

---

## Design Pillars

1. **Tension is the verb.** Every roll is a real decision with legible odds. Stopping is always allowed; stopping is sometimes wrong.
2. **Each die has a personality.** A player feels the Dagger's bloodlust and the Mail's stolidness through the *shape of their color spread*, not through stat sheets.
3. **Targeting is its own decision layer.** The roll is the math. The assignment is the puzzle. Enemy variety makes the assignment matter.
4. **Statuses bend the dice, not just the HP bar.** The most interesting statuses change the colors on your dice or the rules of the bust check. Combat state mutates the math.
5. **The mine bleeds into the math.** Color identities reflect the four eras. The Ability die starts as the Fourth Hand's basic kit ("Steady Hands") and is upgraded at shrines and key props, not bought.
6. **Generous floor, lethal ceiling.** Stop after one safe roll: you're fine. Push twice through a clashing color: you bust. The system always lets the cautious player play.

---

## The Core Loop — One Combat Turn

```
1. ENEMY ROLL (open)
   Each enemy rolls its dice. Faces and target assignments are visible
   to the player before they touch their own dice. (Slice & Dice contract.)

2. PUSH-YOUR-LUCK ROLL
   Player picks any of their four dice and rolls it. The result joins the POOL.
   Repeat: pick another die — or the same die again — and roll. Stop at any time.
   If two faces in the pool share a COLOR, BUST: the pool is discarded, the player
   takes no actions this turn, and the loop jumps to step 4.

3. ASSIGN & RESOLVE (player)
   Player assigns each pooled face to a legal target (self / front / back / any).
   Effects resolve in player-chosen order.

4. ENEMY RESOLVE
   Pre-rolled enemy faces resolve against their pre-chosen targets. Player block
   from step 3 mitigates damage.

5. STATUSES TICK
   Bleed, Brand, Hymn, Brine, Coldfire Mark, etc. tick on all combatants.
   Heap of Bones counters decrement. Dice statuses expire as scheduled.
```

**The contract:** the player always knows the threat *before* deciding how hard to push. Every bust is a choice, not a surprise.

---

## The Seven Colors

A die face is identified by **color first, icon second**. Colors are spaced across seven different hue families so they read at a glance — even in poor lighting, even color-blind. Every color also carries a **shape badge** as accessibility backup. The badge is mandatory on every face render; it is not decoration.

| Color       | Hex (target) | Hue family    | Shape badge   | Lore tie                                     | Effect family                                                   |
|-------------|--------------|---------------|---------------|----------------------------------------------|-----------------------------------------------------------------|
| **Crimson** | `#C0303A`    | Saturated red | Triangle ▲    | Blood — the miners' wounds, the baron's price | Raw damage (slash, pierce, bludgeon)                            |
| **Salt**    | `#F4F1E8`    | Off-white     | Square ■      | The barrier, the ward, the preservative       | Block, cleanse                                                  |
| **Fire**    | `#E8821F`    | Warm orange   | Flame ✦       | Heat — torch, oil, brazier, alchemy, hearth   | Fire damage to enemies, warmth (heal) to self, reveals hidden   |
| **Coldfire**| `#7B3FA0`    | Violet        | Skull ☠       | The lich's lamps, undeath, the brand         | The enemy's color — curses, debuffs, drain                      |
| **Brine**   | `#2BA17A`    | Sea green     | Drop ◆        | Deep wet rot, the seeping mine                | Bleed, poison, decay (damage-over-time)                         |
| **Echo**    | `#3FA3D6`    | Sky blue      | Wave ≈        | The Vigil Hymn, sound, song                   | Utility — focus, dodge, hymn-hum                                |
| **Iron**    | `#5A6473`    | Slate grey    | Hexagon ⬢     | Pick, hammer, chain, weight                   | Stagger, push, heavy bludgeon, armor break, slot-lock break     |

The seven hues sit ~50° apart on the color wheel. None should be confusable for the most common color-blindness types; the shape badge guarantees disambiguation regardless.

**Reading the pool.** A pool of `{ ▲ Crimson, ◆ Brine, ≈ Echo }` is safe. A pool of `{ ▲ Crimson, ▲ Crimson }` is a bust. Players learn this by feel within the first hour.

**Coldfire is asymmetric.** Six of the seven colors are tools the player wields. Coldfire is *the enemy's color* — the lich's brand, the banshee's wail, the shadow's mark. The player has exactly one Coldfire face in the entire ability tree (Coldfire Lance, a haymaker etched late). Rolling it near undead is *intentionally* dangerous: borrowing the enemy's tool carries the enemy's bust risk. This is a feature, not a gap.

---

## The Four Slots

The player rolls from four dice, one per equipment slot. The Fourth Hand enters the mine with a Dagger, a Torch, Mail, and the basic ability "Steady Hands".

| Slot       | Die identity (default)        | Color spread (illustrative, 6 faces)                      | Push-your-luck character                                                              |
|------------|-------------------------------|-----------------------------------------------------------|---------------------------------------------------------------------------------------|
| Main hand  | Weapon (Dagger / Warhammer / Greatblade) | Dagger: 2 ▲ Crimson, 1 ⬢ Iron, 1 ◆ Brine, 1 ≈ Echo, 1 ⬛ blank | Concentrated damage. Same-die reroll has real bust risk; rewards are big.       |
| Off hand   | Torch (starter) / Shield / second weapon | Torch: 2 ✦ Fire, 1 ≈ Echo, 1 ■ Salt, 1 ⬢ Iron, 1 ⬛ blank     | Fire identity. Mixes cleanly with the Dagger (no overlapping color).             |
| Armor      | Mail / Plate / Robes          | Mail: 2 ■ Salt, 2 ⬢ Iron, 1 ✦ Fire, 1 ⬛ blank             | Plate doubles down on Salt/Iron; Robes shift toward Echo/Fire/Brine.                  |
| Ability    | Steady Hands (starter); higher abilities replace it | Steady Hands: 6 different colors, one of each effect family | Always useful, never bust-prone alone. Real upgrades feel like real upgrades.   |

### Sample dice — full face lists

The dungeon ships these as the Phase 1 catalog. Each die is **6 faces**, exactly one of which may be ⬛ blank (for tempo and mercy).

**Dagger (main hand)**
| Face         | Color    | Effect                                       |
|--------------|----------|----------------------------------------------|
| Stab         | Crimson  | 1 slash to a front-row enemy                 |
| Quick Stab   | Crimson  | 2 slash to a front-row enemy                 |
| Twist        | Crimson  | 1 slash + 1 Bleed to a front-row enemy       |
| Open Vein    | Brine    | 2 Bleed to a front-row enemy                 |
| Flit         | Echo     | Gain Dodge: next physical hit is negated     |
| —            | blank    | No effect                                    |

**Warhammer (main hand)**
| Face         | Color    | Effect                                       |
|--------------|----------|----------------------------------------------|
| Smash        | Crimson  | 2 bludgeoning to front                       |
| Crush        | Crimson  | 3 bludgeoning to front                       |
| Stagger      | Iron     | 1 Stun to a front-row enemy                  |
| Heavy Bash   | Iron     | 2 bludgeoning + 1 Stun to front              |
| Wind Up      | Echo     | Gain Power: next damage face deals +2        |
| —            | blank    | No effect                                    |

**Shield (off hand)**
| Face         | Color    | Effect                                       |
|--------------|----------|----------------------------------------------|
| Block        | Salt     | Gain 2 block                                 |
| Bulwark      | Salt     | Gain 3 block                                 |
| Cleanse      | Salt     | Remove 1 status from yourself                |
| Bash         | Iron     | 1 bludgeoning + 1 Stun to front              |
| Focus        | Echo     | Gain 1 free reroll this turn                 |
| —            | blank    | No effect                                    |

**Torch (off hand starter)**
| Face         | Color    | Effect                                       |
|--------------|----------|----------------------------------------------|
| Brand        | Fire     | 1 Fire damage to any enemy (+1 vs undead)    |
| Sear         | Fire     | 2 Fire damage to a front-row enemy           |
| Sidestep     | Echo     | Gain Dodge                                   |
| Ward Off     | Salt     | Gain 1 block                                 |
| Sweep        | Iron     | Push an enemy to the opposite row            |
| —            | blank    | No effect                                    |

**Mail Hauberk (armor)**
| Face         | Color    | Effect                                       |
|--------------|----------|----------------------------------------------|
| Mail         | Salt     | Gain 1 block                                 |
| Heavy Mail   | Salt     | Gain 2 block                                 |
| Steady       | Salt     | Cleanse 1 status from yourself               |
| Edge         | Iron     | Damage faces deal +1 this turn               |
| Endurance    | Fire     | Heal 1 HP                                    |
| —            | blank    | No effect                                    |

Mail concentrates 3 Salt faces — the die *is* the salt-line of the order. Same-die rerolls are 50% bust, mirroring the Dagger's pattern: the heaviest defensive die is also the riskiest to push twice.

**Robes of the Vigil (armor, late-game)**
| Face         | Color    | Effect                                       |
|--------------|----------|----------------------------------------------|
| Veil         | Echo     | Gain Dodge                                   |
| Hum          | Echo     | Gain Hymn-Hum (next pool: Echo counts as any color for bust) |
| Salt-line    | Salt     | Gain 1 block                                 |
| Censer       | Fire     | 1 Fire to any enemy (+1 vs. undead)          |
| Tincture     | Brine    | Apply 1 Bleed to any enemy                   |
| —            | blank    | No effect                                    |

**Steady Hands — basic starting Ability**
| Face         | Color    | Effect                                       |
|--------------|----------|----------------------------------------------|
| Resolve      | Crimson  | 1 slash to any enemy                         |
| Brace        | Salt     | Gain 1 block                                 |
| Catch Breath | Fire     | Heal 1 HP                                    |
| Focus        | Echo     | Gain Resonance — next color clash forgiven   |
| Bear Down    | Iron     | Next damage face deals +1                    |
| —            | blank    | No effect                                    |

Steady Hands is six different colors, one of each effect family. It is bust-resistant rolled alone (every face is a different color), it is never useless (each face does something), and it is modest in raw power so later abilities feel like real upgrades.

**Ability progression** (the dungeon spine). Higher-tier abilities are found at shrines, hymnals, alchemists' labs, and similar key props — each one *replaces* Steady Hands wholesale (the player chooses one ability at a time, like a weapon). Sample later abilities ship with faces like: **Smite** (Fire, holy damage to undead), **Hymn** (Echo, Hymn-Hum + 1 Heal), **Ward** (Salt, 3 block + cleanse), **Brand-Break** (Iron, removes a slot lock), **Coldfire Lance** (Coldfire, big damage but raises bust risk).

The Ability is the game's parallel to the salt-spending tradeoff: every ability adopted is a piece of the dungeon you took with you. The endings track this.

---

## Push-Your-Luck Math

The bust check runs on **distinct colors in the pool**. Same color twice = bust. ⬛ blank does not trigger a bust unless an aura (e.g. The Shadow's Coldfire Mark) recolors blanks.

**Worked example — the Dagger.** Faces: `{ Crimson, Crimson, Crimson, Brine, Echo, blank }`.

- **First roll:** any face is safe.
- **Second roll, same Dagger.** P(bust) depends on what came up first:
  - First was Crimson → 3 Crimson faces left (of 6) → **P(bust) = 50%**.
  - First was Brine → 1 Brine face → **P(bust) = 17%**.
  - First was Echo → 1 Echo face → **P(bust) = 17%**.
  - First was blank → 1 blank face → **P(bust) = 17%** (blank-vs-blank is a clash too).
- **Second roll, Shield instead.** Shield has 0 Crimson faces. After rolling Crimson on the Dagger, rolling the Shield is **0% bust** for that color — the clash can only come from Salt/Iron/Echo/blank in the existing pool. If the pool only has Crimson, Shield is *completely* safe.

**Strategic takeaway.** Different dice are safer than same dice. A weapon's *concentration of one color* is its danger and its glory: the Dagger is the best Crimson-source in the game *and* the worst die to roll twice. The Hammer's three damage faces are split across Crimson and Iron, so same-die reroll is safer than the Dagger — but the raw damage ceiling per roll is lower.

**The temptation moment.** When the player needs *one more point of damage* to finish an enemy, and their pool already contains Crimson, the Dagger is the best damage die in the slot — and rolling it again has 50% bust. This *exact* decision is the central design pleasure of the system. Every encounter is built around producing it.

---

## Statuses

Two tiers. **Body statuses** modify HP and damage (familiar). **Dice statuses** modify the roll itself (the differentiator). Dice statuses are the reason combat doesn't feel the same twice.

### Body statuses

| Status      | Color  | Effect                                          |
|-------------|--------|-------------------------------------------------|
| **Bleed**   | Brine  | N damage at end of turn, decays by 1            |
| **Brand**   | Coldfire | Take +1 damage from next hit (lich's tithe-mark) |
| **Stun**    | Iron / Echo | Skip next turn's enemy roll                |
| **Weakened**| Coldfire | -1 to all damage faces                        |
| **Warded**  | Salt   | Incoming damage -1 next turn                    |
| **Power**   | (self) | Next damage face deals +N                       |
| **Dodge**   | (self) | Next physical hit negated                       |

### Dice statuses (the differentiator)

| Status            | Color    | Effect                                                                                         |
|-------------------|----------|------------------------------------------------------------------------------------------------|
| **Salt-thirst**   | Coldfire | One face on a chosen die is recolored to Coldfire for 2 turns                                   |
| **Hymn-Hum**      | Echo (positive) | Echo faces in your pool count as "any color" for bust check, 1 turn                       |
| **Breath-Taken**  | Brine    | You may roll at most 3 dice this turn before a forced stop                                      |
| **Resonance**     | Fire (positive) | Your first repeat color this turn is forgiven. One use                                    |
| **Coldfire Mark** | Coldfire | ⬛ blank faces count as Coldfire for the bust check                                              |
| **Slot-Lock**     | Salt (hostile) | A specific die cannot be rolled this turn; pay an Iron face to break                       |
| **Forced Face**   | Brine (hostile) | A face is added to your pool at start of turn; counts for bust                            |

Dice statuses make every fight a different math problem. Learning *which enemies inflict which* is the game's mid-game mastery curve.

---

## Enemies — Each One a Distinct Problem

The roster is fixed: only the enemies in [src/data/enemies.ts](src/data/enemies.ts) appear. Variety comes not from new monsters, but from each monster attacking the dice system through a *different vector*.

### Vectors of attack

The seven ways an enemy can break the player's plan:

| Vector            | What it pressures                                                    |
|-------------------|----------------------------------------------------------------------|
| **HP**            | Your health bar. Baseline only — never the *only* thing an enemy does. |
| **Pool**          | Your push-your-luck pool: forces stops, adds faces, caps rolls.       |
| **Bust math**     | Your color clashes: corrupts faces, recolors blanks, redefines the rule. |
| **Slot**          | Disables a die entirely until you pay to free it.                     |
| **Targeting**     | Untargetable, bodyguard, back-row-only, phasing.                      |
| **Persistence**   | Resurrects, splits, animates corpses, regenerates.                    |
| **Tempo**         | Attacks before you act, forces extra rolls, accelerates a clock.      |

**No two enemies share a signature.** A player should be able to name each enemy by its behavior in one line: "the one that locks my shield", "the one that rewrites my dagger", "the one that turns my blanks into curses".

### The eighteen problems

| # | Enemy                  | Vector(s)                | Signature mechanic — UNIQUE                                                                                                                | The puzzle it asks                                          |
|---|------------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| 1 | **Ravager Rat**        | HP, Tempo                | Spawns in groups of 3-5. Each rat rolls a small Crimson die. Two surviving rats merge into a stronger rat at end of enemy turn.            | Sweep early with AOE, or watch them snowball.               |
| 2 | **Skeleton**           | Persistence              | When killed, leaves a Heap of Bones. Re-rises in 2 turns. Iron face on the Heap smashes it permanently. Fire burns it.                    | Killing isn't enough — finish the body, or change priority. |
| 3 | **Heap of Bones**      | Persistence, Tempo       | Countdown enemy. No attack. Top of token shows "rises in N". Becomes a Skeleton at 0.                                                       | Spend a face now or lose tempo later.                       |
| 4 | **Rotting Zombie**     | HP (parasitic on summoner) | Die is **inert** (mostly blank) **unless a Necromancer is alive**. With a Necro alive: rolls Crimson and Brine.                         | Solve the summoner; the body solves itself.                 |
| 5 | **Mournful Ghost**     | Targeting                | **Phase counter (telegraphed):** every other turn it's intangible — Crimson faces deal 0. Fire and Echo always pierce.                    | Time damage windows. Bring the right colors.                |
| 6 | **Blood Wraith**       | Bust math (parasitic)    | Heals 1 HP for **every face in your pool when you bust**. Punishes greedy rolls *specifically* against him.                                 | Conservative play, or commit fully — never half-push.        |
| 7 | **Wailing Banshee**    | Bust math                | While alive, **rewrites one of your die faces to Coldfire** (player chooses which die; the face is forced visible on the die).             | Bust math broken until she dies. Priority kill.             |
| 8 | **Necromancer**        | Persistence (engine)     | Each enemy turn, animates one Heap of Bones into a Skeleton. Back row, frail.                                                               | Cut the engine before the line refills.                     |
| 9 | **Lurking Ghoul**      | Tempo                    | **First round only: rolls 3 dice instead of 1.** A Fire face anywhere in the room cancels her ambush before she rolls.                    | Light reveals her. Open prepared, or eat a haymaker.        |
| 10 | **The Shadow**        | Bust math (aura)         | While alive, **every ⬛ blank face in the player's pool counts as Coldfire** for bust check (Coldfire Mark aura).                            | Don't push your luck while it lives. Kill it first.         |
| 11 | **Grave Robber**      | Resource (meta)          | atk: 0. Each turn alive, steals 1 salt or 1 consumable from the player. Flees combat.                                                       | Spend a turn killing it, or accept the loss. Ending bait.    |
| 12 | **Gutborn Larva**     | Persistence (corpse)     | If alive at end of turn while a corpse exists in the room, animates it as a Zombie next turn.                                               | Body management — clear corpses with Fire, or kill larva.   |
| 13 | **The Forsworn**      | Targeting (bodyguard)    | While he stands, **all damage to other enemies is redirected to him**. Resists slash/pierce; weak to Fire and Iron.                        | Bodyguard puzzle. Pure target priority.                     |
| 14 | **The False Sacrarium** | Pool (clock)           | At end of each enemy turn, **adds a forced Brine face to your next pool** (counts for bust).                                                | Bust math worsens every turn it survives.                   |
| 15 | **Salt Revenant**     | Slot                     | On hit, **locks one of your four dice**. Locked die can't be rolled until you spend an Iron face to break the salt-grip.                    | Fight on three dice. Pay tax to free the fourth.            |
| 16 | **Skeleton Lord** (boss) | Persistence, multi-target | At 0 HP, **splits into 3 Skeletons** (one Heap each on death). Must clear all three within 2 turns or main body reassembles.            | Burst, then cleanup. Fire becomes a finisher.               |
| 17 | **Vampire Lord** (boss) | Bust math, threshold   | Heals to full ONCE at 50% HP. Bust-heal doubled.                                                                                            | Burst past 50%, then play differently.                       |
| 18 | **Lich King** (boss)  | Rules-bending (phased)   | **P1:** plays normally. **P2 (66% HP):** corrupts 2 of your dice (Banshee × 2). **P3 (33% HP):** hums the Hymn — Echo faces become bust-immune. | Three different fights stacked. Endgame literacy test.       |

### Fully statted samples

Implementation reference. Other enemies follow the same shape — a die spec plus a signature. Existing resistances and vulnerabilities from [src/data/enemies.ts](src/data/enemies.ts) carry over (e.g. Skeleton resists pierce 0.5, takes bludgeoning ×1.5).

**Skeleton — die spec**
- HP 16. Front row. Resists pierce, weak to bludgeoning.
- 2 dice per turn:
  - **Bone Die** (6 faces): Rake (Crimson, 2 slash, front), Crack (Iron, 1 bludgeoning + 1 Stun, front), Lurch (Crimson, 1 slash, any), Skitter (Echo, repositions to front), blank, blank.
  - **Wraith-Joint Die** (6 faces): Coldfire (Brand, player), blank, blank, blank, blank, blank.
- Signature: on death, leaves a Heap of Bones with a 2-turn rise counter. Iron damage on the Heap kills it permanently; Fire damage burns it permanently (and triggers cremation visual + audio).

**Wailing Banshee — die spec**
- HP 12. Back row. Incorporeal (Crimson resist 0.5).
- 1 die per turn (Wail Die, 6 faces): Wail (Echo, 3 damage to player, ignores block), Ululate (Echo, applies Stun to player), Drone (Coldfire, applies Weakened), blank, blank, blank.
- **Signature (passive while alive):** the player chooses ONE of their four dice at the start of combat; one face on that die is rewritten to Coldfire (Wail Mark). The Mark visibly replaces the face. Killing the Banshee restores the original face for any future encounter.

**Salt Revenant — die spec**
- HP 18. Front row. Resists pierce, weak to bludgeoning.
- 2 dice per turn:
  - **Grapple Die** (6 faces): Bind (Salt, locks a player die for next turn), Crush (Iron, 3 bludgeoning), Hold (Iron, 2 bludgeoning + 1 Stun), Salt-spit (Salt, applies Warded to itself), blank, blank.
  - **Crystal Die** (6 faces): Shard (Iron, 2 bludgeoning), blank, blank, blank, blank, blank.
- Signature: when **Bind** lands, the player picks which die it locks (or the system locks the most-rolled die from last turn, defender's choice). The lock persists until the player spends an Iron face on the Salt Revenant to break it. Multiple Salt Revenants can lock multiple dice — the worst-case scenario in the dungeon's design.

**Lich King — die spec (phased)**
- HP 55. Back row. Boss.
- All phases roll 3 dice per turn.
- **Phase 1 (HP 100% → 67%): Vigilkeeper.**
  - Cold Lamp Die: Coldfire damage 4, Brand application, blank, etc.
  - Iron Pike Die: 3 bludgeoning, 2 bludgeoning + Stun, blank.
  - Echo Lance Die: 3 damage to player ignoring block, applies Weakened, blank.
- **Phase 2 (67% → 34%): Tithe-Marker.**
  - Same dice, but the Lich also rewrites TWO of the player's die faces to Coldfire each at start of phase (Banshee mechanic doubled). This is the hardest phase.
- **Phase 3 (34% → 0%): Hymn-Heard.**
  - The Hymn rises (audio cue, visual blue-gold haze). All Echo faces in the player's pool become bust-immune for the rest of the fight. Lich's Echo Lance now self-damages instead of damaging the player. The corrupted faces from Phase 2 *remain corrupted* — but the rules just changed under the lich's feet, and an Echo-rich Ability die now wins.
- **Vulnerability:** the Hymn. If the player's Ability die contains the Hymn face and they roll it during P3, the Lich loses an extra 4 HP per Hymn face resolved. Narratively, the lich cut the singing because it served no function. Mechanically, the singing is the only function left.

### Emergent encounters

The dungeon composes these eighteen problems into rooms that demand specific solves. Six named compositions, each a different puzzle:

- **"Cold Choir"** — Banshee + Shadow. Bust math doubly broken: corrupted face *and* Coldfire-Mark on blanks. The player must abandon push-your-luck and focus targets sequentially. Skill check: discipline.
- **"Bone Engine"** — Necromancer + Skeleton + Heap of Bones. Self-refilling front line. Reach the back row through bodyguards; Fire on the Heap is the only permanent progress. Skill check: target priority.
- **"Bodyguard Lock"** — Forsworn + Salt Revenant. Can't reach allies, can't use full kit. Iron faces double-duty as shield-break and slot-unlock. Skill check: resource math.
- **"Rot Clock"** — False Sacrarium + Gutborn Larva. The pool worsens every turn while corpses become enemies. Speed is mandatory. Skill check: aggression.
- **"First Light"** — Lurking Ghoul + Rats. Ambush surge before the player stabilizes. Salt block on turn 1 is non-negotiable. Skill check: opener.
- **"Bleeding Greed"** — Vampire + False Sacrarium. The forced Brine face heals the Vampire when the player busts. The single nastiest non-boss room — directly punishes the player's greed-themed design. Skill check: theme.

The dungeon's encounter table favors compositions over single enemies. A room with one enemy is a tutorial room. A room with three is the game.

---

## Targeting & Positioning

Carry over from the existing system: **front row** and **back row**. Each enemy has a `defaultRow` (already specced in [src/data/enemies.ts](src/data/enemies.ts)). Faces target by row.

| Target keyword  | Legal selections                                           |
|-----------------|------------------------------------------------------------|
| `self`          | Player only                                                |
| `front-enemy`   | Any front-row enemy                                        |
| `back-enemy`    | Any back-row enemy (most weapons can't reach without a push) |
| `any-enemy`     | Any enemy                                                  |
| `all-enemies`   | All enemies (rare, AOE faces)                              |
| `none`          | Roll-only effect (free reroll, focus)                      |

**Push** (Iron faces): swap an enemy between front and back row. This is how the player reaches Necromancers, Banshees, and the False Sacrarium with melee weapons.

This re-uses the existing `target` field semantics from [src/dice-combat/types.ts](src/dice-combat/types.ts) — no engine refactor needed for targeting itself.

---

## Balance Targets

| Metric                                              | Target                                      |
|-----------------------------------------------------|---------------------------------------------|
| Player damage per non-bust turn (mid-dungeon)       | 4-6                                         |
| Player damage per non-bust turn (endgame, etched)   | 6-9                                         |
| Bust frequency, aggressive play                     | 15-20%                                      |
| Bust frequency, conservative play                   | ~3%                                         |
| Trash combat length                                 | 3-5 turns                                   |
| Elite combat length                                 | 6-10 turns                                  |
| Lich combat length                                  | 10-15 turns                                 |
| Steady-Hands-only viability (no ability upgrades)   | Full dungeon clearable                      |
| Average turn time                                   | 20-40 seconds (rolling and assignment combined) |

**HP / damage budgets per area** (parallels the existing GDD area progression):

| Area                  | Trash HP | Elite HP | Player avg DPT |
|-----------------------|----------|----------|----------------|
| 1 — Pale Approach     | 2-4      | 8-12     | 3-4            |
| 2 — Sanctified Galleries | 6-10  | 14-18    | 4-6            |
| 3 — Ossuary           | 10-14    | 18-22    | 5-7            |
| 4 — Deep Workings     | 14-18    | 22-28    | 6-8            |
| 5 — Founders' Reliquary | 18-22  | 28-35    | 7-9            |
| Lich                  | —        | 55       | 8-10 (P3)      |

Bust frequency is the single most important balance dial. If it climbs above 20% on aggressive play, the game feels random; if it falls below 10%, the push-your-luck loop has no teeth. Tune face counts per color, not bust trigger.

---

## UX Flow

Implementation pass owns the visuals; this section is the contract.

- **Slot tray**, bottom of screen: four dice icons left-to-right (Main, Off, Armor, Ability). Hover or tap reveals the full face list with colors and badges.
- **Roll pool**, center: rolled faces appear left-to-right as they land. Each shows its color band (full-width) and its shape badge. Two faces of the same color **pulse and chime** before the bust resolves — a half-second tell, then the pool flushes red.
- **Push / Stop** buttons:
  - **Push:** prompts the player to pick a die, then rolls. Animation length ~0.6s.
  - **Stop:** glows once the pool has at least one face. Locks the pool and moves to assignment.
- **Enemy intent strips**, above each enemy: pre-rolled face icons with their target arrows pointing at the player or allies. Always visible before the player rolls.
- **Status badges**: small icons on the player and enemy frames. Dice statuses (Wail Mark, Coldfire Mark, Slot-Lock) appear on the affected die in the slot tray, *not* on the character — the status visibly modifies the tool, which is the whole point.

---

## Lens / DM Kit / Theory of Fun — Design Rationale

The system is designed around the following lenses, kit chapters, and learning patterns. Listed for posterity and for designers extending the system.

- **Lens of Endogenous Value** — colors *mean* something narratively. A Crimson face is a wound. A Salt face is a ward. Players form attachments to faces, not to numbers.
- **Lens of Risk** — bust math is the core risk lens. The cost is legible (lose the turn), the reward is legible (one more point of damage), the probability is computable from the visible die. Every push is a real decision.
- **Lens of Skill vs. Chance** — chance produces the face; skill produces the *decision to roll*. Mastery shows up as bust frequency dropping over a player's career.
- **Lens of Surprise** — same-die rerolls produce real "oh no" moments. The Dagger's three-Crimson face spread is the system's surprise generator.
- **Lens of Character** — each die has a personality. The Dagger is greedy; the Torch is incandescent; the Shield is patient; the Ability die grows with the character.
- **Lens of the Curve of Interest** — early combats teach safe stops; mid-game introduces dice statuses (Cold Choir, Rot Clock); the lich fight inverts the rules (Hymn faces matter most). Three distinct skill plateaus across the dungeon.
- **Lens of the Toy** — rolling dice is satisfying *before* it's tactical. The animation, sound, and color reveal must work as a toy on turn 1, room 1.
- **DM Design Kit — Pacing** — the encounter table mixes solo elites (decision-heavy) and swarms (assignment-heavy). Boss fights are phased to introduce a second teaching curve at the end of the dungeon.
- **DM Design Kit — Variety > Stat Blocks** — eighteen enemies, eighteen distinct vectors. No "tougher rat" entry. The game's variety is mechanical, not numeric.
- **Theory of Fun — Chunking** — 7 colors learned through repetition; effect families track cleanly to colors so players generalize from "Salt = block" to "all Salt is defensive". Dice statuses are the second-act complication that reignites learning.
- **Game Design Workshop — Failure as Teacher** — busting is informative, never silent. The pool flashes red, the colors that clashed flare, the player sees *why*. They learn the system from their own mistakes.

---

## What This Doc Does Not Cover

- **Rendering and animation specifics.** Implementation pass.
- **Audio design.** A separate brief; the Hymn motif in the Lich P3 deserves its own treatment.
- **Procedural encounter generation.** The encounter table is hand-authored; procedural mixing of the eighteen problems is a Phase 2 design.
- **Multiplayer / asynchronous play.** Out of scope. This is a single-player game.

---

## Implementation Readiness

A developer should be able to re-spec [src/dice-combat/dice-defs.ts](src/dice-combat/dice-defs.ts) and [src/dice-combat/enemy-defs.ts](src/dice-combat/enemy-defs.ts) from this document alone. The face lists in *The Four Slots* and *Fully statted samples* are exhaustive for Phase 1 ship. Anything missing — additional weapons, additional ability upgrades beyond the five listed, post-launch enemies — is explicitly out of Phase 1 scope.

The follow-up implementation task is a separate work item. This document is the contract.
