import { useEffect, useMemo, useState } from "react";
import { IconBind, IconFocus, IconHymnHum } from "../icons";
import {
  allAssigned,
  assignFace,
  canAssign,
  canRollSlot,
  dieForSlot,
  faceAtPoolId,
  initDiceCombat,
  resolveTurn,
  rollSlot,
  rollSlotWithFace,
  stepEnemyTurn,
  stopRolling,
} from "./engine";
import { COLORS, getFace, SLOT_ORDER } from "./dice-defs";
import { getEnemyDef } from "./enemy-defs";
import { FACE_COLOR_CSS, FaceGlyphs } from "./FaceGlyphs";
import { RollingDieCuboid } from "./RollingDieCuboid";
import type {
  DiceCombatState,
  DiceLoadout,
  DieDef,
  DieSlot,
  FaceColor,
  FaceDef,
  PoolFace,
  SymbolKey,
} from "./types";
import { STATUS_COLORS, STATUS_DESC, STATUS_ICONS } from "../data/status";
import type { StatusKey } from "../types";

const SYMBOL_DESC: Record<SymbolKey, string> = {
  sword: "Deals 1 damage to the target.",
  shield: "Grants 1 block, absorbing the next 1 damage.",
  heart: "Restores 1 HP.",
  flame: "Deals 1 fire damage (ignores block).",
  drop: "Applies 1 Bleed. Bleeding enemies lose HP each turn.",
  spark: "Applies 1 Stun. Stunned enemies skip their next action.",
  crystal: "Grants 1 Salt (resource).",
  bolt: "Applies 1 Weaken. Weakened targets deal reduced damage equal to their current Weaken stacks; consumes 1 stack per hit.",
  sun: "Applies 1 Bolster. Bolstered targets deal extra damage equal to current Bolster stacks; consumes 1 stack per hit.",
  riposte:
    "Assign to a melee attack: blocks 1 damage and deals 1 back to the attacker before it resolves.",
  cleanse: "Removes all negative status effects from self.",
  mark: "Marks the target — the next damage they take is doubled.",
  power: "Grants +1 Power charge, boosting the next attack.",
  dodge: "Negates the next incoming attack entirely.",
  reproduce: "Spawns a new enemy of the same kind in the same row.",
  steal: "Steals 1 Salt from the player.",
  push: "Pushes all enemies in this row to the back row.",
  reform: "Reassembles this skeleton enemy after death.",
  intangible: "Becomes intangible — immune to physical damage until next turn.",
  hide: "Becomes hidden — cannot be targeted this turn. Enables Sneak Attack.",
  summon: "Raises a dead enemy as a zombie in the same row.",
  invert: "Inverts one of the player's die colors.",
  bind: "Binds one of the player's dice — that die cannot be rolled this turn.",
  burrow_spawn: "Surfaces from underground and spawns a zombie.",
  ranged: "Can target back-row enemies and be used from the back row.",
  area: "Also hits enemies adjacent to the target in the same row.",
  holy: "Damage symbols deal +1 vs undead enemies.",
  pierce: "Damage symbols ignore enemy block (warded stacks).",
  unblockable: "Shields cannot absorb this attack.",
  undodgeable: "Dodge cannot cancel this attack.",
  resonance: "Grants 1 Resonance — the next color clash is forgiven.",
  hymn_hum: "Echo faces act as wildcards during bust checks this turn.",
  armor_break: "Removes 1 Ward from the target.",
  bleed_burst:
    "If target is Bleeding, consume all stacks and deal that as burst damage. Otherwise applies 2 Bleed.",
  drag: "Applies Dragged — target's dodge is disabled next turn.",
  sneak_attack: "Only resolves if the attacker is hidden. The entire face fizzles otherwise.",
  taunt: "Forces all other enemies to be untargetable until this enemy is killed or Taunt clears.",
  self_damage: "Deals 1 damage to yourself (injected by poison corruption).",
  poison:
    "Adds a self-damage symbol to a random die face (the same face can be hit multiple times).",
  focus: "Grants 1 Focus — on your next roll, choose which face lands.",
};

const NON_STACKABLE: ReadonlySet<SymbolKey> = new Set([
  "ranged",
  "area",
  "holy",
  "pierce",
  "unblockable",
  "undodgeable",
  "dodge",
  "hymn_hum",
  "sneak_attack",
  "taunt",
] as SymbolKey[]);

