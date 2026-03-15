# Combat Mechanics — Generic Hook System

## Summary

Replace the monolithic `doEnemyTurn()` if/else chain in `CombatScreen.tsx` with a **composable hook-based system** where each monster defines its own lifecycle functions. The combat engine calls hooks at the right moments; each monster only implements the hooks it needs.

## Design

### Lifecycle hooks

Each `EnemyType` can provide a `combatMechanics` object with these optional hooks:

```
onTurnStart(self, ctx) → CombatAction[]
```
Called once per living enemy at the start of the enemy turn, before attacks.
**Used by:** Heap reassembly, Necromancer summon, Lich raise, Banshee drain, Shadow light drain, Rat swarm chip, Demon regen, Skullflower growth.

```
onAttack(self, ctx) → AttackResult | null
```
Called when it's this enemy's turn to attack. Returns an `AttackResult` that replaces or modifies the default attack. Return `null` to use the standard attack.
**Used by:** Ghoul ambush/leap, Zombie empowerment, Vampire lifesteal, Grave Robber flee attempt, Demon multi-attack, Rat (skip — handled in onTurnStart).

```
onReceiveHit(self, ctx, hit) → HitResponse
```
Called when this enemy is hit by the player. Can evade, modify damage, or trigger effects.
**Used by:** Ghost phase (evade), Skeleton reassemble on death.

```
onDeath(self, ctx) → CombatAction[]
```
Called when this enemy's HP drops to 0. Can spawn replacements or trigger effects.
**Used by:** Skeleton → heap of bones, Gutborn → larvae.

### Types

```ts
/* ── Combat context passed to all hooks ── */
interface CombatContext {
  enemies: Enemy[];
  player: CombatPlayer;
  lightLevel: number;
}

/* ── Actions returned by hooks, processed by the engine ── */
type CombatAction =
  | { type: "damage_player"; amount: number }
  | { type: "apply_status_player"; status: StatusKey; stacks: number }
  | { type: "heal_self"; amount: number }
  | { type: "spawn"; enemyId: string; row?: "front" | "back" }
  | { type: "revive"; hpFraction: number; filter?: (e: Enemy) => boolean }
  | { type: "drain_light"; amount: number }
  | { type: "transform"; intoId: string; preserveRow?: boolean }
  | { type: "log"; message: string }
  | { type: "skip_attack" };

/* ── Returned by onAttack to modify the standard attack ── */
interface AttackResult {
  skip?: boolean;              // don't attack (swarm, heap, grave robber)
  damageMultiplier?: number;   // ghoul leap 3×
  lifestealFraction?: number;  // vampire 50%
  atkOverride?: number;        // zombie empowered ATK
  extraActions?: CombatAction[];
}

/* ── Returned by onReceiveHit ── */
interface HitResponse {
  evade?: boolean;             // ghost phase
  actions?: CombatAction[];    // skeleton: spawn heap on death
}

/* ── The mechanics object on EnemyType ── */
interface CombatMechanics {
  onTurnStart?: (self: Enemy, ctx: CombatContext) => CombatAction[];
  onAttack?: (self: Enemy, ctx: CombatContext) => AttackResult | null;
  onReceiveHit?: (self: Enemy, ctx: CombatContext, hit: { damage: number; holy: boolean; finishing: boolean }) => HitResponse;
  onDeath?: (self: Enemy, ctx: CombatContext) => CombatAction[];
}
```

### How each monster maps to hooks

| Monster | onTurnStart | onAttack | onReceiveHit | onDeath |
|---------|-------------|----------|--------------|---------|
| Rat | chip damage (1 per living rat) | skip (handled by turnStart) | — | — |
| Skeleton | — | default | — | spawn heap_of_bones (unless finishing) |
| Heap of Bones | countdown → reassemble into skeleton | skip | — | — |
| Banshee | apply weaken to player (unless silenced) | default (ranged) | — | — |
| Ghost | — | default | phase: 50% evade (holy bypasses) | — |
| Ghoul | tick ambush cooldown | if hiding: skip+log; if leaping: 3× multiplier; then re-hide | — | — |
| Vampire | — | lifestealFraction: 0.5 | — | — |
| Shadow | drain light by 1 | default | — | — |
| Necromancer | summon cooldown → revive dead or spawn zombie | default (ranged) | — | — |
| Zombie | — | atkOverride: 2× if necro alive | — | — |
| Lich King | revive 1 dead at 30% HP | default | — | — |
| Grave Robber | — | skip (tries to flee) | — | — |
| Demon | regen HP | multi-attack (extraActions) | — | — |
| Skullflower | grow HP (unless lit) | default | — | — |
| Gutborn | — | host attack + spawn larva action | — | spawn larvae |
| Gutborn Larva | — | skip (tries to infect — telegraphed) | — | — |

### Action executor

