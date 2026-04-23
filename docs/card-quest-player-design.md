# Crypt Stalkers — Player Kit (Card Quest Design Pass)

A ground-up design document for the player's cards, resources, and loadouts, using Card Quest's vocabulary but respecting what the engine in [src/grid-combat/](src/grid-combat/) already supports: AP-based tactical grid combat, Salt as a persistent resource, timeline insertion, LOS, terrain, and a rich condition system.

This is a *design* document, not a code spec. It proposes identity, tension, and memorable choices. Where it contradicts [src/data/abilities.ts](src/data/abilities.ts), the document wins — that file is the old row-combat kit and is being phased out.

Companion to [docs/card-quest-mechanics.md](docs/card-quest-mechanics.md) and [docs/card-quest-monster-design.md](docs/card-quest-monster-design.md). A full enemy redesign lives in [docs/card-quest-monster-design.md](docs/card-quest-monster-design.md).

---

## 1. Design Pillars

Before mechanics, the feel:

1. **Every weapon is a verb, not a stat.** Dagger = *reposition through*. Pick = *break apart*. Flail = *paint the ground*. The damage number is secondary to the *sentence* the weapon lets you write each turn.
2. **Conditions are promises, not DoTs.** Bleed doesn't just tick — a Bleeding enemy *sprays* into adjacent tiles. Stunned doesn't just skip — Stunned enemies can be *moved through* and *used as cover*. Every condition enables a combo line.
3. **The grid is half the deck.** Terrain is a card. Salt deposits, braziers, rails, rot tiles — you don't just fight on the map, you *play* it. A full third of the player's card pool should manipulate terrain.
4. **Salt is currency and communion.** Salt is persistent, earned slowly, spent rarely. It powers the game's biggest swings — never trivial, always a moment.
5. **No class splits, four voices.** One character, four weapon *voices* (Stalker / Breaker / Vigil / Censer). Cards reveal personality, not character-sheet bonuses.

---

## 2. Resources

### Health (HP) — persistent stockpile
- Cap 30 baseline, +armor bonus. Carries between battles; no end-of-fight restore.
- Healing is rare by design. **Eating a corpse** (new mechanic — see Censer Flail and Ghoul parallel) is the main mid-fight top-up.

### Action Points (AP) — per-turn stockpile
- Baseline **3 AP/turn**, capped at 4 with Vigil Plate. Fully refills at start of turn — no carryover.
- Most cards cost 1 AP. Signature cards cost 2. Finishers cost 3 (whole turn).
- AP is the *immediate* pressure — spending patterns make the turn.

### Salt — persistent threshold / power-up hybrid
- Capped at **9**. Carries between battles. Earned by:
  - Finishing an enemy at ≤ 2 HP with a weapon attack (+1).
  - Killing an enemy *on a salt deposit* tile (+2).
  - Completing a room without taking damage (+1).
  - Ritual interactions between floors (+2 to +4).
- Spent on **Salt Rites** — 3-AP finishers that do things no card otherwise can (resurrect an ally corpse, collapse a corridor, force an enemy to end its own intent early). Salt never refills mid-fight; a run is a budget.

### Light — persistent threshold
- Scale 0–5. Certain enemies (Shadow, Ghoul) feed on darkness; certain player cards feed on *being* in the dark.
- Light is a *situational modifier*, not a primary currency. Torches restore it; Shadow drains it; specific rooms are dark by default.

### Bone Resonance — weapon-specific charge
- Foreman's Pick-only passive. Bludgeoning hits on skeletal enemies add a stack (max 5). Stacks auto-consume on cast of Pick signatures for bonus effects. *Example of weapon-specific micro-economies — the correct Card-Quest-style answer.*

---

## 3. Universal Cards

Always in the deck, one copy each, no weapon dependency.

### Step (1 AP) — `move`
- Move up to 3 tiles, stop on LOS of hostile intent (optional).
- Exists to make clear that moving is cheap. Everything else is a decision.

### Brace (1 AP) — `self`, instant
- Gain **Armor 2** until start of next turn, then discard.
- The "I can't solve this turn" card. Always playable, never thrilling — deliberately so.

