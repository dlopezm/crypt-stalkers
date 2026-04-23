# Crypt Stalkers — Enemy Roster (Card Quest Design Pass)

A ground-up enemy design document. Rebuilt from the existing roster in [src/data/enemies.ts](src/data/enemies.ts) and [src/grid-combat/enemy-defs.ts](src/grid-combat/enemy-defs.ts), but reframed through Card Quest's design lens: every enemy should **force a specific problem** the player's kit has to answer, with a 2-beat telegraphed script that rewards reading the board.

Companion to [docs/card-quest-mechanics.md](docs/card-quest-mechanics.md) and [docs/card-quest-player-design.md](docs/card-quest-player-design.md).

---

## 1. Design Pillars (Enemy Side)

1. **Every enemy is a question with exactly one card-shaped answer.** Every enemy in the roster should be defeatable by *some* player loadout elegantly, and by *every* player loadout with effort. "The Breaker can just walk past this" is fine; "everyone just slashes it" is bad.
2. **Telegraphs are contracts.** If an enemy announces an attack, the player *can* answer it — by moving, by disarming it, by killing it first, by using the *space* the telegraph leaves open. Undodgeable attacks are failure states.
3. **Conditions go both ways.** Every condition the player can apply, some enemy inflicts. Every enemy's identity should include a condition it either *resists* or *feeds on*.
4. **Corpses matter.** Undead leaving corpses behind is a design feature. Grave-Eater heals; Necromancer raises; Sacrarium corrupts; Larva infests. The corpse layer is a mini-game, not a cleanup.
5. **Boss = lessons, not stats.** A boss tests the lesson of the region. The Skeleton Lord tests Helpless-enabling; the Vampire Lord tests burst; the Lich King tests *all of it simultaneously*.

---

## 2. Enemy Archetype Taxonomy

Each enemy fits one or more **archetype tags** that describe the question they pose:

- **Bruiser** — direct damage, forces defense.
- **Swarm** — numbers, forces AoE.
- **Skirmisher** — repositions, forces commitment.
- **Caster** — back-line, forces a disruption answer.
- **Controller** — applies conditions, forces cleanse/prevention.
- **Reflector** — punishes attacks, forces *how* you attack.
- **Territorial** — changes the board, forces movement.
- **Summoner** — creates more problems, forces priority.
- **Phase** — revives/changes, forces damage-type awareness.
- **Ambusher** — starts unknown, forces light/scouting.

---

## 3. The Roster

### 🐀 Ravager Rat — *"Never alone"*
**Archetype:** Swarm. **HP 2 · Armor 0 · Speed Fast.** Spawns in packs of 3–6.

**Passive — Swarm Bonus.** Each Rat deals +1 damage per *other* living Rat within 2 tiles. A solo Rat deals 1. A pack of 5 deals 5 *each*.

**Telegraphs (alternates):**
- `Scurry` — moves 2 tiles toward player, prefers staying adjacent to another Rat.
- `Pile Bite` — 1 Bite to adjacent tile; triggers *once per adjacent Rat pileup* (4 Rats adjacent to you = 4 bites).

**Death:** Rats die in 1 Swing / 1 Stab. No resistance. *This is the point — they're fodder, the math just bites.*

**The question:** Can you thin the pack before their passive compounds? AoE is the clean answer; Heave into walls is the Breaker's answer; Overwatch is the Watcher's answer; Censer's cone is the Psalmist's. The Stalker's Knife struggles — *and that's intentional*.

---

### 💀 Skeleton — *"Won't stay down"*
**Archetype:** Bruiser / Phase. **HP 16 · Armor 1 · Speed Medium.** Resists Pierce 50%, Vulnerable Bludgeoning 1.5×.

**Passive — Reform on Non-Bludgeoning.** If killed by Slash/Pierce/Holy, drops a **Heap of Bones** that reforms into a Skeleton in 2 turns. If killed by Bludgeoning, *stays dead*.

**Telegraphs (3-beat rotation):**
- `Slash` — 5 Slash to adjacent.
- `Bone Lunge` — step 2 + 5 Slash at line-end.
- `Shielded Stance` — gain Armor 3 until next turn.

**The question:** Do you have a Bludgeoning damage type on hand? The Watcher with a Crossbow will be shattering Heaps every other turn; the Stalker will need to Poison-then-Slash (Poison ticks bypass the revive) or escort the Breaker.

---

