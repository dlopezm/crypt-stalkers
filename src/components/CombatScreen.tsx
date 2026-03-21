import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
  useSyncExternalStore,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { btnStyle } from "../styles";
import { WEAKEN_DMG_MULT, LIGHT_MAX } from "../data/constants";
import { CombatEngine, type CombatSnapshot, type CombatCallbacks } from "../combat/CombatEngine";
import type { DungeonNode, Enemy, Ability, Weapon } from "../types";
import { useAppDispatch, useAppSelector } from "../store";
import { updateCombatState } from "../store/combatSlice";
import { combatVictory, combatDefeat, fleeToMap } from "../store/thunks";
import { TarotCard } from "./combat/TarotCard";
import { ScreenShake } from "./combat/ScreenShake";
import { AnimationLayer } from "./combat/AnimationLayer";
import { StatusBadges, HpBar } from "./shared";

type SubAction = "none" | "pick_weapon" | "pick_target";

/* ── Enemy Panel ── */

const EnemyPanel = memo(function EnemyPanel({
  enemy,
  targeted,
  onClick,
  panelRef,
  animState,
}: {
  enemy: Enemy;
  targeted: boolean;
  onClick: () => void;
  panelRef?: (el: HTMLDivElement | null) => void;
  animState?: string;
}) {
  const stunned = (enemy.statuses?.stun || 0) > 0;
  const crouching = enemy.mechanic === "ambush" && (enemy.ambushTurns ?? 0) > 0;

  let animClass = "";
  if (animState === "attacked") animClass = "combat-anim-recoil";
  if (animState === "attacking") animClass = "combat-anim-lunge";
  if (animState === "phase") animClass = "combat-anim-phase";
  if (animState === "weaken_aura") animClass = "combat-anim-aura-purple";
  if (animState === "drain_light") animClass = "combat-anim-aura-dark";
  if (animState === "lifesteal") animClass = "combat-anim-lifesteal";

  return (
    <motion.div
      ref={(el: HTMLDivElement | null) => {
        panelRef?.(el);
      }}
      layout
      onClick={onClick}
      className={`
        panel cursor-pointer transition-all duration-200 select-none relative
        min-w-[150px] max-w-[190px] lg:min-w-[180px] lg:max-w-[220px]
        ${targeted ? "scale-[1.03] shadow-[0_0_20px_rgba(196,28,28,0.4)]" : ""}
        ${animClass}
      `}
      style={{
        border: `1px solid ${targeted ? "#c41c1c" : "#3a3020"}`,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7, rotate: -15, filter: "grayscale(1)" }}
      transition={{ duration: 0.35, layout: { duration: 0.3, ease: "easeInOut" } }}
    >
      <TarotCard enemyId={enemy.id} ascii={enemy.ascii} isBoss={enemy.isBoss} />
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
    </motion.div>
  );
});

/* ── Combat Screen (inner, receives ScreenShake context) ── */

