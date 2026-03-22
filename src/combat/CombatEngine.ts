import { ENEMY_TYPES } from "../data/enemies";
import { getPlayerCombatAbilities, resolveChargingBlow } from "../data/abilities";
import {
  hydrateEnemy,
  makeEnemyData,
  toEnemyData,
  tickStatuses,
  cloneEnemies,
} from "../utils/helpers";
import {
  WEAKEN_DMG_MULT,
  COUNTER_REFLECT_FRACTION,
  FLEE_CHANCE,
  LIGHT_START,
  DARKNESS_DAMAGE,
} from "../data/constants";
import { resolveActions } from "./actions";
import { animationDelay } from "./animTiming";
import type {
  DungeonNode,
  Enemy,
  EnemyData,
  CombatPlayer,
  CombatState,
  CombatContext,
  Ability,
  ActionContext,
  AnimationEvent,
  Player,
} from "../types";

/* ── State machine phases ── */

export type CombatPhase =
  | "player_turn"
  | "player_animating"
  | "enemy_turn"
  | "enemy_animating"
  | "victory"
  | "defeat";

/* ── Snapshot: everything React needs to render ── */

export interface CombatSnapshot {
  phase: CombatPhase;
  enemies: Enemy[];
  player: CombatPlayer;
  lightLevel: number;
  log: string[];
  animEvents: AnimationEvent[];
  /** Per-enemy CSS animation class keys (e.g. "attacked", "phase") */
  enemyAnimStates: Record<string, string>;
  /** Player panel flash class */
  playerFlash: string | null;
  /** Gold earned on victory */
  victoryLoot: number;
  /** All abilities available to the player this turn */
  allAbilities: Ability[];
}

/* ── Callbacks the engine fires ── */

export interface CombatCallbacks {
  /** Called when state changes — React should re-render */
  onStateChange: () => void;
  /** Called on victory with the combat player state and loot */
  onVictory: (player: CombatPlayer, loot: number) => void;
  /** Called on defeat with remaining gold */
  onDefeat: (gold: number) => void;
  /** Called on successful flee */
  onFlee: (player: CombatPlayer) => void;
}

/* ── The Engine ── */

export class CombatEngine {
  private _phase: CombatPhase = "player_turn";
  private _state: CombatState;
  private _log: string[] = [];
  private _animEvents: AnimationEvent[] = [];
  private _enemyAnimStates: Record<string, string> = {};
  private _playerFlash: string | null = null;
  private _victoryLoot = 0;
  private _room: DungeonNode;
  private _cb: CombatCallbacks;
  private _animAbort: AbortController | null = null;
  private _destroyed = false;

  constructor(
    room: DungeonNode,
    player: Player,
    callbacks: CombatCallbacks,
    opts?: {
      /** Restored combat state from a save */
      restored?: {
        enemies: EnemyData[];
        combatPlayer: CombatPlayer;
        lightLevel: number;
        combatLog: string[];
      };
      surpriseRound?: boolean;
    },
  ) {
    this._room = room;
    this._cb = callbacks;

    if (opts?.restored) {
      this._state = {
        player: opts.restored.combatPlayer,
        enemies: opts.restored.enemies.map(hydrateEnemy),
        lightLevel: opts.restored.lightLevel,
      };
      this._log = opts.restored.combatLog;
    } else {
      let enems = room.enemies.map((e) =>
        hydrateEnemy(makeEnemyData(e.typeId, e.uid, e.hpOverride)),
      );
      if (room.trap === "snare")
        enems = enems.map((e) => ({
          ...e,
          statuses: { ...e.statuses, stun: 1 },
        }));
      if (room.trap === "flash") enems = enems.map((e) => ({ ...e, hp: Math.max(1, e.hp - 8) }));

      let combatPlayer: CombatPlayer = {
        ...player,
        block: 0,
        stealthActive: false,
        counterActive: false,
        abilityCooldowns: {},
      };

      let lightLevel = LIGHT_START;
      this._log = [`⚔ Combat begins: ${room.label}`];

      // Run onStartCombat hooks (e.g. ghoul hides)
      const startCtx: CombatContext = {
        enemies: enems,
        player: combatPlayer,
        lightLevel: { value: lightLevel },
      };
      for (const e of enems) {
        const actions = e.combatMechanics?.onStartCombat?.(e, startCtx);
        if (actions?.length) {
          const result = resolveActions(actions, combatPlayer, enems, lightLevel, []);
          combatPlayer = result.player;
          enems = result.enemies;
          lightLevel = result.lightLevel;
          result.log.forEach((l) => this._log.push(l));
        }
      }

      this._state = { player: combatPlayer, enemies: enems, lightLevel };
    }

    if (opts?.surpriseRound && !opts?.restored) {
      this._log = ["⚠️ Ambush! Enemies burst into the room!"];
      this._pendingSurpriseRound = true;
    }
  }

