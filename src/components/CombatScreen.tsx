import { useState, useEffect, useRef, memo } from "react";
import { btnStyle } from "../styles";
import { ENEMY_TYPES } from "../data/enemies";
import { getPlayerCombatAbilities, resolveChargingBlow } from "../data/abilities";
import {
  hydrateEnemy,
  makeEnemyData,
  toEnemyData,
  tickStatuses,
  cloneEnemies,
} from "../utils/helpers";
import { StatusBadges, HpBar } from "./shared";
import {
  WEAKEN_DMG_MULT,
  COUNTER_REFLECT_FRACTION,
  FLEE_CHANCE,
  LIGHT_MAX,
  DARKNESS_DAMAGE,
  COMBAT_LOG_MAX,
} from "../data/constants";
import { resolveActions } from "../combat/actions";
import type {
  DungeonNode,
  Enemy,
  CombatPlayer,
  CombatContext,
  Ability,
  ActionContext,
} from "../types";
import { useAppDispatch, useAppSelector } from "../store";
import { updateCombatState } from "../store/combatSlice";
import { combatVictory, combatDefeat, fleeToMap } from "../store/thunks";

type SubAction = "none" | "pick_weapon" | "pick_target";

const EnemyPanel = memo(function EnemyPanel({
  enemy,
  targeted,
  onClick,
}: {
  enemy: Enemy;
  targeted: boolean;
  onClick: () => void;
}) {
  const stunned = (enemy.statuses?.stun || 0) > 0;
  const crouching = enemy.mechanic === "ambush" && (enemy.ambushTurns ?? 0) > 0;
  return (
    <div
      onClick={onClick}
      className={`
        panel cursor-pointer transition-all duration-200 select-none
        ${targeted ? "scale-[1.03] shadow-[0_0_20px_rgba(196,28,28,0.4)]" : ""}
        ${enemy.hp <= 0 ? "opacity-20" : ""}
      `}
      style={{
        minWidth: "150px",
        maxWidth: "190px",
        border: `1px solid ${targeted ? "#c41c1c" : "#3a3020"}`,
      }}
    >
      <div className="text-center text-2xl mb-0.5">{enemy.ascii}</div>
      <div
        className={`text-xs font-bold text-center mb-0.5 leading-tight ${enemy.isBoss ? "text-crypt-red" : "text-crypt-text"}`}
      >
        {enemy.name}
      </div>
      <div className="text-[0.6rem] text-crypt-dim text-center mb-0.5">
        {enemy.row === "back" ? "\u{1F6E1} Back Row" : "\u2694 Front Row"}
      </div>
      {enemy.mechanic && enemy.mechanic !== "boss" && (
        <div className="text-[0.6rem] text-crypt-dim text-center mb-0.5 cursor-help border-b border-dotted border-crypt-border-dim pb-0.5">
          {"\u2699"} {enemy.mechanic.replace("_", " ")} {"\u2139"}
        </div>
      )}
      {crouching && (
        <div className="text-[0.6rem] text-crypt-gold text-center mb-0.5">
          {"\u{1F9B4}"} Crouching {enemy.ambushTurns}t
        </div>
      )}
      {stunned && (
        <div className="text-[0.6rem] text-crypt-gold text-center">{"\u26A1"} Stunned</div>
      )}
      <HpBar current={enemy.hp} max={enemy.maxHp} color="#c41c1c" />
      {enemy.block > 0 && (
        <div className="text-xs text-crypt-blue text-center mt-0.5">
          {"\u{1F6E1}"} {enemy.block}
        </div>
      )}
      <StatusBadges statuses={enemy.statuses} />
      <div className="text-[0.6rem] text-crypt-dim text-center mt-0.5 italic">
        {crouching
          ? "Preparing..."
          : stunned
            ? "Skip turn"
            : enemy.atk === 0
              ? "No attack"
              : `ATK ${(enemy.statuses?.weaken || 0) > 0 ? Math.floor(enemy.atk * WEAKEN_DMG_MULT) : enemy.atk}`}
      </div>
    </div>
  );
});