### 🦴 Heap of Bones — *"The second warning"*
**Archetype:** Territorial. **HP 3 · Armor 0 · Stationary.** Armor 2 vs Pierce, Vulnerable Bludgeoning 2×.

**Passive:** At its 2-turn timer, spawns a new Skeleton on its tile. If destroyed before then, no revival.

**Telegraph:** Pure timer — no attack. The room *clock* is the threat.

**The question:** Resource triage. Spending a card on a Heap means *not* spending it on the next Skeleton's telegraph. The player who ignores Heaps loses to the snowball; the player who kills every Heap has no AP left for the live enemies. *Correct play is choosing which one to leave.*

---

### 🧟 Rotting Zombie — *"Master's voice"*
**Archetype:** Bruiser / Controller. **HP 8 · Armor 0 · Speed Slow.**

**Passive — Commanded.** If a Necromancer exists on the board, Zombie gains +2 damage. If all Necromancers die, Zombie loses all telegraphs for the rest of the fight (stops attacking; still blocks tiles).

**Telegraphs:**
- `Shamble` — move 2 tiles toward player.
- `Grab` — 3 Bludgeoning + **Immobilize 1** on a successful hit.

**Death:** Leaves a corpse. Corpse is *food* for Larva, *fuel* for Sacrarium, *loot* for Grave-Eater, *raise* for Necromancer.

**The question:** Prioritisation. Killing the Zombie feels satisfying but the Necromancer in back is the actual win condition. The Psalmist's Sanctified Ground on the caster, the Watcher's Cull, the Warden's Disarm of the `Raise Dead` telegraph — all valid.

---

### 👻 Mournful Ghost — *"Ask permission first"*
**Archetype:** Phase / Controller. **HP 12 · Incorporeal.** Slash/Pierce deal half damage; Holy and Bludgeoning deal full.

**Passive — Phase Shift.** Once per fight, when reduced below 50% HP, teleports 3 tiles to an unlit tile and gains Hidden 1.

**Telegraphs:**
- `Chill Touch` — 3 Cold to adjacent + **Slowed 1** (−1 AP next turn, min 1).
- `Spectral Wail` — 2 damage in 1-tile radius around Ghost + **Dimmed 1** to all affected.
- `Phase Shift` — move 3 tiles through walls; no damage.

**The question:** Damage type *and* Light. The Censer destroys Ghosts. The Knife eats half its damage and its owner loses AP to Chill. Bring Holy, or pressure to pre-empt Phase Shift.

---

### 🧛 Blood Wraith — *"Patient predator"*
**Archetype:** Bruiser / Skirmisher. **HP 20 · Armor 0 · Speed Fast.**

**Passive — Lifesteal 50%.** Heals half damage dealt.

**Telegraphs (conditional):**
- `Stalk` — moves to a tile with LOS but *not* adjacent, if player HP ≥ 80%.
- `Drain Bite` — 6 Bludgeoning + apply **Bleeding 2** + heal 3. Only when player HP ≤ 70%.
- `Mist Form` — at ≤ 40% HP, turn intangible for 1 turn: takes 0 damage, passes through walls. Once per fight.

**The question:** *When* to burst. The Wraith's AI *waits* for you to be weakened. Healing mid-fight extends the Stalk pattern. The correct line is committing a full-AP turn to kill it at 100% HP before Drain Bite matters — or Censer-Burning for HoT that breaks Mist.

---

### 😱 Wailing Banshee — *"Cannot silence what rings"*
**Archetype:** Caster / Controller. **HP 12 · Incorporeal · Back-row.**

**Passive — Dirge Aura.** Enemies adjacent to Banshee gain +1 Armor. Killing the Banshee first *unbuffs the room*.

**Telegraphs:**
- `Wail` — AoE 2 in radius 2 around self + **Silenced 2**.
- `Corrupted Hymn` — heals 1 adjacent ally for 4, applies **Marked 2** to player.
- `Dirge of the Damned` — 3-turn charged finisher: 6 damage to player + drain 2 AP next turn. *Telegraphs 3 turns in advance.*

**The question:** Back-line access. Spear's Hook, Knife's Slip Through, Pick's Heave (into the Banshee through a destroyed pillar), Crossbow's Overwatch past the front line. The Dirge gives you *three* turns to solve it — if it lands, that's a skill issue.

---

### 🧙 Necromancer — *"He's reading, shoot him"*
**Archetype:** Caster / Summoner. **HP 8 · Armor 0 · Stationary.**