function CombatScreenInner({ room }: { room: DungeonNode }) {
  const dispatch = useAppDispatch();

  // Read initial combat state from store (set by App.tsx before mount)
  const storedEnemies = useAppSelector((s) => s.combat.enemies);
  const storedCombatPlayer = useAppSelector((s) => s.combat.combatPlayer);
  const storedLightLevel = useAppSelector((s) => s.combat.lightLevel);
  const storedCombatLog = useAppSelector((s) => s.combat.combatLog);
  const surpriseRound = useAppSelector((s) => s.combat.surpriseRound);
  const player = useAppSelector((s) => s.player)!;

  // ── Engine setup (once per mount) ──
  // useState initializer runs once — no ref access during render.
  const [{ engine, snapshotRef, listenersRef }] = useState(() => {
    const listeners = new Set<() => void>();
    const snapRef = { current: null as CombatSnapshot | null };

    // We need a stable reference to the engine for callbacks.
    // engineBox lets the callbacks close over a mutable container
    // that gets assigned immediately after construction.
    const engineBox = { current: null as CombatEngine | null };

    const callbacks: CombatCallbacks = {
      onStateChange: () => {
        snapRef.current = engineBox.current!.snapshot;
        const ser = engineBox.current!.serializable;
        dispatch(updateCombatState(ser));
        for (const fn of listeners) fn();
      },
      onVictory: (combatPlayer) => {
        dispatch(combatVictory(combatPlayer));
      },
      onDefeat: (gold) => {
        dispatch(combatDefeat(gold));
      },
      onFlee: (combatPlayer) => {
        dispatch(fleeToMap(combatPlayer));
      },
    };

    const isRestored = storedCombatPlayer != null;
    const eng = new CombatEngine(room, player, callbacks, {
      restored: isRestored
        ? {
            enemies: storedEnemies!,
            combatPlayer: storedCombatPlayer!,
            lightLevel: storedLightLevel,
            combatLog: storedCombatLog,
          }
        : undefined,
      surpriseRound,
    });
    engineBox.current = eng;
    snapRef.current = eng.snapshot;

    return { engine: eng, snapshotRef: snapRef, listenersRef: listeners };
  });

  // Subscribe to engine state changes via useSyncExternalStore
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      listenersRef.add(onStoreChange);
      return () => {
        listenersRef.delete(onStoreChange);
      };
    },
    [listenersRef],
  );
  const snap = useSyncExternalStore(subscribe, () => snapshotRef.current!);

  // After first render + subscription, kick off surprise round if pending
  useEffect(() => {
    engine.start();
    return () => {
      engine.destroy();
    };
  }, [engine]);

  // ── Ephemeral UI state ──
  const [subAction, setSubAction] = useState<SubAction>("none");
  const [pendingAbility, setPendingAbility] = useState<Ability | null>(null);
  const [targetIdx, setTargetIdx] = useState(0);

  // ── DOM refs for animation positioning ──
  const panelRefsMap = useRef(new Map<string, HTMLDivElement>());
  const playerPanelRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Derived values from snapshot
  const {
    enemies,
    player: p,
    lightLevel,
    log,
    animEvents,
    phase,
    enemyAnimStates,
    playerFlash,
  } = snap;
  const liveEnems = enemies.filter((e) => e.hp > 0);
  const frontRow = liveEnems.filter((e) => e.row === "front");
  const backRow = liveEnems.filter((e) => e.row === "back");
  const weapon = p.mainWeapon;
  const allAbilities = snap.allAbilities;
  const isCharging = !!p.chargingAbility;
  const animating = phase !== "player_turn";

  // Auto-correct target if current target is dead or out of range
  const correctedTargetIdx = (() => {
    if (targetIdx < enemies.length && enemies[targetIdx]?.hp > 0) return targetIdx;
    const first = enemies.findIndex((e) => e.hp > 0);
    return first >= 0 ? first : 0;
  })();
  if (correctedTargetIdx !== targetIdx) {
    setTargetIdx(correctedTargetIdx);
  }

  // Handle victory with a short delay for the animation to finish
  useEffect(() => {
    if (phase === "victory") {
      const timer = setTimeout(() => engine.confirmVictory(), 400);
      return () => clearTimeout(timer);
    }
  }, [phase, engine]);

  /* ── Ability activation ── */
  function activateAbility(ability: Ability) {
    if (animating) return;

    const cd = p.abilityCooldowns[ability.id] || 0;
    if (cd > 0) return;

    if (ability.source.type === "building" && (p.statuses?.silence || 0) > 0) {
      return;
    }

    const needsTarget = engine.activateAbility(ability);
    if (needsTarget) {
      setPendingAbility(ability);
      setSubAction("pick_target");
    }
  }

  /* ── Target click handler ── */
  function handleEnemyClick(idx: number) {
    const enemy = enemies[idx];
    if (!enemy || enemy.hp <= 0) return;

    if (subAction === "pick_target" && pendingAbility) {
      const reach = pendingAbility.reach || weapon.reach;
      if (!engine.canReach(reach, enemy)) {
        return;
      }
      engine.executeAbilityWithTargets(pendingAbility, [idx]);
      setSubAction("none");
      setPendingAbility(null);
    } else {
      setTargetIdx(idx);
    }
  }

  /* ── Switch weapon ── */
  function switchWeapon(w: Weapon) {
    engine.switchWeapon(w);
    setSubAction("none");
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
    return engine.isAbilityDisabled(a);
  }

  const setPanelRef = useCallback(
    (uid: string) => (el: HTMLDivElement | null) => {
      if (el) panelRefsMap.current.set(uid, el);
      else panelRefsMap.current.delete(uid);
    },
    [],
  );

  /* ── Shared JSX helpers ── */

  const setPlayerPanelRef = useCallback((el: HTMLDivElement | null) => {
    if (el && el.offsetParent !== null) {
      playerPanelRef.current = el;
    }
  }, []);

  const playerPanelContent = useMemo(
    () => (
      <>
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
          <div className="text-xs text-crypt-purple text-center mt-0.5">{"\u{1F464}"} Stealth</div>
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
      </>
    ),
    [
      p.hp,
      p.maxHp,
      p.block,
      p.blockReduction,
      p.statuses,
      p.stealthActive,
      p.counterActive,
      p.offhandWeapon,
      isCharging,
      weapon,
    ],
  );

  const combatLogRef = useRef<HTMLDivElement>(null);

  const combatLogEntries = useMemo(() => {
    const entries = [...log].reverse();
    return entries.map((l, i) => {
      const age = entries.length - 1 - i;
      const opacity = Math.max(0.35, 1 - age * 0.06);
      return (
        <div
          key={log.length - age}
          className="text-sm leading-relaxed"
          style={{ color: age === 0 ? "#ece0c8" : `rgba(168,152,120,${opacity})` }}
        >
          {l}
        </div>
      );
    });
  }, [log]);

  useEffect(() => {
    combatLogRef.current?.scrollTo({ top: combatLogRef.current.scrollHeight, behavior: "smooth" });
  }, [log.length]);

  const actionButtonsJsx = (() => {
    if (isTargeting || subAction !== "none") return null;
    const combatAbilities = allAbilities.filter((a) => a.source.type !== "item");
    const itemAbilities = allAbilities.filter((a) => a.source.type === "item");
    return (
      <>
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
      </>
    );
  })();

  const targetingJsx = isTargeting && (
    <div className="flex gap-3 items-center">
      <div className="text-sm text-crypt-gold">Select target for {pendingAbility?.name}</div>
      <button style={btnStyle("#3a2f25")} className="text-sm! px-3! py-1!" onClick={cancelAction}>
        Cancel
      </button>
    </div>
  );

  const weaponPickerJsx = subAction === "pick_weapon" && (
    <div className="panel max-w-lg w-full lg:max-w-none">
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
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center gap-2 relative overflow-hidden p-3
                 lg:grid lg:grid-cols-[260px_1fr] lg:grid-rows-[auto_1fr] lg:h-dvh lg:gap-3 lg:p-4 lg:overflow-hidden"
    >
      <div className="vignette" />

      {/* Animation overlay */}
      {animEvents.length > 0 && (
        <AnimationLayer
          events={animEvents}
          panelRefs={panelRefsMap as React.RefObject<Map<string, HTMLDivElement>>}
          playerPanelRef={playerPanelRef}
          containerRef={containerRef}
        />
      )}

      {/* Header */}
      <div className="flex gap-4 items-center relative z-1 flex-wrap justify-center lg:col-span-2">
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

      {/* Left sidebar: Combat log (landscape only) */}
      <div className="hidden lg:flex lg:flex-col lg:col-start-1 lg:row-start-2 lg:self-stretch panel overflow-y-auto relative z-1 px-3 py-1.5 min-h-0">
        <div className="text-[0.6rem] text-crypt-dim tracking-wider uppercase mb-1 shrink-0">
          Combat Log
        </div>
        <div ref={combatLogRef} className="overflow-y-auto min-h-0 flex-1">
          {combatLogEntries}
        </div>
      </div>

      {/* Center: Combatants */}
      <div
        className="flex flex-col gap-2 relative z-1 items-center w-full px-4
                       lg:col-start-2 lg:row-start-2 lg:overflow-y-auto lg:self-stretch"
      >
        {/* Battlefield — centered in available space */}
        <div className="flex flex-col gap-2 lg:gap-6 items-center lg:flex-1 lg:justify-center">
          {[
            { row: "back" as const, list: backRow, icon: "\u{1F6E1}", label: "Back Row" },
            { row: "front" as const, list: frontRow, icon: "\u2694", label: "Front Row" },
          ].map(
            ({ row, list, icon, label }) =>
              list.length > 0 && (
                <div key={row}>
                  <div className="text-[0.6rem] text-crypt-dim text-center tracking-wider mb-1 uppercase">
                    {icon} {label}
                  </div>
                  <div className="flex gap-2 lg:gap-3 flex-wrap justify-center">
                    <AnimatePresence mode="popLayout">
                      {enemies.map((enemy, i) => {
                        if (enemy.row !== row || enemy.hp <= 0) return null;
                        return (
                          <EnemyPanel
                            key={enemy.uid}
                            enemy={enemy}
                            targeted={isTargeting ? false : targetIdx === i}
                            onClick={() => handleEnemyClick(i)}
                            panelRef={setPanelRef(enemy.uid)}
                            animState={enemyAnimStates[enemy.uid]}
                          />
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ),
          )}

          {/* Player panel */}
          <div
            ref={setPlayerPanelRef}
            className={`panel relative lg:shrink-0 ${playerFlash ? "combat-anim-flash-red" : ""}`}
            style={{ minWidth: "160px", maxWidth: "190px" }}
          >
            {playerPanelContent}
          </div>
        </div>

        {/* Combat log (portrait only) */}
        <div className="panel w-full max-w-xl px-3 py-1.5 lg:hidden">{combatLogEntries}</div>

        {/* Actions — fixed min-height so battlefield doesn't shift when content changes */}
        <div className="flex flex-col gap-2 items-center justify-center w-full lg:shrink-0 lg:min-h-30 px-4 lg:px-0">
          {targetingJsx}
          {weaponPickerJsx}
          {actionButtonsJsx}
        </div>
      </div>
    </div>
  );
}

/* ── Exported wrapper: wraps in ScreenShake provider ── */

export function CombatScreen({ room }: { room: DungeonNode }) {
  return (
    <ScreenShake>
      <CombatScreenInner room={room} />
    </ScreenShake>
  );
}