export function CombatScreen({ room }: { room: DungeonNode }) {
  const dispatch = useAppDispatch();

  // Read initial combat state from store (set by App.tsx before mount)
  const storedEnemies = useAppSelector((s) => s.combat.enemies);
  const storedCombatPlayer = useAppSelector((s) => s.combat.combatPlayer);
  const storedLightLevel = useAppSelector((s) => s.combat.lightLevel);
  const storedCombatLog = useAppSelector((s) => s.combat.combatLog);
  const surpriseRound = useAppSelector((s) => s.combat.surpriseRound);
  const player = useAppSelector((s) => s.player)!;

  // ── Local game state (synced to store after each enemy turn) ──
  const [enemies, setEnemies] = useState<Enemy[]>(() => {
    if (storedEnemies && storedEnemies.length > 0) {
      return storedEnemies.map(hydrateEnemy);
    }
    // Fresh combat — initialize from room, apply any traps
    let enems = room.enemies.map((e) => hydrateEnemy(makeEnemyData(e.typeId, e.uid, e.hpOverride)));
    if (room.trap === "snare")
      enems = enems.map((e) => ({ ...e, statuses: { ...e.statuses, stun: 1 } }));
    if (room.trap === "flash") enems = enems.map((e) => ({ ...e, hp: Math.max(1, e.hp - 8) }));
    return enems;
  });

  const [p, setP] = useState<CombatPlayer>(
    () =>
      storedCombatPlayer ?? {
        ...player,
        block: 0,
        stealthActive: false,
        counterActive: false,
        abilityCooldowns: {},
      },
  );

  const [log, setLog] = useState<string[]>(() => {
    if (storedCombatLog.length > 0) return storedCombatLog;
    if (surpriseRound) return ["\u26A0\uFE0F Ambush! Enemies burst into the room!"];
    return [`\u2694 Combat begins: ${room.label}`];
  });

  const [lightLevel, setLightLevel] = useState(storedLightLevel);

  // ── Ephemeral UI state (stays local) ──
  const [subAction, setSubAction] = useState<SubAction>("none");
  const [pendingAbility, setPendingAbility] = useState<Ability | null>(null);
  const [targetIdx, setTargetIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  const surpriseRoundDone = useRef(!!storedCombatPlayer);

  const addLog = (msg: string) => setLog((prev) => [msg, ...prev].slice(0, COMBAT_LOG_MAX));
  const liveEnems = enemies.filter((e) => e.hp > 0);
  const frontRow = liveEnems.filter((e) => e.row === "front");
  const backRow = liveEnems.filter((e) => e.row === "back");
  const weapon = p.mainWeapon;
  const allAbilities = getPlayerCombatAbilities(p);
  const isCharging = !!p.chargingAbility;

  function promoteBackRow(enems: Enemy[]): Enemy[] {
    const alive = enems.filter((e) => e.hp > 0);
    if (alive.length > 0 && alive.every((e) => e.row === "back")) {
      return enems.map((e) => (e.hp > 0 ? { ...e, row: "front" as const } : e));
    }
    return enems;
  }

  function canReach(reach: "melee" | "ranged", target: Enemy, enems: Enemy[]): boolean {
    if (reach === "ranged") return true;
    const aliveFront = enems.filter((e) => e.hp > 0 && e.row === "front");
    return target.row === "front" || aliveFront.length === 0;
  }

  function makeActionContext(): ActionContext {
    return {
      player: p,
      enemies,
      lightLevel,
      weapon: p.mainWeapon,
      offhandWeapon: p.offhandWeapon,
    };
  }

  function checkVictory(enems: Enemy[], np: CombatPlayer) {
    const alive = enems.filter((e) => e.hp > 0);
    if (!alive.length) {
      const loot = room.enemies.reduce(
        (s, e) => s + (ENEMY_TYPES.find((t) => t.id === e.typeId)?.loot || 0),
        0,
      );
      addLog(`\u{1F3C6} Victory! +${loot} gold`);
      setP(np);
      setEnemies([]);
      setTimeout(() => dispatch(combatVictory({ ...np, gold: np.gold + loot, block: 0 })), 400);
      return true;
    }
    return false;
  }

  function autoTarget(enems: Enemy[]) {
    if (targetIdx >= enems.length || enems[targetIdx]?.hp <= 0) {
      const first = enems.findIndex((e) => e.hp > 0);
      setTargetIdx(first >= 0 ? first : 0);
    }
  }

  /* ── Surprise round: enemies get a free turn before the player acts ── */
  useEffect(() => {
    if (surpriseRound && !surpriseRoundDone.current) {
      surpriseRoundDone.current = true;
      const enems = cloneEnemies(enemies);
      doEnemyTurn({ ...p }, enems, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── After any player action, run enemy turn ── */
  function endPlayerAction(np: CombatPlayer, enems: Enemy[]) {
    if (!checkVictory(enems, np)) {
      doEnemyTurn(np, enems, false);
    }
  }

  /* ── USE ABILITY (unified: attack, weapon abilities, building abilities, wait, flee) ── */
  function activateAbility(ability: Ability) {
    if (animating) return;

    // Check cooldown
    const cd = p.abilityCooldowns[ability.id] || 0;
    if (cd > 0) return;

    // Silence blocks building abilities
    if (ability.source.type === "building" && (p.statuses?.silence || 0) > 0) {
      addLog("\u{1F507} Silenced \u2014 can't use abilities!");
      return;
    }

    if (ability.needsTarget) {
      setPendingAbility(ability);
      setSubAction("pick_target");
    } else {
      executePlayerAbility(ability, []);
    }
  }

  function executePlayerAbility(ability: Ability, targets: number[]) {
    const ctx = makeActionContext();

    // Special case: flee
    if (ability.id === "flee") {
      if (Math.random() < FLEE_CHANCE) {
        addLog("\u{1F3C3} You flee into the darkness!");
        setTimeout(() => dispatch(fleeToMap(p)), 300);
      } else {
        addLog("\u274C Flee failed! Enemies get a free turn.");
        const enems = cloneEnemies(enemies);
        doEnemyTurn({ ...p }, enems, true);
      }
      setSubAction("none");
      setPendingAbility(null);
      return;
    }

    // Execute ability → get actions
    const actions = ability.execute(ctx, targets);

    // Resolve actions against current state
    const result = resolveActions(actions, p, enemies, lightLevel, []);

    // Apply results
    result.log.forEach(addLog);
    setSubAction("none");
    setPendingAbility(null);

    if (result.endTurn) {
      // Tick cooldowns at end of player turn
      const tickedCooldowns = { ...result.player.abilityCooldowns };
      for (const key of Object.keys(tickedCooldowns)) {
        tickedCooldowns[key] = Math.max(0, tickedCooldowns[key] - 1);
      }
      // Tick charging
      let np = { ...result.player, abilityCooldowns: tickedCooldowns };
      let enems = result.enemies;
      if (np.chargingTurnsLeft !== undefined && np.chargingTurnsLeft > 0) {
        np = { ...np, chargingTurnsLeft: np.chargingTurnsLeft - 1 };
        // Auto-resolve when charge completes
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
          chargeResult.log.forEach(addLog);
          np = chargeResult.player;
          enems = chargeResult.enemies;
        }
      }
      endPlayerAction(np, enems);
    } else {
      // skip_end_turn (e.g., Quick Strike) — update state but don't end turn
      setP(result.player);
      setEnemies(result.enemies);
      setLightLevel(result.lightLevel);
      autoTarget(result.enemies);
    }
  }

  /* ── SWITCH WEAPON ── */
  function switchWeapon(w: import("../types").Weapon) {
    const isOffhand = w.hand === "offhand";
    let np: CombatPlayer;
    if (isOffhand) {
      // Toggle offhand
      if (p.offhandWeapon?.id === w.id) {
        np = { ...p, offhandWeapon: null };
        addLog(`\u{1F504} Unequipped ${w.name}`);
      } else {
        np = { ...p, offhandWeapon: { ...w } };
        addLog(`\u{1F504} Equipped ${w.name} (offhand)`);
      }
    } else {
      np = { ...p, mainWeapon: { ...w } };
      // 2H weapon clears offhand
      if (w.hand === "2") {
        np = { ...np, offhandWeapon: null };
      }
      addLog(`\u{1F504} Switched to ${w.name}`);
    }
    // Reset weapon ability cooldowns
    np = { ...np, abilityCooldowns: {} };
    setSubAction("none");
    const enems = cloneEnemies(enemies);
    endPlayerAction(np, enems);
  }

  /* ── ENEMY PHASE ── */
  function doEnemyTurn(np: CombatPlayer, enems: Enemy[], isFleeFailure: boolean) {
    setAnimating(true);
    np = { ...np, statuses: { ...np.statuses } };
    const lines: string[] = ["\u2014 Enemy Turn \u2014"];
    const light = { value: lightLevel };
    const ctx = (): CombatContext => ({ enemies: enems, player: np, lightLevel: light });

    const aliveAtStart = enems.filter((e) => e.hp > 0);
    for (const enemy of aliveAtStart) {
      const actions = enemy.combatMechanics?.onTurnStart?.(enemy, ctx());
      if (actions?.length) {
        // Use resolveActions for enemy turn-start effects
        const result = resolveActions(actions, np, enems, light.value, []);
        np = result.player;
        // Update enemy array in-place from result
        for (let i = 0; i < enems.length; i++) {
          const updated = result.enemies.find((e) => e.uid === enems[i].uid);
          if (updated) enems[i] = updated;
        }
        // Add any new spawned enemies
        for (const e of result.enemies) {
          if (!enems.find((ex) => ex.uid === e.uid)) enems.push(e);
        }
        light.value = result.lightLevel;
        result.log.forEach((l) => lines.push(l));
      }
    }

    for (const enemy of enems) {
      if (enemy.hp <= 0) continue;
      if ((enemy.statuses?.stun || 0) > 0) {
        lines.push(`\u26A1 ${enemy.name} stunned.`);
        continue;
      }
      if (np.stealthActive) continue;

      const result = enemy.combatMechanics?.onAttack?.(enemy, ctx()) ?? null;

      if (result?.skip) {
        if (result.extraActions?.length) {
          const r = resolveActions(result.extraActions, np, enems, light.value, []);
          np = r.player;
          light.value = r.lightLevel;
          r.log.forEach((l) => lines.push(l));
        }
        continue;
      }

      let atk = result?.atkOverride ?? enemy.atk;
      if (result?.damageMultiplier) atk = Math.floor(atk * result.damageMultiplier);
      if ((enemy.statuses?.weaken || 0) > 0) atk = Math.floor(atk * WEAKEN_DMG_MULT);

      // Apply blockReduction (Shield Block)
      let effectiveAtk = atk;
      if (np.blockReduction && np.blockReduction > 0) {
        effectiveAtk = Math.floor(atk * (1 - np.blockReduction));
        np.blockReduction = undefined;
        lines.push(`\u{1F6E1}\uFE0F Block reduces damage!`);
      }

      const bl = Math.min(np.block, effectiveAtk);
      np.block = Math.max(0, np.block - bl);
      const dt = effectiveAtk - bl;
      np.hp -= dt;
      lines.push(`${enemy.ascii} ${enemy.name}: ${atk}\u2192${dt} dmg`);

      if (result?.lifestealFraction && dt > 0) {
        const st = Math.floor(dt * result.lifestealFraction);
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + st);
        lines.push(`\u{1F9DB} ${enemy.name} heals ${st}`);
      }

      if (np.counterActive && dt > 0) {
        const reflect = Math.floor(dt * COUNTER_REFLECT_FRACTION);
        enemy.hp -= reflect;
        lines.push(`\u2694\uFE0F Counter! ${reflect} reflected to ${enemy.name}`);
      }

      if (result?.extraActions?.length) {
        const r = resolveActions(result.extraActions, np, enems, light.value, []);
        np = r.player;
        light.value = r.lightLevel;
        r.log.forEach((l) => lines.push(l));
      }
    }

    if (np.stealthActive) {
      lines.push("\u{1F464} Enemies can't find you in the shadows!");
    }

    if (light.value <= 0) {
      np.hp -= DARKNESS_DAMAGE;
      lines.push(`\u{1F311} Darkness saps your life! -${DARKNESS_DAMAGE} HP`);
    }

    const ptick = tickStatuses({ ...np, name: "You" });
    np = { ...np, ...ptick.entity };
    ptick.log.forEach((l) => lines.push(l));
    const tickedEnems = enems.map((e) => {
      if (e.hp <= 0) return e;
      const t = tickStatuses(e);
      t.log.forEach((l) => lines.push(l));
      return t.entity as Enemy;
    });

    if (np.hp <= 0) {
      lines.forEach(addLog);
      setAnimating(false);
      dispatch(combatDefeat(np.gold));
      return;
    }

    np.block = 0;
    np.stealthActive = false;
    np.counterActive = false;

    lines.forEach(addLog);
    if (!isFleeFailure) addLog("\u2014 Your Turn \u2014");

    const promoted = promoteBackRow(tickedEnems);
    setP(np);
    setEnemies(promoted);
    setLightLevel(light.value);
    setAnimating(false);
    setSubAction("none");
    autoTarget(promoted);

    // Sync game state to Redux store after turn completes
    const newLog = ["\u2014 Your Turn \u2014", ...lines, ...log].slice(0, COMBAT_LOG_MAX);
    dispatch(
      updateCombatState({
        enemies: promoted.map(toEnemyData),
        combatPlayer: np,
        lightLevel: light.value,
        combatLog: newLog,
      }),
    );
  }

  /* ── Target click handler ── */
  function handleEnemyClick(idx: number) {
    const enemy = enemies[idx];
    if (!enemy || enemy.hp <= 0) return;

    if (subAction === "pick_target" && pendingAbility) {
      const reach = pendingAbility.reach || weapon.reach;
      if (!canReach(reach, enemy, enemies)) {
        addLog(`Can't reach ${enemy.name} \u2014 melee can't hit back row!`);
        return;
      }
      executePlayerAbility(pendingAbility, [idx]);
    } else {
      setTargetIdx(idx);
    }
  }

  function cancelAction() {
    setSubAction("none");
    setPendingAbility(null);
  }

  const isTargeting = subAction === "pick_target";

  /* ── Ability button color ── */
  function abilityColor(a: Ability): string {
    if (a.id === "basic_attack") return "#c41c1c";
    if (a.id === "wait" || a.id === "flee") return "#3a2a10";
    if (a.source.type === "weapon") return "#6a3a1a";
    if (a.source.type === "building") return "#8e44ad";
    if (a.source.type === "item") return "#2980b9";
    return "#5a4a20";
  }

  function isAbilityDisabled(a: Ability): boolean {
    if (animating) return true;
    if ((p.abilityCooldowns[a.id] || 0) > 0) return true;
    if (a.source.type === "building" && (p.statuses?.silence || 0) > 0) return true;
    // While charging, disable all abilities (charge auto-resolves at end of turn)
    if (isCharging) return true;
    return false;
  }

  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center gap-2 relative overflow-hidden p-3">
      <div className="vignette" />

      {/* Header */}
      <div className="flex gap-4 items-center relative z-1 flex-wrap justify-center">
        <div className="text-crypt-muted text-sm tracking-wider">
          {"\u2694"} <span className="text-crypt-red font-bold">{room.label.toUpperCase()}</span>
        </div>
        <div className="text-crypt-gold text-sm">
          {"\u{1FA99}"} {p.gold}
        </div>
        <div
          className={`text-sm ${lightLevel > 2 ? "text-crypt-gold" : lightLevel > 0 ? "text-orange-400" : "text-crypt-red"}`}
        >
          {"\u{1F525}".repeat(lightLevel)}
          {"\u25AA".repeat(LIGHT_MAX - lightLevel)}
        </div>
      </div>

      {/* Combatants */}
      <div className="flex flex-col gap-2 relative z-1 items-center w-full px-4">
        {backRow.length > 0 && (
          <div>
            <div className="text-[0.6rem] text-crypt-dim text-center tracking-wider mb-1 uppercase">
              {"\u{1F6E1}"} Back Row
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {enemies.map((enemy, i) => {
                if (enemy.row !== "back" || enemy.hp <= 0) return null;
                return (
                  <EnemyPanel
                    key={enemy.uid}
                    enemy={enemy}
                    targeted={isTargeting ? false : targetIdx === i}
                    onClick={() => handleEnemyClick(i)}
                  />
                );
              })}
            </div>
          </div>
        )}
        {frontRow.length > 0 && (
          <div>
            <div className="text-[0.6rem] text-crypt-dim text-center tracking-wider mb-1 uppercase">
              {"\u2694"} Front Row
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {enemies.map((enemy, i) => {
                if (enemy.row !== "front" || enemy.hp <= 0) return null;
                return (
                  <EnemyPanel
                    key={enemy.uid}
                    enemy={enemy}
                    targeted={isTargeting ? false : targetIdx === i}
                    onClick={() => handleEnemyClick(i)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Player panel */}
        <div className="panel" style={{ minWidth: "160px", maxWidth: "190px" }}>
          <div className="text-center text-2xl mb-0.5">{"\u{1F9DD}"}</div>
          <div className="text-sm font-bold text-crypt-text text-center mb-0.5">You</div>
          <HpBar current={p.hp} max={p.maxHp} color="#3ddc84" />
          {p.block > 0 && (
            <div className="text-xs text-crypt-blue text-center mt-0.5">
              {"\u{1F6E1}"} {p.block}
            </div>
          )}
          {p.blockReduction && p.blockReduction > 0 && (
            <div className="text-xs text-crypt-blue text-center mt-0.5">
              {"\u{1F6E1}\uFE0F"} Block {Math.round(p.blockReduction * 100)}%
            </div>
          )}
          <StatusBadges statuses={p.statuses} />
          {p.stealthActive && (
            <div className="text-xs text-crypt-purple text-center mt-0.5">
              {"\u{1F464}"} Stealth
            </div>
          )}
          {p.counterActive && (
            <div className="text-xs text-crypt-purple text-center mt-0.5">
              {"\u2694\uFE0F"} Counter
            </div>
          )}
          {isCharging && (
            <div className="text-xs text-crypt-gold text-center mt-0.5">
              {"\u{1F4A5}"} Charging...
            </div>
          )}
          <div className="text-xs text-crypt-dim text-center mt-1 border-t border-crypt-border-dim pt-1">
            {weapon.icon} {weapon.name}
            <br />
            <span className="text-crypt-muted">
              {weapon.damage} {weapon.damageType} {weapon.reach}
            </span>
            {p.offhandWeapon && (
              <>
                <br />
                <span className="text-crypt-muted">
                  {p.offhandWeapon.icon} {p.offhandWeapon.name} (offhand)
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Combat log */}
      <div className="panel w-full max-w-xl px-3 py-1.5 relative z-1">
        {log.slice(0, 5).map((l, i) => (
          <div
            key={i}
            className="text-sm leading-relaxed"
            style={{ color: i === 0 ? "#ece0c8" : `rgba(168,152,120,${1 - i * 0.18})` }}
          >
            {l}
          </div>
        ))}
      </div>

      {/* Targeting prompt */}
      {isTargeting && (
        <div className="relative z-1 flex gap-3 items-center">
          <div className="text-sm text-crypt-gold">Select target for {pendingAbility?.name}</div>
          <button
            style={btnStyle("#3a2f25")}
            className="text-sm! px-3! py-1!"
            onClick={cancelAction}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Weapon picker */}
      {subAction === "pick_weapon" && (
        <div className="relative z-1 panel max-w-lg w-full">
          <div className="text-sm text-crypt-muted mb-2">Switch weapon (ends your turn):</div>
          <div className="flex gap-2 flex-wrap">
            {p.ownedWeapons
              .filter((w) => w.hand !== "offhand")
              .map((w) => (
                <button
                  key={w.id}
                  style={btnStyle(w.id === p.mainWeapon.id ? "#3a3020" : "#6a3a1a")}
                  className="text-sm!"
                  disabled={w.id === p.mainWeapon.id}
                  onClick={() => switchWeapon(w)}
                >
                  {w.icon} {w.name} ({w.damage} {w.damageType})
                </button>
              ))}
            {p.ownedWeapons
              .filter((w) => w.hand === "offhand")
              .map((w) => (
                <button
                  key={w.id}
                  style={btnStyle(p.offhandWeapon?.id === w.id ? "#3a3020" : "#5a4a20")}
                  className="text-sm!"
                  disabled={p.mainWeapon.hand === "2"}
                  onClick={() => switchWeapon(w)}
                >
                  {w.icon} {w.name} {p.offhandWeapon?.id === w.id ? "(equipped)" : "(offhand)"}
                </button>
              ))}
          </div>
          <button
            style={btnStyle("#3a2f25")}
            className="mt-2 text-sm! px-3! py-1!"
            onClick={cancelAction}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Action buttons */}
      {!isTargeting &&
        subAction === "none" &&
        (() => {
          const combatAbilities = allAbilities.filter((a) => a.source.type !== "item");
          const itemAbilities = allAbilities.filter((a) => a.source.type === "item");
          return (
            <div className="flex flex-col gap-2 items-center relative z-1 px-4">
              <div className="flex gap-2 flex-wrap justify-center">
                {combatAbilities.map((a) => {
                  const cd = p.abilityCooldowns[a.id] || 0;
                  const disabled = isAbilityDisabled(a);
                  return (
                    <button
                      key={a.id}
                      style={btnStyle(abilityColor(a), disabled)}
                      disabled={disabled}
                      onClick={() => activateAbility(a)}
                      title={a.desc}
                    >
                      {a.icon} {a.name}
                      {a.id === "basic_attack" && ` (${weapon.damage})`}
                      {cd > 0 && ` (${cd})`}
                    </button>
                  );
                })}

                {p.ownedWeapons.length > 1 && (
                  <button
                    style={btnStyle("#5a4a20", animating)}
                    disabled={animating}
                    onClick={() => setSubAction("pick_weapon")}
                  >
                    {"\u{1F504}"} Switch
                  </button>
                )}
              </div>

              {itemAbilities.length > 0 && (
                <>
                  <div className="text-xs text-crypt-dim tracking-wider uppercase">
                    {"\u{1F392}"} Consumables
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {itemAbilities.map((a) => {
                      const disabled = isAbilityDisabled(a);
                      return (
                        <button
                          key={a.id}
                          style={btnStyle(abilityColor(a), disabled)}
                          disabled={disabled}
                          onClick={() => activateAbility(a)}
                          title={a.desc}
                        >
                          {a.icon} {a.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })()}
    </div>
  );
}