**Passive:** Carries a light source (revealing adjacent tiles); +2 armor while any Zombie ally lives.

**Telegraphs (priority order):**
- `Raise Dead` — targets nearest corpse: creates a Zombie. 2-turn telegraph. **The primary objective telegraph.**
- `Dark Bolt` — ranged 4 — 4 Cold.
- `Command` — grants an adjacent undead ally a free action immediately after this telegraph resolves.

**The question:** Can you kill the `Raise Dead` telegraph? Warden's Disarm cancels it. Watcher's Cull kills the caster. Psalmist's Sanctified Ground on the nearest corpse makes the raise fizzle (undead can't spawn on Hallowed). Stalker Slip Through + Backstab. *Four different answers, each archetype has one.*

---

### 🧌 Lurking Ghoul — *"Feeds on the fallen"*
**Archetype:** Ambusher / Bruiser. **HP 14 · Speed Fast.**

**Passive — Hidden in Dark.** Starts Hidden in any unlit tile. Revealed when adjacent to player or on a lit tile. Gains +3 damage on its first attack out of Hidden.

**Passive — Feast.** Adjacent to a corpse at start of its turn → consumes the corpse, heals 6, removes the corpse.

**Telegraphs:**
- `Pounce` — 3-tile leap + 6 Slash + **Bleeding 2**. (Out of Hidden: +3 damage.)
- `Slash` — 4 Slash to adjacent.
- `Retreat to Dark` — moves 3 tiles to nearest unlit tile; regains Hidden.

**The question:** Light management *and* corpse control. Torches reveal; Paper Lantern pre-empts. The Psalmist's Censer smoke *against* the Ghoul is a classic mistake — it darkens the tile. The Ghoul vs Grave-Eater is a *corpse race*.

---

### 🌑 The Shadow — *"Starve the fire"*
**Archetype:** Controller / Territorial. **HP 16 · Incorporeal · Speed Medium.**

**Passive — Dark-Empowered.** +2 damage and +2 armor when on an unlit tile.

**Telegraphs:**
- `Shadow Strike` — 5 Cold to adjacent + **Dimmed 2**.
- `Consume Light` — extinguishes all light sources within 3 tiles (braziers, lanterns, player Light −1).
- `Spread Darkness` — converts a 2-tile radius to **Dark Zone** for 3 turns.

**The question:** Light is a resource here. Every `Consume Light` is an attack on your *action economy* — you'll spend AP re-lighting or fight at a debuff. The Breaker can destroy braziers *intentionally* to deny the Shadow its buff tiles (both lose light, but the Shadow loses more).

---

### 🕵️ Grave Robber — *"Not your problem unless you make it one"*
**Archetype:** Non-combatant / Skirmisher. **HP 10 · Armor 0 · Speed Fast. Fleeing.**

**Passive — Fleeing.** Never attacks. Each turn moves 3 tiles toward exit. Reaches exit → escapes (no loot for player).

**Loot:** Drops 20 gold (double normal) + one random consumable from a small pool.

**Telegraphs:** `Flee (exit-bound move)` only.

**The question:** *Do you even engage?* Sometimes the correct play is letting it escape — chasing the Robber in a room with active enemies is the classic trap. Crossbow Shoot at range, Spear Hook to pull back, Pit Whistle consumable to stop their move. The Breaker can shatter a wall to cut off the exit route — most satisfying capture.

---

### 🪱 Gutborn Larva — *"The corpses are the problem"*
**Archetype:** Swarm / Summoner. **HP 1 · Speed Slow.**

**Passive — Infest.** If Larva ends turn adjacent to a corpse, consumes it and *spawns a new Larva* on that tile. Also, if a corpse remains adjacent to a Larva for 3 turns, it transforms into a **Rotting Zombie**.

**Telegraph:** Only `Crawl toward nearest corpse`. No attack.

**The question:** Board hygiene. Kill Larvae after their food. Or burn corpses (Censer, Black Powder, Censing Arc). Or *use* them — a Grave-Eater who arrives before the Larva wins twice (heal + deny spawn).

---

### ⚔️ The Forsworn — *"Broken oaths, unbroken plate"*
**Archetype:** Bruiser / Reflector. **HP 22 · Armor 3 · Speed Medium.** Resists Slash/Pierce 50%, Vulnerable Bludgeoning + Holy 1.5×.

**Passive — Perjured Aura.** Adjacent allies gain +1 armor. *This is the back-line's bodyguard.*