A single `executeActions(actions: CombatAction[], ctx)` function processes all returned actions. This is the only place that mutates combat state from mechanics. It handles:
- `damage_player`: subtract from block then HP
- `apply_status_player`: add stacks to player status
- `heal_self`: clamp to maxHp
- `spawn`: call `makeEnemy()`, push to enemies array
- `revive`: find first matching dead enemy, restore HP
- `drain_light`: reduce light level
- `transform`: replace self with new enemy (preserve row)
- `log`: push to combat log
- `skip_attack`: flag to skip standard attack

### Refactored doEnemyTurn flow

```
1. For each living enemy: call onTurnStart → collect actions → execute
2. For each living enemy (attack phase):
   a. Skip if stunned/stealthed
   b. Call onAttack → get AttackResult
   c. If skip: continue
   d. Apply atkOverride / damageMultiplier to base ATK
   e. Apply weaken modifier
   f. Resolve block → deal damage to player
   g. If lifestealFraction: heal enemy
   h. If counter active: reflect damage
   i. Execute any extraActions
3. Darkness penalty (system, not per-monster)
4. Status ticks (system)
5. Victory/defeat check
6. Reset block/stealth/counter
```

### Refactored resolveHit flow

```
1. Call target.onReceiveHit(hit) → HitResponse
2. If evade: log and return
3. Apply holy multiplier, block, damage
4. Apply weapon status effects
5. If target.hp <= 0: call target.onDeath() → execute actions
```

## Affected files

| File | Change |
|------|--------|
| `src/types.ts` | Add `CombatAction`, `AttackResult`, `HitResponse`, `CombatMechanics`, `CombatContext` types. Add `combatMechanics?: CombatMechanics` to `EnemyType`. Remove `strategy` field. |
| `src/data/enemies.ts` | For each enemy, define `combatMechanics` with the appropriate hook implementations. Remove `mechanic` and `mechanicDesc` string fields (replaced by the hooks). |
| `src/combat/actions.ts` | **New file.** `executeActions()` function — central action processor. |
| `src/combat/mechanics.ts` | **New file.** The per-monster mechanic implementations (one exported object per monster). Keep them here rather than inline in enemies.ts to avoid a massive data file. |
| `src/components/CombatScreen.tsx` | Refactor `doEnemyTurn()` to iterate hooks instead of if/else. Refactor `resolveHit()` to call `onReceiveHit` / `onDeath`. Remove all hardcoded mechanic branches. |
| `src/utils/helpers.ts` | No changes needed (makeEnemy stays the same). |

## Implementation steps

1. **Define types** — Add all new types to `types.ts`. Add `combatMechanics` to `EnemyType`. Keep `mechanic`/`mechanicDesc` temporarily for backwards compat during migration.
2. **Create `src/combat/actions.ts`** — Implement `executeActions()` that processes the `CombatAction[]` union and mutates state.
3. **Create `src/combat/mechanics.ts`** — Implement each monster's hooks as named exports (e.g., `export const ratMechanics: CombatMechanics = { ... }`). Port the logic from the current if/else branches.
4. **Wire mechanics to enemies** — In `enemies.ts`, assign the `combatMechanics` field for each enemy, importing from `mechanics.ts`.
5. **Refactor `doEnemyTurn()`** — Replace the monolithic function with the generic hook-calling loop. Process `onTurnStart` → `onAttack` in order.
6. **Refactor `resolveHit()`** — Replace inline mechanic checks with `onReceiveHit` and `onDeath` calls.
7. **Remove old fields** — Drop `mechanic`, `mechanicDesc`, `strategy` from `EnemyType` and all enemy definitions once fully migrated.
8. **Test** — Run through combat with each monster type, verify behavior matches current implementation.

## Key decisions

- **Hooks live on EnemyType, not Enemy instance** — The mechanics are defined once per type, not per instance. Instance state (cooldowns, HP, etc.) is on `Enemy`. Hooks receive `self: Enemy` to read/write instance state.
- **Actions as data, not side effects** — Hooks return action objects rather than mutating state directly. This keeps mechanics testable, composable, and makes the execution order explicit.
- **Separate file for mechanics** — Monster hook implementations go in `combat/mechanics.ts` rather than inline in `enemies.ts`. This keeps the data file clean and the logic discoverable.
- **No `strategy` field** — Removed per user request. Strategy is design-doc-only guidance.

## Risks / considerations

- **Action ordering** — `onTurnStart` actions execute per-enemy in array order. If order matters (e.g., necromancer revives before lich), the enemy array order in encounters determines it. This matches current behavior.
- **Mutable state in hooks** — Hooks receive the actual `Enemy` reference and can mutate fields like `summonCooldown` and `ambushTurns` directly. This is pragmatic but means hooks have side effects beyond their return value. Alternative: return state mutations as actions too, but this adds complexity for little gain.
- **Heap of bones as a separate enemy** — The skeleton→heap→skeleton cycle currently uses two enemy IDs. The new system preserves this: `onDeath` spawns heap, heap's `onTurnStart` transforms back. No change needed.
- **Counter/stealth interaction** — Counter reflect happens in the attack resolution loop, not in hooks. This stays in the engine, not in monster mechanics.
