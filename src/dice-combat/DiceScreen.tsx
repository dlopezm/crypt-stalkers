import { useEffect, useMemo, useState } from "react";
import {
  allAssigned,
  assignFace,
  canAssign,
  canRollSlot,
  clearAssignment,
  dieForSlot,
  faceAtPoolId,
  initDiceCombat,
  resolveTurn,
  rollSlot,
  stepEnemyTurn,
  stopRolling,
} from "./engine";
import { COLORS, getFace, SLOT_ORDER } from "./dice-defs";
import { getEnemyDef } from "./enemy-defs";
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

/* ── v3 symbol glyphs ──
 * A face's printed identity: each symbol is one glyph. Renders show the bag
 * directly so the player reads "🗡🗡💧" instead of relying on a label. */
const SYMBOL_GLYPH: Record<SymbolKey, string> = {
  sword: "🗡",
  shield: "🛡",
  heart: "❤",
  flame: "🔥",
  drop: "💧",
  spark: "✦",
  crystal: "◇",
  bolt: "↯",
  sun: "☼",
  riposte: "⤺",
  cleanse: "⟲",
  mark: "⚹",
  power: "↑",
  dodge: "✷",
  reproduce: "🐀",
  steal: "🪙",
  push: "⇄",
  reform: "🦴",
  intangible: "👻",
  summon: "⚰️",
  invert: "🦠",
  bind: "⛓️",
  burrow_spawn: "🪱",
};

const SYMBOL_LABEL: Record<SymbolKey, string> = {
  sword: "1 damage",
  shield: "1 block",
  heart: "1 heal",
  flame: "1 fire",
  drop: "+1 Bleed",
  spark: "+1 Stun",
  crystal: "+1 Salt",
  bolt: "+1 Weaken",
  sun: "+1 Bolster",
  riposte: "Riposte",
  cleanse: "Cleanse",
  mark: "Mark",
  power: "+1 Power",
  dodge: "Dodge",
  reproduce: "Reproduce",
  steal: "Steal salt",
  push: "Push row",
  reform: "Reform",
  intangible: "Phase",
  summon: "Raise Dead",
  invert: "Invert",
  bind: "Bind die",
  burrow_spawn: "Surface + Zombie",
};

/* Maps game FaceColor → new CSS design token */
const FACE_COLOR_CSS: Record<FaceColor, string> = {
  crimson: "var(--blood)",
  salt: "var(--bone-dim)",
  fire: "var(--torch)",
  coldfire: "var(--bruise)",
  brine: "var(--crypt)",
  echo: "var(--crypt)",
  iron: "var(--bone-faint)",
  blank: "var(--bone-faint)",
};

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