**Passive — Intercept for Ally.** If an adjacent ally would be damaged, Forsworn can redirect the hit to itself (once per turn).

**Telegraphs:**
- `Oath-Break Cleave` — 5 Slash to adjacent front arc.
- `Ward Allies` — gives adjacent undead +3 armor for 1 turn.
- `Broken Vow` — 3-turn charge → 8 Slash in a cone 3; cancelled if Forsworn is Stunned during charge.

**The question:** *How* you damage matters. Slash/Pierce specialists (Knife, Crossbow) need Holy support (Censer Oil consumable, Censer Flail ally) or will grind the Forsworn slowly while the Banshee kills them. The Foreman's Pick's Shatter obliterates it. Stunning during the Broken Vow charge is the skill-test window.

---

### ⛪ The False Sacrarium — *"A shrine to the wrong god"*
**Archetype:** Territorial / Summoner / Caster. **HP 12 · Stationary · Armor 0.** Vulnerable Holy + Fire 1.5×.

**Passive — Ever-Growing.** +1 HP per turn up to cap 18.

**Telegraphs:**
- `Putrid Litany` — AoE 2 in radius 2 around self + **Poisoned 2** + creates 1 random **Rot** tile.
- `Consecrate Filth` — converts 1 Rot tile into a Gutborn Larva.
- `Grasping Vines` — pulls player 2 tiles toward Sacrarium + **Immobilize 1**.

**The question:** Race. Every turn spent not attacking the Sacrarium is a turn the Rot grows and Larvae appear. Sanctified Ground *on the Sacrarium itself* is elegant — it burns while you clean up Larvae. Psalmist's dream enemy; Stalker's nightmare.

---

### 💎 Salt Revenant — *"The salt remembers"*
**Archetype:** Bruiser / Controller. **HP 18 · Armor 2 · Speed Slow.** Territorial.

**Passive — Bound to Salt.** If more than 4 tiles from its spawn tile, takes 2 damage/turn. Gains +2 armor while on a salt deposit tile.

**Telegraphs:**
- `Grasp` — 2-tile reach, pulls player to adjacent tile + **Immobilized 2**.
- `Salt Crush` — 7 Bludgeoning to immobilized adjacent target (follow-up to Grasp).
- `Crystal Regrowth` — creates a salt deposit tile on an adjacent tile.

**The question:** Movement tools. The Knife's Slip Through breaks Grasp. Chainmail's Set Feet prevents the pull. The Breaker can shatter the salt deposits under it. Fighting on the Revenant's home turf is the wrong move — draw it *off* its spawn, it melts.

---

## 4. Bosses

Bosses test region lessons. Each has two phases, a revive mechanic, and intent scripts that demand *the player's full kit*, not one dominant strategy.

### 💀👑 THE SKELETON LORD — *Region 1 Boss: "Every bone has a name"*
**HP 35 → 35 (revives once) · Armor 3 · Melee.** Resists Pierce 50%, Vulnerable Bludgeoning 1.5×.

**Passive — Phylactery Shield.** First 3 damage per turn absorbed. *Bludgeoning bypasses this entirely.*

**Passive — Bone Shield While Minions.** +2 armor while any Skeleton or Heap exists on the board.

**Phase 1 (HP 100%–50%):**
- `Cleave` — 6 Slash to front arc.
- `Bone Storm` — radius 2 AoE, 4 Bludgeoning; creates 2 Heaps of Bones on adjacent tiles.
- `Shielded Stance` — Armor +3 until next turn.

**Phase 2 (≤50% HP, after Phylactery revive):**
- Replaces `Shielded Stance` with `Bone Cage` — immobilizes player, no damage, next turn he gets a free `Bone Storm`.
- Adds `Reanimate All` — all Heaps in the room reassemble immediately.

**The lesson:** Helpless-enabling. Phase 1 rewards Stunning the Cleave; Phase 2 rewards *denying minions* (kill every Heap, Bludgeoning only). The Breaker is the Lord's kryptonite — *which is why the region rewards you with Foreman's Pick*.

---

### 🧛‍♂️👑 THE VAMPIRE LORD — *Region 2 Boss: "Attrition is your cage"*
**HP 45 · Armor 1 · Speed Fast.**

**Passive — Lifesteal 100%** on Drain attacks.

**Passive — Mist Phase.** At 75%, 50%, and 25% HP, becomes Incorporeal for 1 turn (takes 0 physical damage; Holy and Fire ignore).