### Hold Breath (0 AP) — `self`, once per fight
- End turn immediately. Heal 1 HP. **Do not draw** — next turn you start with a thinner hand, one extra AP.
- A tempo-trade card. Lets you front-load next turn.

### Rite of Parting (3 AP, Salt 1) — `tile (adjacent corpse)`
- Consume an adjacent corpse: gain 1 Salt back and cleanse one condition.
- Baseline Salt recycling. Every class-neutral "emergency button."

---

## 4. The Four Weapon Voices

Each weapon is not a Fighter-vs-Rogue split — it's a *posture*. Voices define how you *want* to solve rooms.

### 🗡️ Ashvere Knife — *The Stalker*
> Great-grandmother kept it sharp. Family heirloom; she used it for the same reasons you do now.

**Posture:** Reposition, flank, finish. Never where the enemy telegraphs.

**Primary: Stab** — 1 AP, Melee — 4 Pierce. **If target has ≥1 condition**, +2 dmg.
- *The knife believes in follow-through.* Cheap, scaling, encourages condition-setup cards before swinging.

**Sidestep** — 1 AP, self — Move 1 tile *diagonally*, then if you pass through an enemy's attack tile, deal 3 Pierce to them as a reactive strike. Once per turn.
- *Dodges are offense.* Card Quest's Rogue Dodge reimagined: dodging is not passive, it *drops blood*.

**Backstab** — 2 AP, Melee (from behind) — 9 Pierce. Requires being in target's rear arc.
- *The big single-target payoff,* gated on Sidestep / Slip Through to set up position.

**Envenom** — 1 AP, self-buff, once per fight — Your next 3 Stab/Backstab apply **Poisoned** ×2.
- A *rhythm* card — you don't burst with it, you *sustain* the pressure for a round.

**Slip Through** — 2 AP, Melee — Pass *through* an enemy to the tile behind them, dealing 3 Pierce on exit. Stuns yourself 0 — can be used mid-Intercept to break a line.
- *The Stalker's signature.* Turns "there's a Forsworn between me and the Necromancer" into a non-problem.

**Identity.** The Stalker plays *short*, makes one decisive cut per turn, and ends the fight with Salt still in reserve.

---

### ⛏️ Foreman's Pick — *The Breaker*
> The name 'Ashvere' is scratched into the handle. Someone before you dug.

**Posture:** Ignore the grid. Make a new one.

**Swing** — 1 AP, Melee — 5 Bludgeoning. **Destroys destructible terrain.**
- *Walls are not walls.* Rubble, pillars, salt deposits — the Pick decides what stays.

**Shatter** — 2 AP, Melee — 7 Bludgeoning; if target has **Bone Resonance ≥ 3**, target takes +5 and is **Stunned 1**. Consumes all Resonance.
- The skeleton-annihilator. Also the game's cleanest Helpless enabler.

**Heave** — 1 AP, Melee — 3 Bludgeoning + push 2 tiles. Pushed enemies crash into walls/enemies for +2 collision damage.
- *Positioning as damage.* Into pits, off ledges, into other enemies' telegraphs.

**Crack Bone** — 2 AP, Melee — 4 Bludgeoning, **Stunned 2** to target. +1 Bone Resonance.
- The setup card. Also the only Stun source in the kit that doesn't cost Salt.

**Prospect** — 1 AP, adjacent tile — Dig up a tile: 30% find Salt (+1 Salt), 30% uncover a hidden enemy, 40% nothing. Destructible terrain only.
- *A gamble card.* Roguelike spice. The Pick never forgets it's a tool, not just a weapon.

**Passive — Bone Resonance (max 5):** Every Bludgeoning hit against undead grants 1 stack; consumed by Shatter and certain Salt Rites. Tracks on-screen.

**Identity.** The Breaker rewrites the room. If the correct answer is "there is now a hole where the Banshee was standing," this is your voice.

---

### ⚔️ Vigil Blade — *The Warden*
> Standard issue. Every knight carried one. Yours still fits the scabbard.

**Posture:** Line-holder. Punish movement. Make the enemy fight on your timing.

**Slash** — 1 AP, Melee — 5 Slash. No frills — this weapon's power is in its *reactions*.

**Riposte Stance** — 1 AP, self — Until next turn, the first melee enemy that enters an adjacent tile takes 6 Slash and is halted (telegraph cancelled).
- *The game's best "I dare you" card.* Turns the Vigil Blade into a trap.