function FaceGlyphs({ face, size = "0.95rem" }: { face: FaceDef; size?: string }) {
  const symbols = face.symbols ?? [];
  if (symbols.length === 0) {
    return <span style={{ fontSize: size }}>{face.icon ?? COLORS[face.color].badge}</span>;
  }
  return (
    <span
      style={{
        display: "inline-flex",
        gap: "0.1rem",
        alignItems: "center",
        fontSize: size,
        lineHeight: 1,
      }}
      title={symbols.map((s) => SYMBOL_LABEL[s]).join(", ")}
    >
      {symbols.map((s, i) => (
        <span key={i}>{SYMBOL_GLYPH[s]}</span>
      ))}
    </span>
  );
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
  const [learnSlot, setLearnSlot] = useState<DieSlot | null>(null);
  const [inspectEnemyUid, setInspectEnemyUid] = useState<string | null>(null);
  const [playerFlashUid, setPlayerFlashUid] = useState<string | null>(null);

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
    setState((s) => rollSlot(s, slot));
  }

  function handleStop() {
    setState((s) => stopRolling(s));
  }

  function handleResolve() {
    setState((s) => resolveTurn(s));
    setSelectedPoolId(null);
  }

  function handlePoolFaceClick(poolId: number) {
    if (state.phase !== "assigning") return;
    setSelectedPoolId((cur) => (cur === poolId ? null : poolId));
  }

  function handleEnemyClick(uid: string) {
    if (state.phase !== "assigning" || selectedPoolId === null) return;
    const check = canAssign(state, selectedPoolId, uid);
    if (!check.ok) return;
    setState((s) => assignFace(s, selectedPoolId, uid));
    setSelectedPoolId(null);
    setPlayerFlashUid(uid);
  }

  function handleAttackClick(uid: string, faceIndex: number) {
    if (state.phase !== "assigning" || selectedPoolId === null) return;
    const target = `attack:${uid}:${faceIndex}`;
    const check = canAssign(state, selectedPoolId, target);
    if (!check.ok) return;
    setState((s) => assignFace(s, selectedPoolId, target));
    setSelectedPoolId(null);
    setPlayerFlashUid(uid);
  }

  function handleSelfApply() {
    if (state.phase !== "assigning" || selectedPoolId === null) return;
    const check = canAssign(state, selectedPoolId, null);
    if (!check.ok) return;
    setState((s) => assignFace(s, selectedPoolId, null));
    setSelectedPoolId(null);
  }

  function handleClearAssignment(poolId: number) {
    setState((s) => clearAssignment(s, poolId));
    if (selectedPoolId === poolId) setSelectedPoolId(null);
  }

  const phase = state.phase;
  const busted = phase === "busted";
  const p = state.player;

  // Candle HP segments (8 total)
  const candleSegs = 8;
  const candleLit = Math.round((p.hp / p.maxHp) * candleSegs);

  // Pool bust risk: % of pool colors that would collide if a die face shares them
  function bustRiskForDie(slot: DieSlot): number {
    const die = dieForSlot(slot, state);
    const poolColors = state.pool
      .filter((pf) => {
        const fd = getFace(pf.faceId);
        return !fd?.tags?.includes("silent");
      })
      .map((pf) => pf.color);
    const faceColors = die.faces.map((faceId) => {
      const face = getFace(faceId);
      return face?.color ?? ("blank" as FaceColor);
    });
    const matching = faceColors.filter((c) => poolColors.includes(c)).length;
    return Math.min(100, Math.round((matching / die.faces.length) * 100));
  }

  function wouldBust(colorId: FaceColor, isSilent: boolean): boolean {
    if (isSilent) return false;
    const seenByColor = new Map<FaceColor, number>();
    for (const pf of state.pool) {
      let c = pf.color;
      if (state.player.hymnHumActive && c === "echo") continue;
      const fd = getFace(pf.faceId);
      if (fd?.tags?.includes("silent")) continue;
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

  // Enemy rows
  const front = state.enemies.filter((e) => e.row === "front" && (e.hp > 0 || e.reassembleQueued));
  const back = state.enemies.filter((e) => e.row === "back" && (e.hp > 0 || e.reassembleQueued));

  function isTargetable(uid: string): boolean {
    if (selectedPoolId === null) return false;
    return canAssign(state, selectedPoolId, uid).ok;
  }
  function isAttackTargetable(uid: string, idx: number): boolean {
    if (selectedPoolId === null) return false;
    return canAssign(state, selectedPoolId, `attack:${uid}:${idx}`).ok;
  }

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
    <div className="stage">
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

      {/* Player status badges (compact strip below header) */}
      {(p.powerCharges > 0 ||
        p.twoHandedActive ||
        p.dodgeActive ||
        p.hymnHumActive ||
        p.resonanceCharges > 0 ||
        p.slotLocks.length > 0) && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            padding: "0 20px 4px",
            position: "relative",
            zIndex: 5,
            fontSize: "0.75rem",
          }}
        >
          {p.powerCharges > 0 && (
            <span style={{ color: "var(--bone-dim)" }}>💪 Power +{p.powerCharges}</span>
          )}
          {p.twoHandedActive && <span style={{ color: "var(--bone-dim)" }}>⚔️ Edge +1</span>}
          {p.dodgeActive && <span style={{ color: "var(--bone-dim)" }}>🌀 Dodge</span>}
          {p.hymnHumActive && <span style={{ color: "var(--crypt)" }}>🎵 Hymn-Hum</span>}
          {p.resonanceCharges > 0 && <span style={{ color: "var(--torch)" }}>✦ Resonance</span>}
          {p.slotLocks.length > 0 && (
            <span style={{ color: "var(--blood)" }}>🔒 {p.slotLocks.join(", ")}</span>
          )}
        </div>
      )}

      {/* Enemy rows */}
      <div
        style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {back.length > 0 && (
          <div style={{ padding: "0 20px 0", position: "relative", zIndex: 3 }}>
            <div className="eyebrow" style={{ marginBottom: 4, paddingLeft: 4 }}>
              back row
            </div>
            <div className="enemies" style={{ padding: 0, justifyContent: "flex-start" }}>
              {back.map((enemy) => (
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
                />
              ))}
            </div>
          </div>
        )}
        {front.length > 0 && (
          <div style={{ padding: "0 20px 0", position: "relative", zIndex: 3 }}>
            {back.length > 0 && (
              <div className="eyebrow" style={{ marginBottom: 4, paddingLeft: 4 }}>
                front row
              </div>
            )}
            <div className="enemies" style={{ padding: 0, justifyContent: "flex-start" }}>
              {front.map((enemy) => (
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
                />
              ))}
            </div>
          </div>
        )}
        {front.length === 0 && back.length === 0 && (
          <div className="enemies">
            <span style={{ opacity: 0.4, fontStyle: "italic" }}>(all enemies defeated)</span>
          </div>
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
                  onClear={() => handleClearAssignment(pf.poolId)}
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
                  die selected — <b>tap a mark</b>
                </>
              )}
            </span>
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
          const isHot = canRoll && risk > 33;
          const corruptions = state.player.corruptedFaces.filter((c) => c.slot === slot);
          return (
            <div
              key={slot}
              className={`tablet ${isHot ? "hot" : ""} ${locked ? "locked" : ""}`}
              onClick={canRoll ? () => handleRoll(slot) : undefined}
            >
              <div className="tablet-head">
                <span className="tablet-name">
                  {die.icon} {die.name}
                </span>
                <span className={`tablet-risk ${isHot ? "warn" : ""}`}>
                  {locked ? "🔒" : isHot ? `⚠ ${risk}%` : `${risk}%`}
                </span>
              </div>
              <div className="tablet-faces">
                {die.faces.map((faceId, idx) => {
                  const face = getFace(faceId);
                  if (!face) return null;
                  const corruption = corruptions.find((c) => c.faceIndex === idx);
                  const colorId: FaceColor = corruption ? corruption.recoloredTo : face.color;
                  const isSilent = face.tags?.includes("silent") ?? false;
                  const bust = canRoll && wouldBust(colorId, isSilent);
                  const colorInPool = state.pool.some((pf) => pf.color === face.color);
                  return (
                    <div key={idx} className={`face ${colorInPool ? "in-pool" : ""}`}>
                      <div className="band" style={{ background: FACE_COLOR_CSS[colorId] }} />
                      <div className="sym">
                        <FaceGlyphs face={face} size="11px" />
                      </div>
                      <div className="lab">{face.label}</div>
                      {bust && <span className="warn">⚠</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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
}: {
  state: DiceCombatState;
  enemy: DiceCombatState["enemies"][number];
  targetable: boolean;
  onClick: () => void;
  isAttackTargetable: (idx: number) => boolean;
  onAttackClick: (idx: number) => void;
  onInspect: () => void;
  playerFlash: boolean;
}) {
  const isReassembling = enemy.reassembleQueued;
  const isDead = enemy.hp <= 0 && !isReassembling;
  const isActing = state.lastEnemyAction?.uid === enemy.uid;
  const tone = toneFor(enemy.id);
  const def = getEnemyDef(enemy.id);
  const dice = def?.dice ?? [];

  return (
    <div
      className={`alcove ${isActing ? "active" : ""} ${targetable ? "targetable" : ""} ${isDead ? "dead" : ""}`}
      onClick={isDead ? undefined : onClick}
      style={playerFlash ? { filter: "drop-shadow(0 0 8px rgba(154,214,163,0.7))" } : undefined}
    >
      {/* Inspect dice button */}
      {dice.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect();
          }}
          className="btn ghost"
          style={{ fontSize: 9, padding: "2px 6px", marginTop: 2 }}
        >
          🎲 inspect
        </button>
      )}

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
          {enemy.icon} {enemy.name}
        </span>
        <span className="hp">
          {isReassembling ? `⟳${enemy.reassembleCountdown}` : `${enemy.hp}/${enemy.maxHp}`}
        </span>
      </div>

      {/* Status badges */}
      {(enemy.intangible ||
        enemy.statuses.bleed ||
        enemy.statuses.stun ||
        enemy.statuses.warded ||
        enemy.statuses.mark) && (
        <div
          style={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: 10,
          }}
        >
          {enemy.intangible && <span title="Intangible">👻</span>}
          {enemy.statuses.bleed ? (
            <span title={`Bleed ${enemy.statuses.bleed}`}>🩸{enemy.statuses.bleed}</span>
          ) : null}
          {enemy.statuses.stun ? (
            <span title={`Stun ${enemy.statuses.stun}`}>⚡{enemy.statuses.stun}</span>
          ) : null}
          {enemy.statuses.warded ? (
            <span title={`Warded ${enemy.statuses.warded}`}>🛡{enemy.statuses.warded}</span>
          ) : null}
          {enemy.statuses.mark ? <span title="Marked">⚹</span> : null}
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
          return (
            <div
              key={i}
              className="mini"
              style={{ transform: `rotate(${(i - (n - 1) / 2) * 8}deg)` }}
            >
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
                }}
              >
                <div className="band" style={{ background: FACE_COLOR_CSS[face.color] }} />
                <div className="sym">
                  <FaceGlyphs face={face} size="9px" />
                </div>
              </div>
            </div>
          );
        })}
        {/* Legacy intent mini-indicator when no rolled faces */}
        {enemy.rolledFaces.length === 0 && enemy.intent && (
          <div className="mini-die" title={enemy.intent.tooltip ?? ""}>
            <div className="band" style={{ background: "var(--blood)" }} />
            <div className="sym" style={{ fontSize: 9 }}>
              {enemy.intent.icon}
            </div>
          </div>
        )}
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
  onClear,
}: {
  pf: PoolFace;
  state: DiceCombatState;
  selected: boolean;
  busted: boolean;
  onClick: () => void;
  onClear: () => void;
}) {
  const face = getFace(pf.faceId);
  if (!face) return null;
  const assignment = state.assignments[pf.poolId];
  const target = assignment?.targetUid
    ? state.enemies.find((e) => e.uid === assignment.targetUid)
    : null;
  const assigned = !!assignment;

  return (
    <div
      className={`pool-die ${selected ? "selected" : ""} ${assigned ? "assigned" : ""} ${busted ? "busted" : ""}`}
      onClick={onClick}
      title={`${face.label}\n${face.desc}`}
    >
      <div className="band" style={{ background: FACE_COLOR_CSS[pf.color] }} />
      <div className="sym">
        <FaceGlyphs face={face} size="18px" />
      </div>
      {assignment && (
        <div className="target-tag">
          → {target ? target.name : "self"}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--blood)",
              fontSize: 8,
              marginLeft: 2,
            }}
          >
            ✕
          </button>
        </div>
      )}
      {pf.forced && (
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
            {die.icon} {die.name}
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
                    <FaceGlyphs face={face} size="1.1rem" />
                    <span style={{ opacity: 0.7 }}>{face.label}</span>
                    <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>
                      ({color.label}
                      {corruption ? " — corrupted" : ""})
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>{face.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Enemy die inspect dialog ── */

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
            {enemy.icon} {enemy.name}
          </div>
          <button onClick={onClose} className="btn ghost" style={{ fontSize: "0.8rem" }}>
            Close ✕
          </button>
        </div>
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
            <div style={{ fontSize: "0.95rem", marginBottom: "0.4rem" }}>
              {die.icon} {die.name}
              <span style={{ fontSize: "0.7rem", opacity: 0.6, marginLeft: "0.5rem" }}>
                ({die.defaultTarget === "self" ? "self-buff die" : "attacks player"})
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {die.faces.map((faceId, idx) => {
                const face = getFace(faceId);
                if (!face) return null;
                const color = COLORS[face.color];
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.4rem",
                      background: "#0f0a07",
                      border: "1px solid #2a1c10",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        background: FACE_COLOR_CSS[face.color],
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
                          gap: "0.3rem",
                          alignItems: "center",
                        }}
                      >
                        <FaceGlyphs face={face} size="1.1rem" />
                        <span style={{ opacity: 0.7 }}>{face.label}</span>
                        {face.tags?.includes("unblockable") && (
                          <span style={{ color: "var(--blood)", fontSize: "0.7rem" }}>
                            ⛓🛡 unblockable
                          </span>
                        )}
                        {face.tags?.includes("undodgeable") && (
                          <span style={{ color: "var(--blood)", fontSize: "0.7rem" }}>
                            ⛓✷ undodgeable
                          </span>
                        )}
                        {face.tags?.includes("area") && (
                          <span style={{ color: "var(--torch)", fontSize: "0.7rem" }}>⤧ area</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>{face.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