**Phase 1 (HP 100%–50%):**
- `Drain Bite` — 7 Bludgeoning + heal 7 + Bleeding 2.
- `Blood Rush` — teleport adjacent to player (passes through walls).
- `Charm Gaze` — **Marked 2** + player's next attack has −50% damage.

**Phase 2 (≤50% HP):**
- Adds `Blood Puppet` — raises a recent corpse as a 1-HP ally that detonates for 4 damage on death.
- `Drain Bite` becomes **Pounce Drain** — 9 damage, 2-tile leap.

**The lesson:** Burst windows. If you chip, he heals. Correct play: set up Helpless (Pin Shot, Stun Bomb), then one-shot-turn him. Holy via Censer ignores Mist Phase. *A Psalmist with Penitent's Toll crits a Vampire Lord's Mist turn for 16+ Holy.*

---

### ☠️👑 THE LICH KING — *Final Boss: "Every lesson at once"*
**HP 55 · Armor 2 · Stationary · Back-center of the boss arena.**

**Passive — Phylactery.** First death at 0 HP restores to 50% HP with a shattered Phylactery state (loses Arcane Ward).

**Passive — Shield of Will.** +3 armor while any minion (not Heap) lives.

**Arena:** 4 braziers at the corners. Brazier light protects the player; Lich can extinguish them.

**Phase 1 (HP 100% → 0%):**
- `Dark Bolt` — ranged 5 — 6 Cold + Marked 2.
- `Mass Raise` — every corpse in LOS becomes a Skeleton/Zombie (up to 3 per cast).
- `Eclipse` — 2-turn telegraph: all 4 braziers extinguish simultaneously; all undead gain +3 damage until a brazier is relit.
- `Arcane Ward` — absorbs 3 damage/turn (passive).

**Phase 2 (after Phylactery revive):**
- Loses Arcane Ward.
- `Dark Bolt` fires *twice* per cast.
- `Soul Drain` — targets nearest corpse; Lich heals 10, corpse is erased.
- `Lich Gambit` — 5-turn finisher. If it resolves, player takes 20 damage and is Silenced 3. *Interruption is mandatory.*

**The lesson:** Everything. You need: AoE for the Mass Raise, disruption for the Gambit telegraph, Holy/Fire for the Arcane Ward (or Piercing Shot), corpse control for Soul Drain, light management for Eclipse, burst for the Phylactery transition. *A run without one of these tools is a skill check you fail.*

---

## 5. Condition Design — Enemy Side

What the enemies inflict vs. what they resist:

| Enemy | Inflicts | Resists / Immune |
|---|---|---|
| Rat | — | — |
| Skeleton | — | Bleeding (no blood), Poisoned (no guts) |
| Heap | — | Bleeding, Poisoned |
| Zombie | Immobilize | — |
| Ghost | Slowed, Dimmed | Bleeding, Poisoned, physical ½ |
| Banshee | Silenced, Marked | Bleeding, physical ½ |
| Necromancer | — | — |
| Ghoul | Bleeding | — |
| Shadow | Dimmed | Bleeding, Poisoned, physical ½ |
| Vampire | Bleeding, Marked | — (Mist Phase for physical) |
| Grave Robber | — | — |
| Larva | — | — |
| Forsworn | Cursed | — (damage-type only) |
| Sacrarium | Poisoned, Immobilize (Vines) | — (Holy/Fire 1.5×) |
| Salt Revenant | Immobilize | — |
| Skeleton Lord | — (raw damage) | Pierce ½; Phylactery until broken |
| Vampire Lord | Bleeding, Marked | Mist Phase cycles |
| Lich King | Marked, Silenced | Arcane Ward (phase 1); Holy/Fire still full |

**Design principle:** Incorporeal enemies don't Bleed, don't get Poisoned. Skeletons don't Bleed. Fire enemies (future) would be immune to Burning. *Conditions are physical logic, not flat bonuses.*

---

## 6. Telegraph Vocabulary — What Good Telegraphs Look Like

Grading the roster by the "can the player answer it?" test:

