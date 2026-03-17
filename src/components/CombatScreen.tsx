import { useState, useEffect, useRef, memo } from "react";
import { btnStyle } from "../styles";
import { ENEMY_TYPES } from "../data/enemies";
import { ABILITIES } from "../data/abilities";
import { STATUS_ICONS } from "../data/status";
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
  BLIND_MISS_CHANCE,
  COUNTER_REFLECT_FRACTION,
  FLEE_CHANCE,
  LIGHT_MAX,
  DARKNESS_DAMAGE,
  COMBAT_LOG_MAX,
} from "../data/constants";
import { executeActions } from "../combat/actions";
import type {
  DungeonNode,
  Enemy,
  CombatPlayer,
  CombatContext,
  Ability,
  Consumable,
} from "../types";
import { useAppDispatch, useAppSelector } from "../store";
import { updateCombatState } from "../store/combatSlice";
import { combatVictory, combatDefeat, fleeToMap } from "../store/thunks";

type SubAction =
  | "none"
  | "pick_weapon"
  | "pick_item"
  | "pick_ability_target"
  | "pick_attack_target"
  | "pick_item_target";

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
        <div
          title={enemy.mechanicDesc}
          className="text-[0.6rem] text-crypt-dim text-center mb-0.5 cursor-help border-b border-dotted border-crypt-border-dim pb-0.5"
        >
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
  const [pendingItem, setPendingItem] = useState<{ item: Consumable; idx: number } | null>(null);
  const [targetIdx, setTargetIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  const surpriseRoundDone = useRef(!!storedCombatPlayer);

  const addLog = (msg: string) => setLog((prev) => [msg, ...prev].slice(0, COMBAT_LOG_MAX));
  const liveEnems = enemies.filter((e) => e.hp > 0);
  const frontRow = liveEnems.filter((e) => e.row === "front");
  const backRow = liveEnems.filter((e) => e.row === "back");
  const weapon = p.weapons[p.activeWeaponIdx];
  const playerAbilities = ABILITIES.filter((a) => p.abilities.includes(a.id));

  function promoteBackRow(enems: Enemy[]): Enemy[] {
    const alive = enems.filter((e) => e.hp > 0);
    if (alive.length > 0 && alive.every((e) => e.row === "back")) {
      return enems.map((e) => (e.hp > 0 ? { ...e, row: "front" as const } : e));
    }
    return enems;
  }

  function canReach(range: "melee" | "ranged", target: Enemy, enems: Enemy[]): boolean {
    if (range === "ranged") return true;
    const aliveFront = enems.filter((e) => e.hp > 0 && e.row === "front");
    return target.row === "front" || aliveFront.length === 0;
  }

  function resolveHit(
    dmg: number,
    target: Enemy,
    holy: boolean,
    finishing: boolean,
    isWeapon: boolean,
    lines: string[],
    enems?: Enemy[],
  ): Enemy {
    const t = { ...target, statuses: { ...(target.statuses || {}) } };
    const mechanics = t.combatMechanics;
    const lightBox = { value: lightLevel };

    if (mechanics?.onReceiveHit) {
      const ctx: CombatContext = { enemies: enems ?? [], player: p, lightLevel: lightBox };
      const response = mechanics.onReceiveHit(t, ctx, { damage: dmg, holy, finishing });
      if (response.evade) {
        lines.push(`\u{1F47B} ${t.name} phases through the attack!`);
        return t;
      }
      if (response.damageMultiplier !== undefined)
        dmg = Math.floor(dmg * response.damageMultiplier);
    }

    const bl = Math.min(t.block, dmg);
    t.block = Math.max(0, t.block - bl);
    const dealt = dmg - bl;
    t.hp -= dealt;
    lines.push(`\u2694 ${dealt} dmg\u2192${t.name}${bl > 0 ? ` (${bl} blocked)` : ""}`);

    if (t.hp <= 0 && mechanics?.onDeath && enems) {
      const ctx: CombatContext = {
        enemies: enems,
        player: { ...p } as CombatPlayer,
        lightLevel: lightBox,
      };
      const actions = mechanics.onDeath(t, ctx, { finishing });
      executeActions(actions, t, ctx.player, enems, lightBox, lines);
    }

    if (isWeapon && weapon.applyStatus && Math.random() < weapon.applyStatus.chance) {
      const { status, stacks } = weapon.applyStatus;
      t.statuses[status] = (t.statuses[status] || 0) + stacks;
      lines.push(`${STATUS_ICONS[status]} ${t.name} ${status}\u00D7${stacks}`);
    }
    return t;
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

  /* ── ATTACK ── */
  function startAttack() {
    if (animating) return;
    if (weapon.aoe) {
      doAttack(-1);
    } else {
      setSubAction("pick_attack_target");
    }
  }

  function doAttack(tIdx: number) {
    if (animating) return;
    const np = { ...p };
    const enems = cloneEnemies(enemies);
    const lines: string[] = [];

    if ((np.statuses?.blind || 0) > 0 && Math.random() < BLIND_MISS_CHANCE) {
      lines.push(`\u{1F441}\uFE0F Blinded \u2014 miss!`);
      lines.forEach(addLog);
      setSubAction("none");
      endPlayerAction(np, enems);
      return;
    }

    lines.push(`\u{1F5E1}\uFE0F ${weapon.name}:`);
    const targets = weapon.aoe ? enems.filter((e) => e.hp > 0) : [enems[tIdx]].filter(Boolean);

    targets.forEach((t) => {
      if (t.hp <= 0) return;
      if (!canReach(weapon.range, t, enems)) {
        lines.push(`Can't reach ${t.name} in back row with melee!`);
        return;
      }
      let dmg = weapon.damage;
      if ((np.statuses?.weaken || 0) > 0) dmg = Math.floor(dmg * WEAKEN_DMG_MULT);
      const result = resolveHit(dmg, t, !!weapon.holy, !!weapon.finishing, true, lines, enems);
      const idx = enems.findIndex((e) => e.uid === t.uid);
      if (idx >= 0) enems[idx] = result;
    });

    lines.forEach(addLog);
    setSubAction("none");
    endPlayerAction(np, enems);
  }

  /* ── SWITCH WEAPON ── */
  function switchWeapon(idx: number) {
    const np = { ...p, activeWeaponIdx: idx };
    addLog(`\u{1F504} Switched to ${p.weapons[idx].name}`);
    setSubAction("none");
    const enems = cloneEnemies(enemies);
    endPlayerAction(np, enems);
  }

  /* ── USE ITEM ── */
  function startUseItem(item: Consumable, idx: number) {
    if (animating) return;
    if (item.heal || item.cleanse || item.restoreLight || item.block) {
      doUseItem(item, idx, -1);
    } else if (item.aoe) {
      doUseItem(item, idx, -1);
    } else if (item.damage || item.applyStatus) {
      setPendingItem({ item, idx });
      setSubAction("pick_item_target");
    } else {
      doUseItem(item, idx, -1);
    }
  }

  function doUseItem(item: Consumable, itemIdx: number, tIdx: number) {
    const np = { ...p, consumables: p.consumables.filter((_, i) => i !== itemIdx) };
    const enems = cloneEnemies(enemies);
    const lines: string[] = [`\u{1F392} ${item.name}:`];

    if (item.heal) {
      np.hp = Math.min(np.maxHp, np.hp + item.heal);
      lines.push(`+${item.heal} HP`);
    }
    if (item.cleanse) {
      np.statuses = {};
      lines.push("Debuffs cleared!");
    }
    if (item.restoreLight) {
      setLightLevel((prev) => Math.min(LIGHT_MAX, prev + item.restoreLight!));
      lines.push(`+${item.restoreLight} light`);
    }
    if (item.block) {
      np.block += item.block;
      lines.push(`+${item.block} block`);
    }
    if (item.damage) {
      const targets = item.aoe ? enems.filter((e) => e.hp > 0) : [enems[tIdx]].filter(Boolean);
      targets.forEach((t) => {
        if (t.hp <= 0) return;
        const result = resolveHit(item.damage!, t, !!item.holy, false, false, lines, enems);
        const idx = enems.findIndex((e) => e.uid === t.uid);
        if (idx >= 0) enems[idx] = result;
      });
    }
    if (item.applyStatus && !item.damage) {
      const targets = item.aoe ? enems.filter((e) => e.hp > 0) : [enems[tIdx]].filter(Boolean);
      targets.forEach((t) => {
        if (t.hp <= 0) return;
        const { status, stacks } = item.applyStatus!;
        t.statuses[status] = (t.statuses[status] || 0) + stacks;
        lines.push(`${STATUS_ICONS[status]} ${t.name} ${status}\u00D7${stacks}`);
        const idx = enems.findIndex((e) => e.uid === t.uid);
        if (idx >= 0) enems[idx] = t;
      });
    }

    lines.forEach(addLog);
    setSubAction("none");
    setPendingItem(null);
    endPlayerAction(np, enems);
  }

  /* ── USE ABILITY ── */
  function startAbility(ability: Ability) {
    if (animating) return;
    if ((p.statuses?.silence || 0) > 0) {
      addLog("\u{1F507} Silenced \u2014 can't use abilities!");
      return;
    }
    if (!ability.needsTarget) {
      doAbility(ability, -1);
    } else {
      setPendingAbility(ability);
      setSubAction("pick_ability_target");
    }
  }

  function doAbility(ability: Ability, tIdx: number) {
    const np = { ...p };
    const enems = cloneEnemies(enemies);
    const lines: string[] = [`\u2728 ${ability.name}:`];

    if (ability.heal) {
      np.hp = Math.min(np.maxHp, np.hp + ability.heal);
      lines.push(`+${ability.heal} HP`);
    }
    if (ability.block) {
      np.block += ability.block;
      lines.push(`+${ability.block} block`);
    }
    if (ability.selfBuff === "stealth") {
      np.stealthActive = true;
      lines.push("You vanish into the shadows.");
    }
    if (ability.selfBuff === "counter") {
      np.counterActive = true;
      lines.push("You brace for a counter-attack.");
    }
    if (ability.damage) {
      const range = ability.damageRange || "melee";
      if ((np.statuses?.blind || 0) > 0 && Math.random() < BLIND_MISS_CHANCE) {
        lines.push(`\u{1F441}\uFE0F Blinded \u2014 miss!`);
      } else {
        let dmg = ability.damage;
        if ((np.statuses?.weaken || 0) > 0) dmg = Math.floor(dmg * WEAKEN_DMG_MULT);
        const targets = ability.aoe ? enems.filter((e) => e.hp > 0) : [enems[tIdx]].filter(Boolean);
        targets.forEach((t) => {
          if (t.hp <= 0) return;
          if (!canReach(range, t, enems)) {
            lines.push(`Can't reach ${t.name} with melee!`);
            return;
          }
          const result = resolveHit(
            dmg,
            t,
            !!ability.holy,
            !!ability.finishing,
            false,
            lines,
            enems,
          );
          const idx = enems.findIndex((e) => e.uid === t.uid);
          if (idx >= 0) enems[idx] = result;
        });
      }
    }
    if (ability.applyStatus && !ability.damage) {
      const targets = ability.aoe ? enems.filter((e) => e.hp > 0) : [enems[tIdx]].filter(Boolean);
      targets.forEach((t) => {
        if (t.hp <= 0) return;
        const { status, stacks } = ability.applyStatus!;
        t.statuses[status] = (t.statuses[status] || 0) + stacks;
        lines.push(`${STATUS_ICONS[status]} ${t.name} ${status}\u00D7${stacks}`);
        const idx = enems.findIndex((e) => e.uid === t.uid);
        if (idx >= 0) enems[idx] = t;
      });
    }

    lines.forEach(addLog);
    setSubAction("none");
    setPendingAbility(null);
    endPlayerAction(np, enems);
  }

  /* ── FLEE ── */
  function attemptFlee() {
    if (animating) return;
    if (Math.random() < FLEE_CHANCE) {
      addLog("\u{1F3C3} You flee into the darkness!");
      setTimeout(() => dispatch(fleeToMap(p)), 300);
    } else {
      addLog("\u274C Flee failed! Enemies get a free turn.");
      const enems = cloneEnemies(enemies);
      doEnemyTurn({ ...p }, enems, true);
    }
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
      if (actions?.length) executeActions(actions, enemy, np, enems, light, lines);
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
        if (result.extraActions?.length)
          executeActions(result.extraActions, enemy, np, enems, light, lines);
        continue;
      }

      let atk = result?.atkOverride ?? enemy.atk;
      if (result?.damageMultiplier) atk = Math.floor(atk * result.damageMultiplier);
      if ((enemy.statuses?.weaken || 0) > 0) atk = Math.floor(atk * WEAKEN_DMG_MULT);

      const bl = Math.min(np.block, atk);
      np.block = Math.max(0, np.block - bl);
      const dt = atk - bl;
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

      if (result?.extraActions?.length)
        executeActions(result.extraActions, enemy, np, enems, light, lines);
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

    if (subAction === "pick_attack_target") {
      if (!canReach(weapon.range, enemy, enemies)) {
        addLog(`Can't reach ${enemy.name} \u2014 melee can't hit back row!`);
        return;
      }
      doAttack(idx);
    } else if (subAction === "pick_ability_target" && pendingAbility) {
      const range = pendingAbility.damageRange || "melee";
      if (!canReach(range, enemy, enemies)) {
        addLog(`Can't reach ${enemy.name} with this ability!`);
        return;
      }
      doAbility(pendingAbility, idx);
    } else if (subAction === "pick_item_target" && pendingItem) {
      doUseItem(pendingItem.item, pendingItem.idx, idx);
    } else {
      setTargetIdx(idx);
    }
  }

  function cancelAction() {
    setSubAction("none");
    setPendingAbility(null);
    setPendingItem(null);
  }

  const uniqueMechanics = [
    ...new Map(
      liveEnems.filter((e) => e.mechanicDesc && e.mechanic !== "boss").map((e) => [e.mechanic, e]),
    ).values(),
  ];
  const isTargeting =
    subAction === "pick_attack_target" ||
    subAction === "pick_ability_target" ||
    subAction === "pick_item_target";

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
          <div className="text-xs text-crypt-dim text-center mt-1 border-t border-crypt-border-dim pt-1">
            {weapon.icon} {weapon.name}
            <br />
            <span className="text-crypt-muted">
              {weapon.damage} {weapon.range}
            </span>
          </div>
        </div>
      </div>

      {/* Mechanics hint */}
      {uniqueMechanics.length > 0 && (
        <div className="panel max-w-3xl w-full px-3 py-1.5 relative z-1">
          {uniqueMechanics.map((e) => (
            <div key={e.mechanic} className="text-xs text-crypt-dim leading-relaxed">
              <span className="text-crypt-red">
                {"\u2699"} {e.name}:
              </span>{" "}
              {e.mechanicDesc}
            </div>
          ))}
        </div>
      )}

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
          <div className="text-sm text-crypt-gold">
            {subAction === "pick_attack_target" &&
              `Select target for ${weapon.name} (${weapon.range})`}
            {subAction === "pick_ability_target" && `Select target for ${pendingAbility?.name}`}
            {subAction === "pick_item_target" && `Select target for ${pendingItem?.item.name}`}
          </div>
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
            {p.weapons.map((w, i) => (
              <button
                key={w.id}
                style={btnStyle(i === p.activeWeaponIdx ? "#3a3020" : "#6a3a1a")}
                className="text-sm!"
                disabled={i === p.activeWeaponIdx}
                onClick={() => switchWeapon(i)}
              >
                {w.icon} {w.name} ({w.damage} {w.range})
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

      {/* Item picker */}
      {subAction === "pick_item" && (
        <div className="relative z-1 panel max-w-lg w-full">
          <div className="text-sm text-crypt-muted mb-2">Use item:</div>
          <div className="flex gap-2 flex-wrap">
            {p.consumables.map((c, i) => (
              <button
                key={i}
                style={btnStyle("#6a3a1a")}
                className="text-sm!"
                onClick={() => startUseItem(c, i)}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          {p.consumables.length === 0 && (
            <div className="text-xs text-crypt-dim italic">No items.</div>
          )}
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
      {!isTargeting && subAction === "none" && (
        <div className="flex gap-2 flex-wrap justify-center relative z-1 px-4">
          <button style={btnStyle("#c41c1c", animating)} disabled={animating} onClick={startAttack}>
            {weapon.icon} Attack ({weapon.damage})
          </button>

          {p.weapons.length > 1 && (
            <button
              style={btnStyle("#5a4a20", animating)}
              disabled={animating}
              onClick={() => setSubAction("pick_weapon")}
            >
              {"\u{1F504}"} Switch
            </button>
          )}

          {p.consumables.length > 0 && (
            <button
              style={btnStyle("#2980b9", animating)}
              disabled={animating}
              onClick={() => setSubAction("pick_item")}
            >
              {"\u{1F392}"} Item
            </button>
          )}

          {playerAbilities.map((a) => (
            <button
              key={a.id}
              style={btnStyle("#8e44ad", animating || (p.statuses?.silence || 0) > 0)}
              disabled={animating || (p.statuses?.silence || 0) > 0}
              onClick={() => startAbility(a)}
            >
              {a.icon} {a.name}
            </button>
          ))}

          <button style={btnStyle("#3a2a10", animating)} disabled={animating} onClick={attemptFlee}>
            {"\u{1F3C3}"} Flee
          </button>
        </div>
      )}
    </div>
  );
}