**Lunge** — 2 AP, line 2 — 6 Slash, move 1 tile forward after the strike. Breaks the enemy's facing (they now face away from you).
- Combo-enabler for Stalker subclass dipping, but standalone it's a reach extender.

**Disarm** — 2 AP, Melee — 3 Slash + target's next telegraphed attack is **cancelled** (not delayed). Once per fight per enemy.
- *Card Quest answer to the Necromancer / Lich raise turn.* The single most important Vigil card against bosses.

**Guard** — 1 AP, self — Armor 3 this turn + **Intercept**: if an adjacent ally (or corpse, if you're playing Necromancer-lite with Salt Rites) would be targeted, the attack redirects to you.
- *The Warden's oath reshaped into a card.* In a solo run, Guard defends corpses you've seeded for Rite of Parting.

**Identity.** The Warden never moves first. The Warden waits, counters, and makes the enemy's turn cost more than yours.

---

### ⛓️ Censer Flail — *The Psalmist*
> The thurible still smells of frankincense. The chain is long enough to reach past the pulpit.

**Posture:** Area denial, consecrate ground, burn corruption out of rooms.

**Swing Censer** — 1 AP, adjacent or diagonal — 3 Bludgeoning + Holy. Creates a 1-turn **smoke** tile behind the target (covers LOS).
- *The attack makes the battlefield for you.*

**Censing Arc** — 2 AP, cone 3 — 4 Bludgeoning + Holy to all in a 3-tile cone; applies **Burning ×2** to undead.
- Banshee-and-Ghost cleaver. Also the only Burning source in the base kit.

**Sanctified Ground** — 2 AP, radius 1 — Converts target tile + adjacents into **Hallowed Ground** for 3 turns. Undead in Hallowed take 2 dmg/turn and cannot be summoned onto it.
- *The Necromancer counterplay.* A turn spent here re-writes the room's economy.

**Incense Cloud** — 1 AP, radius 1 — Creates a 2-turn smoke zone. You see out; enemies don't see in. Blocks ranged telegraphs resolving through it.
- LOS chess. The Psalmist's "I close the door."

**Penitent's Toll** — 3 AP, Salt 1 — Target undead takes 8 Holy + you heal 4 HP per stack of **Burning** on the target. Consumes all stacks.
- *The Psalmist's finisher.* Set with Censing Arc, cash with Toll. Only scales with prior planning.

**Identity.** The Psalmist plays 2-turn sentences. Nothing they do in isolation is strong — every card is a setup for the *next* card. Against a boss, the Psalmist wins by already having won two turns ago.

---

### 🏹 Warden's Crossbow — *The Watcher* (optional fifth voice)
> The order watched from a distance. They were right to.

**Posture:** Range, patience, single-target erasure.

**Shoot** — 1 AP, line/ranged 5 — 4 Pierce. Requires LOS.

**Piercing Shot** — 2 AP, line ranged 5 — 6 Pierce, **ignores Armor**, passes through first target to hit second (if in line).
- The Forsworn / Skeleton Lord answer.

**Pin Shot** — 2 AP, ranged 5 — 3 Pierce + **Immobilized 2**. Pinned enemies that are pushed take +3 Pierce from the pin tearing.
- Combos with Heave. Combos with any push telegraph from enemies themselves.

**Overwatch** — 1 AP, self — Pick a tile within range. First enemy to enter the tile takes 5 Pierce. Lasts until next turn.
- *Timeline insertion reified.* You're inserting into the enemy's move step, not your own turn.

**Cull** — 3 AP, Salt 2 — Ranged 7 — 12 Pierce to the lowest-HP visible enemy. If it kills, the bolt re-fires at the next-lowest.
- *Chain finisher.* Cleans a room of Rats / Larva / chip-damaged casters in one card. Salt cost makes it a once-per-floor play.

**Identity.** The Watcher doesn't enter rooms; they *survey* them. Overwatch + Pin + Cull is the complete sentence.

---

## 5. Offhand — The Shield Voice

Offhand slot changes the *defensive* grammar. Two-handed weapons (Crossbow, Warhammer-future) forfeit it.

### Round Shield — *The Brace*
- **Passive:** First hit each turn is reduced by 50%.
- **Block** (1 AP, self) — Armor 4 this turn.
- **Shield Bash** (1 AP, adjacent) — 2 Bludgeoning + push 1 + Stunned 1 on wall-slam.

### Reliquary Aegis — *The Aegis* (late-game)
- **Passive:** Undead attacks against you have −1 damage.
- **Ward Line** (2 AP, line 2) — Drop a ward barrier along 2 adjacent tiles for 2 turns. Undead cannot cross; players and corporeal enemies can.
- **Lay Hands** (2 AP, Salt 1, adjacent) — Heal 8 HP OR resurrect a non-boss corpse as a 1-HP ally for 2 turns.

---

## 6. Armor Slots (Body)

Armor is a passive layer plus one active card. Keep armor choices *meaningful*, not cosmetic.

- **Leather Coat** — Armor 1; +1 max AP; passive: Aggro Reduction (ranged enemies prefer allies over you). Active: **Vanish** (2 AP, self, once per fight) — Gain **Hidden 2**.
- **Chainmail** — Armor 2. Active: **Set Feet** (1 AP, self) — Immune to push until next turn.
- **Vigil Plate** — Armor 3, −1 max AP; passive: Incorporeal enemies deal half damage. Active: **Oath Broken** (3 AP, Salt 1, self) — Next attack you take is *reflected* at full damage back to the attacker.

---

## 7. Consumables (Bag slot, 3 slots)

Consumables in Card Quest are one-shots. Here they're one-shots *with grid presence*.

| Card | AP | Range | Effect |
|---|---|---|---|
| **Healing Draught** | 1 | self | +10 HP. |
| **Grave-Salt Vial** | 1 | tile 3 | Creates a **salt deposit** tile for 3 turns. Undead cannot enter. |
| **Censer Oil** | 1 | self | Your next attack is Holy and applies Burning ×2. |
| **Paper Lantern** | 0 | radius 2 | Light zone for 4 turns. Reveals Hidden. |
| **Bone Dust** | 1 | tile 4 | +1 Bone Resonance; on throw, blinds a 1-tile radius for 1 turn. |
| **Pit Whistle** | 1 | tile 4 | Forces one non-boss enemy to step 1 tile toward you. Breaks their facing. |
| **Black Powder Charge** | 2 | tile 3 | 2-turn fuse. Detonates for 6 Bludgeoning in a 1-tile radius; destroys terrain. |
| **Widow's Kerchief** | 1 | self | **Cleanse** all conditions + gain Hidden 1. |
| **Ashvere Reliquary** | 3 | self | Salt Rite charm — refund 1 Salt + draw 2. Once per run. |

### Consumable Design Rules
- **No raw damage consumables above 10.** Damage should come from cards; consumables bend *state*.
- **Every consumable leaves the grid different.** A vial that just heals is boring compared to one that creates a salt tile.

---

## 8. Loadout Archetypes ("Subclasses")

Unlocked by completing a run with a weapon focus. Starting loadout + one bonus passive.

| Name | Main + Offhand + Armor | Bonus Passive |
|---|---|---|
| **The Inheritor** (starter) | Ashvere Knife + Round Shield + Leather | +1 max Salt. |
| **Deep Foreman** | Foreman's Pick + Round Shield + Chainmail | Start each fight with 1 Bone Resonance. |
| **Last Warden** | Vigil Blade + Reliquary Aegis + Vigil Plate | Riposte Stance refunds 1 AP on trigger. |
| **Censer-Bearer** | Censer Flail (2H) + Vigil Plate | Hallowed Ground lasts +1 turn. |
| **The Watcher** | Warden's Crossbow (2H) + Leather | First Overwatch each fight costs 0 AP. |
| **The Grave-Eater** (unlock) | Any + any + any | Once per fight, consume an adjacent corpse: heal 5 + draw 1. *Card Quest Necromancer's "Souls" equivalent — a persistent corpse economy.* |

---

## 9. Conditions the Player Can Suffer

Extending [src/data/status.ts](src/data/status.ts) with Card Quest-grade design:

| Condition | Source | Effect | Counterplay |
|---|---|---|---|
| **Bleeding** | Vampire Lord, Ghoul Pounce, Razor Thorns | 1 dmg/turn per stack; max 5 stacks. | Antidote, Widow's Kerchief, Sanctified Ground (burns it off). |
| **Poisoned** | Rot zones, False Sacrarium, Larva | 2 dmg/turn for N turns; does *not* stack duration, only refreshes. | Antidote, stepping off Rot. |
| **Burning** | Rarely inflicted on player — only Lich's pyre. | 2 dmg/turn; +1 tile becomes **smoke** when you move. | Move to water tile (future terrain). |
| **Stunned** | Warhammer slam (enemy), Grapple, Crashing Bone | Skip next turn. | Widow's Kerchief pre-emptively. |
| **Immobilized** | Salt Revenant Grapple, webs | Cannot move; can still attack. | Brace + attack the grappler. |
| **Silenced** | Banshee Dirge, Throat Shot (on enemy) | Cannot play AP>1 ability cards. Universal cards still work. | Wait a turn, or Salt Rite through it. |
| **Marked** | Lich King, Necromancer | +50% damage from next hit by any enemy. | Disarm the marker or move out of LOS. |
| **Dimmed** (new) | Shadow Strike, low Light | −1 damage on attacks this turn. | Torch or Paper Lantern. |
| **Cursed** (new) | Forsworn, False Sacrarium aura | +1 AP cost on next ability card. | Rite of Parting cleanses. |
| **Hungered** (new, weapon-specific) | Grave-Eater subclass overuse | If you don't consume a corpse by turn 4, take 2 dmg/turn. | Eat a corpse. *Power with a price.* |

---

## 10. Conditions the Player Can Inflict

### Helpless Umbrella (Card Quest mechanic ported)
- **Stunned**, **Immobilized + facing away**, or **Hidden-attacker** against a target = *Helpless* for that attack.
- Backstab, Shatter, Penitent's Toll, and Cull all deal **+50%** against Helpless.
- The game's core combo language: *Set Helpless → spend a finisher.*

### Inflictable Conditions
- **Bleeding** — Deep Gash-style slash procs, Sidestep triggers. *Slash weapons.*
- **Stunned** — Crack Bone, Shatter, Ground Slam. *Bludgeoning weapons.*
- **Immobilized** — Pin Shot, Ward Line, salt deposits. *Crossbow / terrain.*
- **Poisoned** — Envenom, Poison Flask, stepping Rot tiles onto enemies. *Knife / consumable.*
- **Burning** — Censer, Censing Arc, Black Powder. *Holy / fire kit.*
- **Marked** — new player ability (Watcher unlock): *Call of the Hunt* (1 AP, ranged) — mark an enemy. All player attacks against it deal +2 for 2 turns.

---

## 11. Salt Rites (the Big-Swing Layer)

Salt Rites are the game's answer to Card Quest's class-specific finishers. They all cost 3 AP + Salt, never refill mid-fight, and are the closest thing to "spells."

- **Rite of Parting** (1 Salt) — adjacent corpse → 1 Salt refund + cleanse.
- **Rite of the Long Night** (2 Salt) — Target enemy's *telegraphed intent is removed*. Their timeline slot becomes a wait. *Card Quest Wizard's Blink answer.*
- **Rite of Bitter Shore** (3 Salt) — All tiles in LOS become salt deposits for 2 turns. Undead panic.
- **Rite of the Vigil** (3 Salt) — Revive an adjacent corpse as a 1-HP ally with the dead enemy's own intents — but it now fights for you. Up to 2 turns.
- **Rite of Unmaking** (4 Salt) — Target non-boss enemy is *deleted* from the timeline. No XP, no loot drops from it. Emergency-only by design.
- **Rite of the Last Light** (5 Salt, once per run) — Full heal, cleanse, gain Hidden 3. The "one more floor" button.

### Salt Rite Design Rules
- A Salt Rite is **never** a damage-per-salt trade. Salt buys *narrative effects* — delete a turn, delete an enemy, change the board state.
- The player should leave the game remembering which Rite they cast, not which number it rolled.

---

## 12. The Deck & Draw

Card Quest uses deck cycling. This engine uses AP-per-turn with per-ability cooldowns. To bring them closer:

### Proposed Hybrid
- Equipped weapon + offhand + armor + 3 consumables = your "deck" (roughly 15 cards).
- Each turn you have full access to all non-cooling cards — but each card has a **Refresh** timer:
  - **Basic attacks** (Stab, Slash, Swing, Shoot) — no cooldown.
  - **Signatures** (Backstab, Shatter, Disarm, Censing Arc, Piercing Shot) — 2-turn Refresh.
  - **Finishers** (Penitent's Toll, Cull, Oath Broken) — once per fight.
  - **Rites** — Salt-cost gated only.

This keeps the current code's cooldown model while giving the *feel* of a Card Quest hand — "which cards are live *this turn*" becomes the central decision.

---

## 13. Signature Turn Scripts (what a good turn *looks* like)

Not rules — **example plays** that define the identity.

### Stalker vs. Necromancer + 2 Zombies
- Sidestep diagonal *through* the Zombie's telegraph (free 3 dmg, avoid the hit).
- Slip Through the Zombie → behind the Necromancer.
- Backstab (Helpless from rear arc) → 9 + 50% = Necromancer dead.
- Salt +1 (finisher). Zombies now lost (Controlled trait). *Total: 4 AP, 1 turn, room resolved.*

### Breaker vs. Skeleton Lord
- Crack Bone: Stun 2 + Bone Resonance 1.
- Swing: destroy the pillar behind him.
- Heave: push him into the pillar's rubble pile, +2 collision + Bone Resonance 2.
- Wait a turn (Brace).
- Shatter at Resonance ≥3: 7 + 5 bonus, and he's Stunned again. *Bone Resonance is the turn the Lord dies.*

### Warden vs. anything that moves
- Riposte Stance.
- Guard.
- End turn.
- *Enemy AI sees a grid full of "don't approach" tiles.* They move toward you anyway; the Riposte fires, the Guard soaks, you counter-push on the next turn. *No card played on offense this turn. Still won.*

### Psalmist vs. False Sacrarium room
- Sanctified Ground on the Sacrarium's tile (it takes 2/turn just for existing).
- Censing Arc through the Sacrarium + 2 Larva — Burning on all.
- Wait.
- Penitent's Toll on the Sacrarium — 8 Holy + heal 8 (from 4 Burning stacks across the room). *You finished at higher HP than you started.*

### Watcher vs. Forest ambush (4 Rats + 1 Ghoul)
- Overwatch tile at the chokepoint.
- Pin Shot on the Ghoul.
- Wait.
- Rats walk into Overwatch — 3 dead.
- Pin keeps Ghoul at 5 dmg range; Shoot until done.

---

## 14. Anti-Patterns (what the kit specifically avoids)

- **"Number go up" cards.** No +1 damage passives. All bonuses come from *state*, not stacking.
- **No filler defensives.** Brace exists as the minimum; other defensive cards are *reactive* (Riposte, Guard, Overwatch) — they punish enemy action, not fill turns.
- **No damage-only consumables past tier 1.** Higher tiers shape the board.
- **No always-correct card.** Every signature is wrong in some matchup. Disarm is wasted on a Zombie; Shatter wastes its passive on a Rat; Overwatch is dead in a single-enemy room. *Matchup literacy is the skill ceiling.*

---

## 15. Open Design Questions

- **How many AP does the player really want?** 3 encourages 1+1+1 micro-decisions; 4 opens combo lines; 2 is brutal. A playtest will decide.
- **Does Salt earn rate feel right?** If too fast, Rites become routine; if too slow, they're never cast. Target: 1 Rite per 2 floors.
- **Weapon-swap mid-fight?** The engine has `weapon_switch` as a special. Leaning *against* it — the commitment to one voice is part of identity. Maybe unlock as a subclass (The Arsenal).
- **Corpse economy.** Rite of Parting, Grave-Eater, Rite of the Vigil, Lay Hands all touch corpses. There's a small-game layer here about *when* to spend a corpse. Should be made first-class in the UI.
- **Card Quest's Hidden mechanic.** Stalker's Vanish + Slip Through should grant first-strike damage bonus when breaking Hidden. Currently Hidden is just "skip next attack" from the old kit — port to Card Quest's attacker-side Hidden.

---

See [docs/card-quest-monster-design.md](docs/card-quest-monster-design.md) for the matching enemy redesign.