| Telegraph | Pre-resolve window | Answers |
|---|---|---|
| Rat `Pile Bite` | 1 turn | Move away, AoE, wall-slam via Heave. |
| Skeleton `Bone Lunge` | 1 turn | Sidestep, Riposte Stance, Pin Shot, Crack Bone. |
| Banshee `Dirge of the Damned` | 3 turns | Kill her, Hook her, Disarm, Overwatch. |
| Necromancer `Raise Dead` | 2 turns | Disarm, kill, Sanctified Ground on the corpse target. |
| Vampire Lord `Charm Gaze` | 1 turn | Brace, Hidden, step out of LOS. |
| Lich `Lich Gambit` | 5 turns | Disarm, kill, spam damage past his Ward, make him raise a corpse over the telegraph window and he re-targets. |
| Lich `Eclipse` | 2 turns | Kill him, or pre-brace (stock Torches, stand on a brazier, Paper Lantern on self). |

If a telegraph doesn't have 2+ legitimate answers, it's a balance bug, not a challenge.

---

## 7. Loot & Salt-Drop Logic

Card Quest gives loot as deterministic equipment per region node. Here: each enemy drops *something* meaningful.

- **Rats, Larva:** small gold.
- **Skeletons, Zombies:** gold + **corpse** (the real reward for Grave-Eater / Psalmist).
- **Heap:** nothing if killed before revival; +1 Bone Dust consumable if killed *after* reforming.
- **Ghoul:** +1 consumable slot inventory for the rest of the floor.
- **Ghost:** small Salt drop (+1).
- **Banshee:** spawns a 1-turn Hallowed tile on death (Psalmist gets a refund).
- **Necromancer:** drops a random Scroll consumable.
- **Shadow:** drops a Paper Lantern.
- **Vampire (minion):** 1 Healing Draught.
- **Forsworn:** always drops +10 gold and has a 20% chance to drop a weapon.
- **Sacrarium:** destroying it removes *all* Rot tiles in the region.
- **Salt Revenant:** drops 2 Salt and a Grave-Salt Vial.
- **Bosses:** unique equipment (Region 1 → Foreman's Pick path; Region 2 → Vigil Blade / Reliquary; Region 3 → Censer Flail / Warden's Crossbow).

**Design principle:** Loot should *unlock a strategy* you couldn't do before, not just refill what you spent.

---

## 8. Unit-by-Unit Player Matchup Matrix

A heatmap of *which voice dominates which enemy* (S = trivial, A = strong, B = even, C = struggle):

| Enemy | Stalker | Breaker | Warden | Psalmist | Watcher |
|---|---|---|---|---|---|
| Rat | C | A | B | A | A |
| Skeleton | C | S | B | B | B |
| Heap | B | S | B | B | C |
| Zombie | A | A | A | A | B |
| Ghost | C | B | B | S | B |
| Banshee | A | A | B | S | A |
| Necromancer | S | A | S | A | S |
| Ghoul | C | A | A | B | C |
| Shadow | C | A | B | S | B |
| Vampire | A | B | B | S | A |
| Grave Robber | A | A | B | C | S |
| Larva | B | A | B | S | A |
| Forsworn | C | S | A | A | A |
| Sacrarium | B | A | B | S | A |
| Salt Revenant | A | S | A | B | B |
| Skeleton Lord | C | S | B | B | B |
| Vampire Lord | S | B | B | S | A |
| Lich King | B | B | B | B | B |

**Reading the matrix:**
- No voice has S or A on every enemy. *Every kit has a struggle matchup.*
- The Lich King is intentionally B for all — the only enemy that tests the full kit.
- Psalmist feels strong against undead because that's their region; in a beast/human content patch, their grades would invert.

---

## 9. Open Design Questions

- **Intent stability.** Some enemies (Banshee, Lich) have 3–5 turn charged finishers. Is that *readable* on a small screen, or does the UI need a "danger meter" to signal incoming?
- **Ghoul corpse-race.** Ghoul + Grave-Eater + Necromancer all want corpses. If the player isn't Grave-Eater, does the Ghoul's Feast just feel unfair? Consider capping Ghoul Feast at once per fight.
- **Salt drops from Ghost.** Gives Salt economy a trickle through the region. Might make ghost-heavy rooms the "farm spot" — desired, or cheesy?
- **Forsworn Intercept** is procedurally correct but UI-opaque. Consider auto-highlighting when a hit *will* be intercepted.
- **Boss revives.** Every boss has one revive. Thematically consistent (necromancy region) but mechanically predictable. Consider one boss (Vampire Lord?) *not* reviving — his Mist Phase triples are his "revive equivalent." Variety makes the region feel less formulaic.

---

See [docs/card-quest-player-design.md](docs/card-quest-player-design.md) for the matching player kit design and [docs/card-quest-mechanics.md](docs/card-quest-mechanics.md) for the Card Quest reference.