  private _pendingSurpriseRound = false;

  /** Call after React has subscribed to ensure no updates are missed.
   *  Also reactivates the engine if it was destroyed by a StrictMode
   *  unmount/remount cycle. */
  start() {
    this._destroyed = false;
    if (this._pendingSurpriseRound) {
      this._pendingSurpriseRound = false;
      this._doEnemyTurn(false);
    }
  }

  /* ── Public read-only snapshot ── */

  get snapshot(): CombatSnapshot {
    const { player, enemies, lightLevel } = this._state;
    return {
      phase: this._phase,
      enemies: enemies.map((e) => ({ ...e, statuses: { ...(e.statuses || {}) } })),
      player: { ...player, statuses: { ...player.statuses } },
      lightLevel,
      log: this._log,
      animEvents: this._animEvents,
      enemyAnimStates: this._enemyAnimStates,
      playerFlash: this._playerFlash,
      victoryLoot: this._victoryLoot,
      allAbilities: getPlayerCombatAbilities(player),
    };
  }

  /** Serializable state for Redux persistence / saves */
  get serializable() {
    return {
      enemies: this._state.enemies.map(toEnemyData),
      combatPlayer: this._state.player,
      lightLevel: this._state.lightLevel,
      combatLog: this._log,
    };
  }

  get phase() {
    return this._phase;
  }

  /* ── Helpers ── */

  private _addLog(msg: string) {
    this._log = [msg, ...this._log].slice(0, 200);
  }

  private _notify() {
    if (this._destroyed) return;
    this._cb.onStateChange();
  }

  private _makeActionContext(): ActionContext {
    return {
      player: this._state.player,
      enemies: this._state.enemies,
      lightLevel: this._state.lightLevel,
      weapon: this._state.player.mainWeapon,
      offhandWeapon: this._state.player.offhandWeapon,
    };
  }

  private _checkVictory(): boolean {
    const alive = this._state.enemies.filter((e: Enemy) => e.hp > 0);
    if (!alive.length) {
      const loot = this._room.enemies.reduce(
        (s, e) => s + (ENEMY_TYPES.find((t) => t.id === e.typeId)?.loot || 0),
        0,
      );
      this._addLog(`🏆 Victory! +${loot} gold`);
      this._victoryLoot = loot;
      this._phase = "victory";
      this._notify();
      return true;
    }
    return false;
  }

  canReach(reach: "melee" | "ranged", target: Enemy): boolean {
    if (target.hidden) return false;
    if (reach === "ranged") return true;
    const aliveFront = this._state.enemies.filter(
      (e: Enemy) => e.hp > 0 && !e.hidden && e.row === "front",
    );
    return target.row === "front" || aliveFront.length === 0;
  }

  /* ── Animation playback (Promise-based) ── */

  /** Set animation events and notify React, then wait for them to finish. */
  private async _playAnimations(events: AnimationEvent[]): Promise<void> {
    if (events.length === 0) return;

    this._animEvents = events;
    this._notify();

    await this._waitForAnimations(events);
  }