function faceDesc(face: FaceDef): string {
  const symbols = face.symbols ?? [];
  if (symbols.length === 0) return "No effect.";
  const counts = new Map<SymbolKey, number>();
  const order: SymbolKey[] = [];
  for (const s of symbols) {
    if (!counts.has(s)) order.push(s);
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return order
    .map((s) => {
      const n = counts.get(s)!;
      const desc = SYMBOL_DESC[s];
      if (n === 1 || NON_STACKABLE.has(s)) return desc;
      const scaled = desc
        .replace(/^(Deals )(\d+)/, (_, p, d) => `${p}${n * +d}`)
        .replace(/^(Grants )(\d+)/, (_, p, d) => `${p}${n * +d}`)
        .replace(/^(Applies )(\d+)/, (_, p, d) => `${p}${n * +d}`)
        .replace(/^(Restores )(\d+)/, (_, p, d) => `${p}${n * +d}`);
      return scaled !== desc ? scaled : `${desc} (×${n})`;
    })
    .join(" ");
}

/* Maps enemy id prefix → art tile tone class */
const ENEMY_TONE: Record<string, string> = {
  skeleton: "teal",
  gutborn: "crimson",
  rat: "rot",
  haunt: "bruise",
  bone_king: "teal",
  gravecrawler: "rot",
  crypt_warden: "crimson",
  blight_seep: "bruise",
};
function toneFor(enemyId: string): string {
  const key = Object.keys(ENEMY_TONE).find((k) => enemyId.toLowerCase().includes(k));
  return key ? ENEMY_TONE[key] : "crimson";
}

function injectPoisonSymbols(face: FaceDef, stacks: number): FaceDef {
  if (stacks === 0) return face;
  return {
    ...face,
    symbols: [...Array<"self_damage">(stacks).fill("self_damage"), ...(face.symbols ?? [])],
  };
}

interface Props {
  readonly loadout: DiceLoadout;
  readonly startingHp: number;
  readonly startingMaxHp: number;
  readonly startingSalt: number;
  readonly initialEnemies: readonly { readonly id: string; readonly uid: string }[];
  readonly onVictory: (finalHp: number, finalSalt: number, lootSalt: number) => void;
  readonly onDefeat: () => void;
}

export function DiceScreen({
  loadout,
  startingHp,
  startingMaxHp,
  startingSalt,
  initialEnemies,
  onVictory,
  onDefeat,
}: Props) {
  const [state, setState] = useState<DiceCombatState>(() =>
    initDiceCombat({
      loadout,
      startingHp,
      startingMaxHp,
      startingSalt,
      enemies: initialEnemies,
    }),
  );

  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [history, setHistory] = useState<DiceCombatState[]>([]);
  const [focusPendingSlot, setFocusPendingSlot] = useState<DieSlot | null>(null);
  const [learnSlot, setLearnSlot] = useState<DieSlot | null>(null);
  const [inspectEnemyUid, setInspectEnemyUid] = useState<string | null>(null);
  const [showPlayerStatus, setShowPlayerStatus] = useState(false);
  const [playerFlashUid, setPlayerFlashUid] = useState<string | null>(null);
  const [rollingPoolIds, setRollingPoolIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!playerFlashUid) return;
    const t = setTimeout(() => setPlayerFlashUid(null), 500);
    return () => clearTimeout(t);
  }, [playerFlashUid]);

  useEffect(() => {
    if (state.phase === "victory") {
      onVictory(state.player.hp, state.player.salt + 5, 5);
    } else if (state.phase === "defeat") {
      onDefeat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "rolling") setRollingPoolIds(new Set());
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === "resolving-enemies") {
      const t = setTimeout(() => setState((s) => stepEnemyTurn(s)), 600);
      return () => clearTimeout(t);
    }
    return;
  }, [state.phase, state.enemyQueue.length]);

  const selectedFace = useMemo(
    () => (selectedPoolId !== null ? faceAtPoolId(state, selectedPoolId) : null),
    [selectedPoolId, state],
  );

  function handleRoll(slot: DieSlot) {
    if (state.phase !== "rolling") return;
    if (!canRollSlot(state, slot)) return;
    const isStunned = (state.player.statuses.stun ?? 0) > 0;
    if (!isStunned && (state.player.statuses.focus ?? 0) > 0) {
      setFocusPendingSlot(slot);
      return;
    }
    const nextState = rollSlot(state, slot);
    setState(nextState);
    const newFace = nextState.pool[nextState.pool.length - 1];
    if (newFace) setRollingPoolIds((prev) => new Set([...prev, newFace.poolId]));
  }

  function handleFocusPick(faceIdx: number) {
    if (focusPendingSlot === null) return;
    const slot = focusPendingSlot;
    setFocusPendingSlot(null);
    const nextState = rollSlotWithFace(state, slot, faceIdx);
    setState(nextState);
    const newFace = nextState.pool[nextState.pool.length - 1];
    if (newFace) setRollingPoolIds((prev) => new Set([...prev, newFace.poolId]));
  }

  function handleStop() {
    setHistory([]);
    setState((s) => stopRolling(s));
  }

  function handleResolve() {
    setHistory([]);
    setState((s) => resolveTurn(s));
    setSelectedPoolId(null);
  }

  function handlePoolFaceClick(poolId: number) {
    if (state.phase !== "assigning") return;
    setSelectedPoolId((cur) => (cur === poolId ? null : poolId));
  }

  function applyDie(poolId: number, targetUid: string | null) {
    if (state.phase !== "assigning") return;
    const check = canAssign(state, poolId, targetUid);
    if (!check.ok) return;
    setHistory((h) => [...h, state]);
    setState((s) => assignFace(s, poolId, targetUid));
    setSelectedPoolId(null);
  }

  function handleEnemyClick(uid: string) {
    if (state.phase !== "assigning" || selectedPoolId === null) return;
    applyDie(selectedPoolId, uid);
    setPlayerFlashUid(uid);
  }

  function handleAttackClick(uid: string, faceIndex: number) {
    if (state.phase !== "assigning" || selectedPoolId === null) return;
    applyDie(selectedPoolId, `attack:${uid}:${faceIndex}`);
    setPlayerFlashUid(uid);
  }

  function handleSelfApply() {
    if (state.phase !== "assigning" || selectedPoolId === null) return;
    applyDie(selectedPoolId, null);
  }

  function handleUndo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setState(prev);
    setSelectedPoolId(null);
  }

  const phase = state.phase;
  const busted = phase === "busted";
  const p = state.player;

  // Candle HP segments (8 total)
  const candleSegs = 8;
  const candleLit = Math.round((p.hp / p.maxHp) * candleSegs);

  // Pool bust risk: % of pool colors that would collide if a die face shares them
  function bustRiskForDie(slot: DieSlot): { matching: number; total: number } {
    const die = dieForSlot(slot, state);
    const poolColors = state.pool.filter((pf) => pf.color !== "colorless").map((pf) => pf.color);
    const faceColors = die.faces.map((faceId) => {
      const face = getFace(faceId);
      return face?.color ?? ("blank" as FaceColor);
    });
    const matching = faceColors.filter((c) => c !== "colorless" && poolColors.includes(c)).length;
    return { matching, total: die.faces.length };
  }

  function wouldBust(colorId: FaceColor): boolean {
    if (colorId === "colorless") return false;
    const seenByColor = new Map<FaceColor, number>();
    for (const pf of state.pool) {
      let c = pf.color;
      if (c === "colorless") continue;
      if (state.player.hymnHumActive && c === "echo") continue;
      if (state.player.invertedColor && c === state.player.invertedColor) c = "brine";
      seenByColor.set(c, (seenByColor.get(c) ?? 0) + 1);
    }
    let effectiveColor = colorId;
    if (state.player.hymnHumActive && effectiveColor === "echo") return false;
    if (state.player.invertedColor && effectiveColor === state.player.invertedColor)
      effectiveColor = "brine";
    return (seenByColor.get(effectiveColor) ?? 0) >= 1;
  }

  // Altar phase label
  const altarLabel = busted
    ? "✗ TORCH OUT"
    : phase === "assigning"
      ? "tap a die · then a mark"
      : "";

  // Latest log line for the strip
  const latestLog = state.log.length > 0 ? state.log[state.log.length - 1] : null;

  const visibleEnemies = state.enemies.filter((e) => e.hp > 0);

  function isTargetable(uid: string): boolean {
    if (selectedPoolId === null) return false;
    return canAssign(state, selectedPoolId, uid).ok;
  }
  function isAttackTargetable(uid: string, idx: number): boolean {
    if (selectedPoolId === null) return false;
    return canAssign(state, selectedPoolId, `attack:${uid}:${idx}`).ok;
  }

  const canUndo = phase === "assigning" && history.length > 0;

  const isDefensive =
    selectedFace?.symbols?.some((s) => s === "shield" || s === "dodge" || s === "riposte") ?? false;
  const canSelfApply =
    phase === "assigning" &&
    selectedFace !== null &&
    !isDefensive &&
    (selectedFace.target === "self" ||
      selectedFace.target === "none" ||
      selectedFace.target === "all-front" ||
      selectedFace.target === "all-enemies");

  return (
    <div className={`stage${phase === "resolving-enemies" ? " stage--enemy-turn" : ""}`}>
      {/* Stone arches */}
      <svg className="arches" viewBox="0 0 880 90" preserveAspectRatio="none">
        <path
          d="M0 90 L0 50 Q40 10 110 10 Q180 10 220 50 L220 90 Z M220 90 L220 50 Q260 10 330 10 Q400 10 440 50 L440 90 Z M440 90 L440 50 Q480 10 550 10 Q620 10 660 50 L660 90 Z M660 90 L660 50 Q700 10 770 10 Q840 10 880 50 L880 90 Z"
          fill="#0a1a1a"
          stroke="#2a4a4a"
          strokeWidth="1.5"
        />
      </svg>

      {/* Header */}
      <div className="hdr">
        {/* Candle HP */}
        <div className="candles">
          {Array.from({ length: candleSegs }).map((_, i) => {
            const isLit = i < candleLit;
            return (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                {isLit && <div className="candle-wick" />}
                <div
                  className="candle-stick"
                  style={{ height: 14 + (i % 3) * 2, opacity: isLit ? 1 : 0.5 }}
                />
              </div>
            );
          })}
          <span className="hp-num">
            {p.hp} / {p.maxHp}
          </span>
        </div>

        {/* Title */}
        <div className="title">
          {busted ? (
            <div className="bust-banner">
              <div className="display" style={{ lineHeight: 1 }}>
                — BUSTED —
              </div>
              <div className="eyebrow" style={{ color: "var(--torch)", marginTop: 4 }}>
                the torch died · turn ends
              </div>
            </div>
          ) : (
            <>
              <div className="eyebrow">
                turn {state.turn} ·{" "}
                {phase === "assigning"
                  ? "choose marks"
                  : phase === "resolving-enemies"
                    ? "enemies act"
                    : "they wake"}
              </div>
            </>
          )}
        </div>

        {/* Salt */}
        <div className="salt">
          <span className="mono" style={{ fontSize: 11, color: "var(--crypt)" }}>
            SALT {p.salt}
          </span>
          <div className="salt-jar">
            <i style={{ height: `${Math.min(100, p.salt * 5)}%` }} />
          </div>
        </div>
      </div>

      {/* Enemy row — back-row enemies shown at 60% scale, original order preserved */}
      <div className="enemies" style={{ padding: "14px 20px 8px" }}>
        {visibleEnemies.map((enemy) => (
          <AlcoveCard
            key={enemy.uid}
            state={state}
            enemy={enemy}
            targetable={isTargetable(enemy.uid)}
            onClick={() => handleEnemyClick(enemy.uid)}
            isAttackTargetable={(idx) => isAttackTargetable(enemy.uid, idx)}
            onAttackClick={(idx) => handleAttackClick(enemy.uid, idx)}
            onInspect={() => setInspectEnemyUid(enemy.uid)}
            playerFlash={playerFlashUid === enemy.uid}
            backRow={enemy.row === "back"}
          />
        ))}
        {visibleEnemies.length === 0 && (
          <span style={{ opacity: 0.4, fontStyle: "italic" }}>(all enemies defeated)</span>
        )}
      </div>

      {/* Altar / Pool */}
      <div className="altar-wrap">
        <div className="altar">
          <div className="torch-stand l" />
          <div className="torch-glow l" />
          <div className="torch-stand r" />
          <div className="torch-glow r" />
          <div className="altar-slab">
            <div className="altar-head">
              <span className="eyebrow">
                THE ALTAR · {state.pool.length} stone{state.pool.length === 1 ? "" : "s"}
              </span>
              <span className="eyebrow" style={{ color: busted ? "var(--blood)" : "var(--torch)" }}>
                {altarLabel}
              </span>
            </div>
            <div className="altar-pool">
              {state.pool.length === 0 && phase === "rolling" && (
                <span className="eyebrow" style={{ color: "var(--bone-faint)" }}>
                  tap a kit below to lay the first stone
                </span>
              )}
              {state.pool.map((pf) => (
                <PoolDieCard
                  key={pf.poolId}
                  pf={pf}
                  state={state}
                  selected={selectedPoolId === pf.poolId}
                  busted={busted}
                  onClick={() => handlePoolFaceClick(pf.poolId)}
                  isRolling={rollingPoolIds.has(pf.poolId)}
                  onRollComplete={() =>
                    setRollingPoolIds((prev) => {
                      const next = new Set(prev);
                      next.delete(pf.poolId);
                      return next;
                    })
                  }
                />
              ))}
              {phase === "rolling" && state.pool.length > 0 && (
                <div className="pool-empty">
                  roll
                  <br />
                  more?
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="action-bar">
        {phase === "rolling" && (
          <>
            <button className="btn ghost" onClick={handleStop} disabled={state.pool.length === 0}>
              DONE ROLLING ({state.pool.length})
            </button>
            <span className="hint">or keep rolling ↓</span>
          </>
        )}
        {phase === "assigning" && (
          <>
            <span className="hint">
              {selectedPoolId == null ? (
                "tap a die above, then tap a mark"
              ) : (
                <>
                  die selected — <b>{canSelfApply ? "click Apply to Self or " : ""}tap a mark</b>
                </>
              )}
            </span>
            {canUndo && (
              <button className="btn ghost" onClick={handleUndo}>
                ↩ Undo
              </button>
            )}
            {canSelfApply && (
              <button className="btn crypt" onClick={handleSelfApply}>
                Apply to Self
              </button>
            )}
            <button className="btn blood" disabled={!allAssigned(state)} onClick={handleResolve}>
              END TURN ▸
            </button>
          </>
        )}
        {busted && (
          <button className="btn" onClick={handleResolve}>
            TURN ENDS →
          </button>
        )}
      </div>

      {/* Weapon tablets / Kit */}
      <div className="kit">
        {SLOT_ORDER.map((slot) => {
          const die = dieForSlot(slot, state);
          if (!die) return null;
          const locked = state.player.slotLocks.includes(slot);
          const canRoll = phase === "rolling" && !locked && canRollSlot(state, slot);
          const risk = bustRiskForDie(slot);
          const isHot = canRoll && risk.matching / risk.total > 1 / 3;
          const corruptions = state.player.corruptedFaces.filter((c) => c.slot === slot);
          const poisoned = state.player.poisonedFaces.filter((p) => p.slot === slot);
          return (
            <div
              key={slot}
              className={`tablet ${isHot ? "hot" : ""} ${locked ? "locked" : ""}`}
              onClick={canRoll ? () => handleRoll(slot) : undefined}
            >
              <div className="tablet-head">
                <span className="tablet-name">
                  {(() => {
                    const DI = die.icon;
                    return (
                      <>
                        <DI
                          style={{
                            width: "1em",
                            height: "1em",
                            display: "inline-block",
                            verticalAlign: "middle",
                          }}
                        />{" "}
                        {die.name}
                      </>
                    );
                  })()}
                </span>
                <span className={`tablet-risk ${isHot ? "warn" : ""}`}>
                  {locked ? (
                    <IconBind style={{ width: "0.8em", height: "0.8em" }} />
                  ) : isHot ? (
                    `⚠ ${risk.matching}/${risk.total}`
                  ) : (
                    `${risk.matching}/${risk.total}`
                  )}
                </span>
              </div>
              <div className="tablet-faces">
                {die.faces.map((faceId, idx) => {
                  const face = getFace(faceId);
                  if (!face) return null;
                  const corruption = corruptions.find((c) => c.faceIndex === idx);
                  const poisonStacks = poisoned.filter((p) => p.faceIndex === idx).length;
                  const colorId: FaceColor = corruption ? corruption.recoloredTo : face.color;
                  const bustWarning = wouldBust(colorId);
                  return (
                    <div key={idx} className={`face ${bustWarning ? "bust-warning" : ""}`}>
                      <div className="band" style={{ background: FACE_COLOR_CSS[colorId] }} />
                      <div className="sym">
                        <FaceGlyphs
                          face={injectPoisonSymbols(face, poisonStacks)}
                          size="16px"
                          color={FACE_COLOR_CSS[colorId]}
                        />
                      </div>
                      <div className="lab">{face.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Player status button + badges */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "4px 0 0",
          gap: "3px",
        }}
      >
        {(Object.values(p.statuses).some((v) => (v ?? 0) > 0) ||
          p.hymnHumActive ||
          p.resonanceCharges > 0 ||
          p.slotLocks.length > 0) && (
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            {(Object.keys(p.statuses) as StatusKey[])
              .filter((k) => (p.statuses[k] ?? 0) > 0)
              .map((k) => {
                const Icon = STATUS_ICONS[k];
                return (
                  <span
                    key={k}
                    title={`${k.charAt(0).toUpperCase() + k.slice(1)}: ${STATUS_DESC[k]}`}
                    style={{
                      color: STATUS_COLORS[k],
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.2rem",
                    }}
                  >
                    <Icon style={{ width: "1.17em", height: "1.17em" }} />
                    {(p.statuses[k] ?? 0) > 1 ? `×${p.statuses[k]}` : ""}
                  </span>
                );
              })}
            {p.hymnHumActive && (
              <span
                style={{
                  color: "var(--crypt)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.2rem",
                }}
              >
                <IconHymnHum style={{ width: "1.17em", height: "1.17em" }} /> Hymn-Hum
              </span>
            )}
            {p.resonanceCharges > 0 && <span style={{ color: "var(--torch)" }}>✦ Resonance</span>}
            {p.slotLocks.length > 0 && (
              <span
                style={{
                  color: "var(--blood)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.2rem",
                }}
              >
                <IconBind style={{ width: "1.17em", height: "1.17em" }} /> {p.slotLocks.join(", ")}
              </span>
            )}
          </div>
        )}
        <button
          className="btn ghost"
          style={{ fontSize: 9, padding: "2px 8px" }}
          onClick={() => setShowPlayerStatus(true)}
        >
          🔍 Status
        </button>
      </div>

      {/* Log strip */}
      <div className="log">
        <span className="narr">&gt;</span>
        <span className="line">
          {latestLog ? latestLog.text : "you stand before the vault. lay the first stone."}
        </span>
        <span style={{ color: "var(--bone-faint)" }}>T{state.turn}</span>
      </div>

      {/* Dialogs */}
      {focusPendingSlot ? (
        <FocusPickerDialog
          slot={focusPendingSlot}
          die={dieForSlot(focusPendingSlot, state)}
          state={state}
          onPick={handleFocusPick}
          onCancel={() => setFocusPendingSlot(null)}
        />
      ) : null}
      {learnSlot ? (
        <DieLearnDialog
          slot={learnSlot}
          die={dieForSlot(learnSlot, state)}
          state={state}
          onClose={() => setLearnSlot(null)}
        />
      ) : null}
      {inspectEnemyUid ? (
        <EnemyDieDialog
          enemy={state.enemies.find((e) => e.uid === inspectEnemyUid) ?? null}
          onClose={() => setInspectEnemyUid(null)}
        />
      ) : null}
      {showPlayerStatus ? (
        <PlayerStatusDialog state={state} onClose={() => setShowPlayerStatus(false)} />
      ) : null}
    </div>
  );
}

/* ── Alcove enemy card ── */

function AlcoveCard({
  state,
  enemy,
  targetable,
  onClick,
  isAttackTargetable,
  onAttackClick,
  onInspect,
  playerFlash,
  backRow,
}: {
  state: DiceCombatState;
  enemy: DiceCombatState["enemies"][number];
  targetable: boolean;
  onClick: () => void;
  isAttackTargetable: (idx: number) => boolean;
  onAttackClick: (idx: number) => void;
  onInspect: () => void;
  playerFlash: boolean;
  backRow?: boolean;
}) {
  const isDead = enemy.hp <= 0;
  const isActing = state.lastEnemyAction?.uid === enemy.uid;
  const tone = toneFor(enemy.id);

  // Tracks which faces have completed their roll animation this turn.
  // When state.turn changes, doneKey.turn won't match, so done is treated as empty.
  const [doneKey, setDoneKey] = useState<{ turn: number; done: Set<number> }>({
    turn: -1,
    done: new Set(),
  });

  const rollingFaceIndices = useMemo(() => {
    if (enemy.rolledFaces.length === 0) return new Set<number>();
    const done = doneKey.turn === state.turn ? doneKey.done : new Set<number>();
    return new Set(enemy.rolledFaces.map((_, i) => i).filter((i) => !done.has(i)));
  }, [enemy.rolledFaces, state.turn, doneKey]);

  const enemyDef = getEnemyDef(enemy.id);
  const allEnemyDice = [...(enemyDef?.dice ?? []), ...(enemyDef?.phaseDice ?? []).flat()];

  const isHidden = !!enemy.statuses.hidden;
  const flashStyle = playerFlash ? { filter: "drop-shadow(0 0 8px rgba(154,214,163,0.7))" } : {};

  return (
    <div
      className={`alcove ${isActing ? "active" : ""} ${targetable ? "targetable" : ""} ${isDead ? "dead" : ""}`}
      onClick={isDead ? undefined : onClick}
      style={{
        ...flashStyle,
        ...(backRow ? { zoom: 0.6 } : {}),
        ...(isHidden ? { opacity: 0.45 } : {}),
      }}
    >
      {/* Status button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onInspect();
        }}
        className="btn ghost"
        style={{ fontSize: 9, padding: "2px 6px", marginTop: 2 }}
      >
        🔍 Status
      </button>

      {/* Arch + art tile */}
      <div style={{ position: "relative" }}>
        <div className="alcove-arch" />
        <div className="alcove-art">
          <div className={`art-img tone-${tone}`}>
            <span className="lbl">{enemy.name}</span>
          </div>
        </div>
      </div>

      {/* Name plate with HP */}
      <div className="alcove-name">
        <span>
          {(() => {
            const EI = enemy.icon;
            return (
              <>
                <EI
                  style={{
                    width: "1em",
                    height: "1em",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />{" "}
                {enemy.name}
              </>
            );
          })()}
        </span>
        <span className="hp">{`${enemy.hp}/${enemy.maxHp}`}</span>
      </div>

      {/* Status badges */}
      {Object.values(enemy.statuses).some(Boolean) && (
        <div
          style={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {Object.entries(enemy.statuses).map(([k, v]) =>
            v ? (
              <span key={k} title={`${k} ${v > 1 ? v : ""}`}>
                {(() => {
                  const Icon = STATUS_ICONS[k as StatusKey];
                  return (
                    <Icon
                      style={{
                        width: "1.43em",
                        height: "1.43em",
                        display: "inline-block",
                        color: STATUS_COLORS[k as StatusKey],
                      }}
                    />
                  );
                })()}
                {v > 1 ? v : ""}
              </span>
            ) : null,
          )}
        </div>
      )}

      {/* Mini dice fan (rolled faces) */}
      <div className="alcove-dice">
        {enemy.rolledFaces.map((rf, i) => {
          const face = getFace(rf.faceId);
          if (!face) return null;
          const n = enemy.rolledFaces.length;
          const canDefend = isAttackTargetable(i);
          const mit = state.attackMitigations[`${enemy.uid}:${i}`];
          const mitigated = mit && (mit.block > 0 || mit.dodge || mit.riposteDamage > 0);
          const cancelled = mitigated && mit.dodge;
          const isRolling = rollingFaceIndices.has(i);
          const enemyDie = allEnemyDice.find((d) => d.id === rf.dieId) ?? null;

          return (
            <div
              key={i}
              className="mini"
              style={{ transform: `rotate(${(i - (n - 1) / 2) * 8}deg)` }}
            >
              {isRolling && enemyDie ? (
                <RollingDieCuboid
                  die={enemyDie}
                  resultFaceId={rf.faceId}
                  mini
                  delay={i * 0.12}
                  onRollComplete={() =>
                    setDoneKey((prev) => ({
                      turn: state.turn,
                      done: new Set([...prev.done, i]),
                    }))
                  }
                />
              ) : (
                <div
                  className="mini-die"
                  title={face.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canDefend) onAttackClick(i);
                  }}
                  style={{
                    cursor: canDefend ? "pointer" : "default",
                    opacity: cancelled ? 0.4 : 1,
                    outline: canDefend
                      ? "1.5px solid var(--torch)"
                      : mitigated
                        ? "1px solid var(--crypt)"
                        : undefined,
                    position: "relative",
                  }}
                >
                  <div className="band" style={{ background: FACE_COLOR_CSS[face.color] }} />
                  <div className="sym">
                    <FaceGlyphs face={face} size="18px" color={FACE_COLOR_CSS[face.color]} />
                  </div>
                  {rf.focused && (
                    <div
                      title="Selected by Focus"
                      style={{
                        position: "absolute",
                        top: 2,
                        left: 2,
                        width: 8,
                        height: 8,
                        color: "#000",
                      }}
                    >
                      <IconFocus style={{ width: "100%", height: "100%" }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Pool die card (altar slot) ── */

function PoolDieCard({
  pf,
  state,
  selected,
  busted,
  onClick,
  isRolling,
  onRollComplete,
}: {
  pf: PoolFace;
  state: DiceCombatState;
  selected: boolean;
  busted: boolean;
  onClick: () => void;
  isRolling: boolean;
  onRollComplete: () => void;
}) {
  const face = getFace(pf.faceId);
  if (!face) return null;
  const assignment = state.assignments[pf.poolId];
  const target = assignment?.targetUid
    ? state.enemies.find((e) => e.uid === assignment.targetUid)
    : null;
  const assigned = !!assignment;
  const die = dieForSlot(pf.slot, state);
  const faceIndex = die ? die.faces.indexOf(pf.faceId) : -1;
  const poisonStacks =
    faceIndex !== -1
      ? state.player.poisonedFaces.filter((p) => p.slot === pf.slot && p.faceIndex === faceIndex)
          .length
      : 0;

  if (isRolling && die) {
    return <RollingDieCuboid die={die} resultFaceId={pf.faceId} onRollComplete={onRollComplete} />;
  }

  return (
    <div
      className={`pool-die ${selected ? "selected" : ""} ${assigned ? "assigned" : ""} ${busted ? "busted" : ""} ${pf.stunned ? "stunned" : ""}`}
      onClick={onClick}
      title={pf.stunned ? `${face.label} — stunned, no effect` : `${face.label}\n${faceDesc(face)}`}
    >
      <div className="band" style={{ background: FACE_COLOR_CSS[pf.color] }} />
      <div className="sym">
        <FaceGlyphs
          face={injectPoisonSymbols(face, poisonStacks)}
          size="26px"
          color={FACE_COLOR_CSS[pf.color]}
        />
      </div>
      {assignment && !pf.stunned && (
        <div className="target-tag">→ {target ? target.name : "self"}</div>
      )}
      {pf.stunned && (
        <div
          style={{
            fontSize: 7,
            color: STATUS_COLORS.stun,
            textAlign: "center",
            position: "absolute",
            top: 0,
            right: 1,
          }}
        >
          STUN
        </div>
      )}
      {pf.forced && !pf.stunned && (
        <div
          style={{
            fontSize: 7,
            color: "var(--blood)",
            textAlign: "center",
            position: "absolute",
            top: 0,
            right: 1,
          }}
        >
          FORCED
        </div>
      )}
      {pf.focused && (
        <div
          title="Selected by Focus"
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            width: 10,
            height: 10,
            color: STATUS_COLORS.focus,
          }}
        >
          <IconFocus style={{ width: "100%", height: "100%" }} />
        </div>
      )}
    </div>
  );
}

/* ── Focus face-picker dialog ── */

function FocusPickerDialog({
  slot,
  die,
  state,
  onPick,
  onCancel,
}: {
  slot: DieSlot;
  die: DieDef;
  state: DiceCombatState;
  onPick: (faceIdx: number) => void;
  onCancel: () => void;
}) {
  const corruptions = state.player.corruptedFaces.filter((c) => c.slot === slot);
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a120c",
          border: `1.5px solid ${STATUS_COLORS.focus}`,
          padding: "1.2rem",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          color: "var(--bone)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.5rem",
          }}
        >
          <div className="display" style={{ fontSize: "1.2rem", color: STATUS_COLORS.focus }}>
            Focus — choose your face
          </div>
          <button onClick={onCancel} className="btn ghost" style={{ fontSize: "0.8rem" }}>
            Cancel ✕
          </button>
        </div>
        <div className="eyebrow" style={{ marginBottom: "0.8rem" }}>
          {die.name} · click a face to land on it
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {die.faces.map((faceId, idx) => {
            const face = getFace(faceId);
            if (!face) return null;
            const corruption = corruptions.find((c) => c.faceIndex === idx);
            const colorId: FaceColor = corruption ? corruption.recoloredTo : face.color;
            const color = COLORS[colorId];
            return (
              <div
                key={idx}
                onClick={() => onPick(idx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.5rem",
                  background: "#0f0a07",
                  border: "1px solid #2a1c10",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = STATUS_COLORS.focus)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = "#2a1c10")
                }
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    background: FACE_COLOR_CSS[colorId],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                  title={color.label}
                >
                  {color.badge}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <FaceGlyphs face={face} size="1.2rem" color={FACE_COLOR_CSS[colorId]} />
                    <span style={{ opacity: 0.7 }}>{face.label}</span>
                    <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>
                      ({color.label}
                      {corruption ? " — corrupted" : ""})
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>{faceDesc(face)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Learn-more dialog ── */

function DieLearnDialog({
  slot,
  die,
  state,
  onClose,
}: {
  slot: DieSlot;
  die: DieDef;
  state: DiceCombatState;
  onClose: () => void;
}) {
  const corruptions = state.player.corruptedFaces.filter((c) => c.slot === slot);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a120c",
          border: "1.5px solid var(--bone-faint)",
          padding: "1.2rem",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          color: "var(--bone)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "1rem",
          }}
        >
          <div className="display" style={{ fontSize: "1.2rem" }}>
            {(() => {
              const DI = die.icon;
              return (
                <>
                  <DI
                    style={{
                      width: "1em",
                      height: "1em",
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  />{" "}
                  {die.name}
                </>
              );
            })()}
          </div>
          <button onClick={onClose} className="btn ghost" style={{ fontSize: "0.8rem" }}>
            Close ✕
          </button>
        </div>
        <div className="eyebrow" style={{ marginBottom: "0.8rem" }}>
          Two faces of the same color in your pool = bust
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {die.faces.map((faceId, idx) => {
            const face = getFace(faceId);
            if (!face) return null;
            const corruption = corruptions.find((c) => c.faceIndex === idx);
            const colorId: FaceColor = corruption ? corruption.recoloredTo : face.color;
            const color = COLORS[colorId];
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.5rem",
                  background: "#0f0a07",
                  border: corruption ? "1px solid var(--torch)" : "1px solid #2a1c10",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    background: FACE_COLOR_CSS[colorId],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                  title={color.label}
                >
                  {color.badge}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <FaceGlyphs face={face} size="1.2rem" color={FACE_COLOR_CSS[colorId]} />
                    <span style={{ opacity: 0.7 }}>{face.label}</span>
                    <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>
                      ({color.label}
                      {corruption ? " — corrupted" : ""})
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>{faceDesc(face)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Shared dialog shell ── */

function DialogShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a120c",
          border: "1.5px solid var(--bone-faint)",
          padding: "1.2rem",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          color: "var(--bone)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ title, onClose }: { title: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: "1rem",
      }}
    >
      <div className="display" style={{ fontSize: "1.2rem" }}>
        {title}
      </div>
      <button onClick={onClose} className="btn ghost" style={{ fontSize: "0.8rem" }}>
        Close ✕
      </button>
    </div>
  );
}

/* ── Status rows (shared between enemy + player dialogs) ── */

function StatusRows({ statuses }: { statuses: Partial<Record<StatusKey, number>> }) {
  const activeKeys = (Object.keys(statuses) as StatusKey[]).filter((k) => statuses[k]);
  if (activeKeys.length === 0) return null;
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div className="eyebrow" style={{ marginBottom: "0.4rem" }}>
        Active effects
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {activeKeys.map((k) => (
          <div
            key={k}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}
          >
            <span
              style={{
                display: "inline-block",
                width: "1.56rem",
                height: "1.56rem",
                color: STATUS_COLORS[k],
              }}
            >
              {(() => {
                const Icon = STATUS_ICONS[k];
                return <Icon style={{ width: "1.56rem", height: "1.56rem" }} />;
              })()}
            </span>
            <div>
              <span style={{ color: STATUS_COLORS[k] }}>
                {k.charAt(0).toUpperCase() + k.slice(1).replace("_", " ")}
                {(statuses[k] ?? 0) > 1 ? ` ×${statuses[k]}` : ""}
              </span>
              <div style={{ fontSize: "0.72rem", opacity: 0.7 }}>{STATUS_DESC[k]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Die face rows (shared between enemy + player dialogs) ── */

function FaceRows({
  faceIds,
  corruptions = [],
  poisonedIndices = [],
}: {
  faceIds: readonly string[];
  corruptions?: { faceIndex: number; recoloredTo: FaceColor }[];
  poisonedIndices?: number[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {faceIds.map((faceId, idx) => {
        const face = getFace(faceId);
        if (!face) return null;
        const corruption = corruptions.find((c) => c.faceIndex === idx);
        const poisonStacks = poisonedIndices.filter((i) => i === idx).length;
        const colorId: FaceColor = corruption ? corruption.recoloredTo : face.color;
        const color = COLORS[colorId];
        const symbolDesc = faceDesc(face);
        return (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.4rem",
              background: "#0f0a07",
              border: corruption
                ? "1px solid var(--torch)"
                : poisonStacks > 0
                  ? "1px solid var(--poison)"
                  : "1px solid #2a1c10",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                background: FACE_COLOR_CSS[colorId],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontSize: "0.85rem",
                fontWeight: "bold",
                flexShrink: 0,
              }}
              title={color.label}
            >
              {color.badge}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{ fontSize: "0.9rem", display: "flex", gap: "0.3rem", alignItems: "center" }}
              >
                <FaceGlyphs
                  face={injectPoisonSymbols(face, poisonStacks)}
                  size="1.2rem"
                  color={FACE_COLOR_CSS[colorId]}
                />
                <span style={{ opacity: 0.7 }}>{face.label}</span>
                {corruption && (
                  <span style={{ color: "var(--torch)", fontSize: "0.7rem" }}>corrupted</span>
                )}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>{symbolDesc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Enemy status dialog ── */

function EnemyDieDialog({
  enemy,
  onClose,
}: {
  enemy: DiceCombatState["enemies"][number] | null;
  onClose: () => void;
}) {
  if (!enemy) return null;
  const def = getEnemyDef(enemy.id);
  const dice = def?.dice ?? [];
  return (
    <DialogShell onClose={onClose}>
      <DialogHeader
        title={
          <>
            {(() => {
              const EI = enemy.icon;
              return (
                <>
                  <EI
                    style={{
                      width: "1em",
                      height: "1em",
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  />{" "}
                  {enemy.name}
                </>
              );
            })()}
          </>
        }
        onClose={onClose}
      />
      <StatusRows statuses={enemy.statuses} />
      <div className="eyebrow" style={{ marginBottom: "0.8rem" }}>
        The enemy rolls one face per die each turn
      </div>
      {dice.length === 0 && (
        <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
          No dice — this enemy uses a fixed action.
        </div>
      )}
      {dice.map((die) => (
        <div key={die.id} style={{ marginBottom: "1rem" }}>
          <div
            style={{ fontSize: "0.95rem", marginBottom: "0.4rem" }}
            title={`${die.name} — rolls one face per turn`}
          >
            {(() => {
              const DI = die.icon;
              return (
                <>
                  <DI
                    style={{
                      width: "1em",
                      height: "1em",
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  />{" "}
                  {die.name}
                </>
              );
            })()}
            <span style={{ fontSize: "0.7rem", opacity: 0.6, marginLeft: "0.5rem" }}>
              ({die.defaultTarget === "self" ? "self-buff die" : "attacks player"})
            </span>
          </div>
          <FaceRows faceIds={die.faces} />
        </div>
      ))}
    </DialogShell>
  );
}

/* ── Player status dialog ── */

function PlayerStatusDialog({ state, onClose }: { state: DiceCombatState; onClose: () => void }) {
  const p = state.player;
  const hasStatuses =
    Object.values(p.statuses).some((v) => (v ?? 0) > 0) ||
    p.hymnHumActive ||
    p.resonanceCharges > 0 ||
    p.slotLocks.length > 0;
  return (
    <DialogShell onClose={onClose}>
      <DialogHeader title="Your Status" onClose={onClose} />
      {hasStatuses ? (
        <div style={{ marginBottom: "1rem" }}>
          <StatusRows statuses={p.statuses} />
          {(p.hymnHumActive || p.resonanceCharges > 0 || p.slotLocks.length > 0) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                fontSize: "0.85rem",
              }}
            >
              {p.hymnHumActive && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ display: "inline-block", width: "1.56rem", height: "1.56rem" }}>
                    <IconHymnHum style={{ width: "1.56rem", height: "1.56rem" }} />
                  </span>
                  <div>
                    <span style={{ color: "var(--crypt)" }}>Hymn-Hum</span>
                    <div style={{ fontSize: "0.72rem", opacity: 0.7 }}>
                      Echo-colour dice cannot bust the torch this turn.
                    </div>
                  </div>
                </div>
              )}
              {p.resonanceCharges > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: "1.56rem",
                      height: "1.56rem",
                      textAlign: "center",
                    }}
                  >
                    ✦
                  </span>
                  <div>
                    <span style={{ color: "var(--torch)" }}>Resonance ×{p.resonanceCharges}</span>
                    <div style={{ fontSize: "0.72rem", opacity: 0.7 }}>
                      Absorbs the next {p.resonanceCharges} bust(s).
                    </div>
                  </div>
                </div>
              )}
              {p.slotLocks.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ display: "inline-block", width: "1.56rem", height: "1.56rem" }}>
                    <IconBind style={{ width: "1.56rem", height: "1.56rem" }} />
                  </span>
                  <div>
                    <span style={{ color: "var(--blood)" }}>Locked: {p.slotLocks.join(", ")}</span>
                    <div style={{ fontSize: "0.72rem", opacity: 0.7 }}>
                      These dice cannot be rolled this turn.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "1rem" }}>
          No active effects.
        </div>
      )}
      <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>
        Your dice
      </div>
      {SLOT_ORDER.map((slot) => {
        const die = dieForSlot(slot, state);
        if (!die) return null;
        const corruptions = p.corruptedFaces.filter((c) => c.slot === slot);
        const poisonedIndices = p.poisonedFaces
          .filter((pf) => pf.slot === slot)
          .map((pf) => pf.faceIndex);
        return (
          <div key={slot} style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.95rem", marginBottom: "0.4rem" }}>
              {(() => {
                const DI = die.icon;
                return (
                  <>
                    <DI
                      style={{
                        width: "1em",
                        height: "1em",
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                    />{" "}
                    {die.name}
                  </>
                );
              })()}
            </div>
            <FaceRows
              faceIds={die.faces}
              corruptions={corruptions}
              poisonedIndices={poisonedIndices}
            />
          </div>
        );
      })}
    </DialogShell>
  );
}