  /** Wait for an animation batch to finish, then clear visual state. */
  private async _waitForAnimations(events: AnimationEvent[]): Promise<void> {
    this._animAbort?.abort();
    const abort = new AbortController();
    this._animAbort = abort;

    const totalDuration = events.reduce((sum, e) => sum + animationDelay(e), 0) + 500;

    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        if (!abort.signal.aborted) {
          this._animEvents = [];
          this._enemyAnimStates = {};
          this._playerFlash = null;
          this._notify();
        }
        resolve();
      }, totalDuration);

      abort.signal.addEventListener("abort", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  /* ── Player actions ── */

  /** Check if an ability is currently usable */
  isAbilityDisabled(ability: Ability): boolean {
    if (this._phase !== "player_turn") return true;
    if ((this._state.player.abilityCooldowns[ability.id] || 0) > 0) return true;
    if (ability.source.type === "building" && (this._state.player.statuses?.silence || 0) > 0)
      return true;
    if (this._state.player.chargingAbility) return true;
    return false;
  }

  /** Start ability activation — returns true if it needs a target */
  activateAbility(ability: Ability): boolean {
    if (this.isAbilityDisabled(ability)) return false;

    if (ability.needsTarget) {
      return true; // caller should show target picker
    }

    this._executeAbility(ability, []);
    return false;
  }

  /** Execute ability with targets (called after target selection, or immediately for no-target abilities) */
  executeAbilityWithTargets(ability: Ability, targets: number[]) {
    this._executeAbility(ability, targets);
  }

  private async _executeAbility(ability: Ability, targets: number[]) {
    // Lock out immediately to prevent double-execution from fast clicks
    this._phase = "player_animating";

    // Flee is special
    if (ability.id === "flee") {
      if (Math.random() < FLEE_CHANCE) {
        this._addLog("🏃 You flee into the darkness!");
        this._notify();
        // Small delay for the log to render
        await this._delay(300);
        this._cb.onFlee(this._state.player);
      } else {
        this._addLog("❌ Flee failed! Enemies get a free turn.");
        this._notify();
        await this._doEnemyTurn(true);
      }
      return;
    }

    const ctx = this._makeActionContext();
    const actions = ability.execute(ctx, targets);
    const { player, enemies, lightLevel } = this._state;
    const result = resolveActions(actions, player, enemies, lightLevel, []);

    // Tick cooldowns at end of player turn
    const tickedCooldowns = { ...result.player.abilityCooldowns };
    if (result.endTurn) {
      for (const key of Object.keys(tickedCooldowns)) {
        tickedCooldowns[key] = Math.max(0, tickedCooldowns[key] - 1);
      }
    }

    let np = { ...result.player, abilityCooldowns: tickedCooldowns };
    let enems = result.enemies;

    // Charging blow resolution
    if (result.endTurn && np.chargingTurnsLeft !== undefined && np.chargingTurnsLeft > 0) {
      np = { ...np, chargingTurnsLeft: np.chargingTurnsLeft - 1 };
      if (np.chargingTurnsLeft === 0) {
        const chargeCtx: ActionContext = {
          player: np,
          enemies: enems,
          lightLevel: result.lightLevel,
          weapon: np.mainWeapon,
          offhandWeapon: np.offhandWeapon,
        };
        const chargeActions = resolveChargingBlow(chargeCtx);
        const chargeResult = resolveActions(chargeActions, np, enems, result.lightLevel, []);
        chargeResult.log.forEach((l) => this._addLog(l));
        np = chargeResult.player;
        enems = chargeResult.enemies;
      }
    }

    // Apply state and log
    result.log.forEach((l) => this._addLog(l));
    this._state = { player: np, enemies: enems, lightLevel: result.lightLevel };

    // Animate player action (phase already set to player_animating at method entry)
    this._notify();
    await this._playAnimations(result.anim);

    if (result.endTurn) {
      if (!this._checkVictory()) {
        await this._doEnemyTurn(false);
      }
    } else {
      // Ability didn't end turn (e.g. Quick Strike)
      this._phase = "player_turn";
      this._notify();
    }
  }

  /** Switch weapon — ends turn */
  async switchWeapon(w: import("../types").Weapon) {
    if (this._phase !== "player_turn") return;

    const isOffhand = w.hand === "offhand";
    let np: CombatPlayer;
    if (isOffhand) {
      if (this._state.player.offhandWeapon?.id === w.id) {
        np = { ...this._state.player, offhandWeapon: null };
        this._addLog(`🔄 Unequipped ${w.name}`);
      } else {
        np = { ...this._state.player, offhandWeapon: { ...w } };
        this._addLog(`🔄 Equipped ${w.name} (offhand)`);
      }
    } else {
      np = { ...this._state.player, mainWeapon: { ...w } };
      if (w.hand === "2") {
        np = { ...np, offhandWeapon: null };
      }
      this._addLog(`🔄 Switched to ${w.name}`);
    }
    np = { ...np, abilityCooldowns: {} };

    this._state = { ...this._state, player: np };
    this._notify();

    if (!this._checkVictory()) {
      await this._doEnemyTurn(false);
    }
  }

  /* ── Apply state + start animations in one render, so HP bars and
       floating numbers appear simultaneously ── */

  private async _applyAndAnimate(
    anim: AnimationEvent[],
    applyState?: () => void,
    opts?: { enemyAnimStates?: Record<string, string> },
  ) {
    // Set animations *before* applying state so the notify below
    // delivers both the HP change and the floating-number events
    // to React in a single snapshot.
    this._animEvents = anim;
    this._enemyAnimStates = opts?.enemyAnimStates ?? {};
    this._phase = "enemy_animating";
    applyState?.();
    // Single notify — React sees new HP + new animEvents together
    this._notify();

    if (anim.length === 0) return;

    await this._waitForAnimations(anim);
  }

  /** Derive the CSS animation class for an enemy from its animation events */
  private _deriveEnemyAnimState(uid: string, anim: AnimationEvent[]): Record<string, string> {
    for (const e of anim) {
      if ("attackerUid" in e && e.attackerUid === uid) {
        if (e.type === "enemy_attack") return { [uid]: "attacking" };
        if (e.type === "lifesteal") return { [uid]: "lifesteal" };
        if (e.type === "weaken_aura") return { [uid]: "weaken_aura" };
      }
      if (e.type === "drain_light" && e.amount > 0) return { [uid]: "drain_light" };
    }
    return {};
  }

  /* ── Process a single enemy's attack as one beat ── */

  private async _processEnemyAttack(
    enemy: Enemy,
    state: CombatState,
    commit: () => void,
  ): Promise<void> {
    const ctx: CombatContext = {
      enemies: state.enemies,
      player: state.player,
      lightLevel: { value: state.lightLevel },
    };
    const wasHidden = enemy.hidden;
    const mechResult = enemy.combatMechanics?.onAttack?.(enemy, ctx) ?? null;

    if (mechResult?.skip) {
      if (mechResult.extraActions?.length) {
        const r = resolveActions(
          mechResult.extraActions,
          state.player,
          state.enemies,
          state.lightLevel,
          [],
        );
        state.player = r.player;
        state.enemies = r.enemies;
        state.lightLevel = r.lightLevel;
        r.log.forEach((l) => this._addLog(l));
        if (r.anim.length > 0) {
          await this._applyAndAnimate(r.anim, commit);
        }
      }
      return;
    }

    // Reveal hidden enemy before attacking
    if (wasHidden) {
      enemy.hidden = false;
      commit();
      await this._playAnimations([{ type: "enemy_reveal", uid: enemy.uid }]);
    }

    // Compute effective attack value
    let atk = mechResult?.atkOverride ?? enemy.atk;
    if (mechResult?.damageMultiplier) atk = Math.floor(atk * mechResult.damageMultiplier);
    if ((enemy.statuses?.weaken || 0) > 0) atk = Math.floor(atk * WEAKEN_DMG_MULT);

    // Build actions and resolve through resolveActions
    const actions: import("../types").Action[] = [
      { type: "log", message: `${enemy.ascii} ${enemy.name}: ${atk} dmg` },
      { type: "damage_player", amount: atk },
    ];

    if (mechResult?.lifestealFraction && atk > 0) {
      const st = Math.floor(atk * mechResult.lifestealFraction);
      actions.push({ type: "heal_enemy", targetUid: enemy.uid, amount: st });
      actions.push({ type: "log", message: `🧛 ${enemy.name} heals ${st}` });
    }

    if (state.player.counterActive && atk > 0) {
      const reflect = Math.floor(atk * COUNTER_REFLECT_FRACTION);
      actions.push({
        type: "damage_enemy",
        targetUid: enemy.uid,
        amount: reflect,
        damageType: "bludgeoning",
      });
      actions.push({
        type: "log",
        message: `⚔️ Counter! ${reflect} reflected to ${enemy.name}`,
      });
    }

    if (mechResult?.extraActions?.length) {
      actions.push(...mechResult.extraActions);
    }

    const r = resolveActions(actions, state.player, state.enemies, state.lightLevel, []);
    state.player = r.player;
    state.enemies = r.enemies;
    state.lightLevel = r.lightLevel;
    r.log.forEach((l) => this._addLog(l));

    // Build animation events
    const beatAnim: AnimationEvent[] = [
      { type: "enemy_attack", attackerUid: enemy.uid, damage: atk },
      ...r.anim,
    ];
    if (mechResult?.lifestealFraction && atk > 0) {
      beatAnim.push({
        type: "lifesteal",
        attackerUid: enemy.uid,
        amount: Math.floor(atk * mechResult.lifestealFraction),
      });
    }

    await this._applyAndAnimate(beatAnim, commit, {
      enemyAnimStates: { [enemy.uid]: "attacking" },
    });
  }

  /* ── Enemy turn — processes each enemy as its own beat ── */

  private async _doEnemyTurn(isFleeFailure: boolean) {
    this._phase = "enemy_turn";

    // Show "Enemy Turn" label
    this._addLog("— Enemy Turn —");
    this._notify();
    await this._playAnimations([{ type: "turn_label", label: "Enemy Turn" }]);

    const state: CombatState = {
      player: { ...this._state.player, statuses: { ...this._state.player.statuses } },
      enemies: cloneEnemies(this._state.enemies),
      lightLevel: this._state.lightLevel,
    };

    /** Commit working state to the engine so React sees it */
    const commit = () => {
      this._state = {
        player: { ...state.player },
        enemies: state.enemies.map((e) => ({ ...e, statuses: { ...(e.statuses || {}) } })),
        lightLevel: state.lightLevel,
      };
    };

    // ── onTurnStart for each enemy (spawns, auras, etc.) ──
    const aliveAtStart = state.enemies.filter((e) => e.hp > 0);
    for (const enemy of aliveAtStart) {
      const ctx: CombatContext = {
        enemies: state.enemies,
        player: state.player,
        lightLevel: { value: state.lightLevel },
      };
      const actions = enemy.combatMechanics?.onTurnStart?.(enemy, ctx);
      if (actions?.length) {
        const result = resolveActions(actions, state.player, state.enemies, state.lightLevel, []);
        state.player = result.player;
        state.enemies = result.enemies;
        state.lightLevel = result.lightLevel;
        result.log.forEach((l) => this._addLog(l));

        if (result.anim.length > 0) {
          await this._applyAndAnimate(result.anim, commit, {
            enemyAnimStates: this._deriveEnemyAnimState(enemy.uid, result.anim),
          });
        }
      }
    }

    // ── Individual enemy attacks — one beat per enemy ──
    for (let i = 0; i < state.enemies.length; i++) {
      const enemy = state.enemies[i];
      if (enemy.hp <= 0) continue;
      if ((enemy.statuses?.stun || 0) > 0) {
        this._addLog(`⚡ ${enemy.name} stunned.`);
        continue;
      }
      if (state.player.stealthActive) continue;

      await this._processEnemyAttack(enemy, state, commit);

      if (state.player.hp <= 0) {
        commit();
        this._phase = "defeat";
        this._notify();
        this._cb.onDefeat(state.player.gold);
        return;
      }
    }

    if (state.player.stealthActive) {
      this._addLog("👤 Enemies can't find you in the shadows!");
    }

    // ── Darkness damage ──
    if (state.lightLevel <= 0) {
      state.player.hp -= DARKNESS_DAMAGE;
      this._addLog(`🌑 Darkness saps your life! -${DARKNESS_DAMAGE} HP`);
      await this._applyAndAnimate(
        [
          { type: "damage_player", amount: DARKNESS_DAMAGE },
          { type: "drain_light", amount: 0 },
        ],
        commit,
      );
    }

    // ── Tick statuses ──
    const ptick = tickStatuses({ ...state.player, name: "You" });
    state.player = { ...state.player, ...ptick.entity };
    ptick.log.forEach((l) => this._addLog(l));
    for (let i = 0; i < state.enemies.length; i++) {
      if (state.enemies[i].hp <= 0) continue;
      const t = tickStatuses(state.enemies[i]);
      t.log.forEach((l) => this._addLog(l));
      state.enemies[i] = t.entity as Enemy;
    }

    // Reset per-turn buffs
    state.player.block = 0;
    state.player.stealthActive = false;
    state.player.counterActive = false;

    if (!isFleeFailure) this._addLog("— Your Turn —");

    // Check defeat after status ticks
    if (state.player.hp <= 0) {
      commit();
      this._phase = "defeat";
      this._notify();
      this._cb.onDefeat(state.player.gold);
      return;
    }

    commit();
    this._phase = "player_turn";
    this._notify();
  }

  /** Confirm victory — called by React after the victory loot display */
  confirmVictory() {
    const p = this._state.player;
    this._cb.onVictory({ ...p, gold: p.gold + this._victoryLoot, block: 0 }, this._victoryLoot);
  }

  /** Confirm defeat — called by React after the defeat display */
  confirmDefeat() {
    this._cb.onDefeat(this._state.player.gold);
  }

  /* ── Cleanup ── */

  destroy() {
    this._destroyed = true;
    this._animAbort?.abort();
  }

  /* ── Utility ── */

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
