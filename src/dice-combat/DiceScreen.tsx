import { useEffect, useMemo, useState } from "react";
import { btnStyle, FONT } from "../styles";
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
};

function FaceGlyphs({ face, size = "0.95rem" }: { face: FaceDef; size?: string }) {
  const symbols = face.symbols ?? [];
  if (symbols.length === 0) {
    // Legacy / non-symbol face: fall back to its bespoke icon.
    return <span style={{ fontSize: size }}>{face.icon || COLORS[face.color].badge}</span>;
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

  // Clear player-action flash after a short beat.
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

  // v3: bust no longer auto-advances — the player presses "End Turn" so they
  // can read the offending dice in the pool before the turn flushes.

  // v3: stepwise enemy resolution. While in "resolving-enemies" phase, advance
  // one queue entry per beat so the player sees each attack land.
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0d0a08,#1a120c)",
        color: "#ece0c8",
        fontFamily: FONT,
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <Header state={state} />
      <EnemyLineup
        state={state}
        selectedPoolId={selectedPoolId}
        onClick={handleEnemyClick}
        onAttackClick={handleAttackClick}
        onInspect={(uid) => setInspectEnemyUid(uid)}
        playerFlashUid={playerFlashUid}
      />
      <PlayerStats state={state} />
      <PoolView
        state={state}
        selectedPoolId={selectedPoolId}
        onClick={handlePoolFaceClick}
        onClear={handleClearAssignment}
      />
      <DiceTray state={state} onRoll={handleRoll} onLearn={(slot) => setLearnSlot(slot)} />
      <ActionBar
        state={state}
        selectedFace={selectedFace}
        onStop={handleStop}
        onResolve={handleResolve}
        onSelfApply={handleSelfApply}
      />
      <CombatLog state={state} />
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

/* ── Header ── */

function Header({ state }: { state: DiceCombatState }) {
  const phaseLabel: Record<DiceCombatState["phase"], string> = {
    rolling: "ROLLING — push your luck",
    busted: "BUST — enemies act",
    assigning: "ASSIGN — pick a target for each face",
    "resolving-player": "Resolving your faces…",
    "resolving-enemies": "Enemies act…",
    victory: "VICTORY",
    defeat: "DEFEAT",
  };
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <div style={{ fontSize: "1.4rem", letterSpacing: "0.08em" }}>
        PALE VAULT · TURN {state.turn}
      </div>
      <div style={{ fontSize: "0.95rem", opacity: 0.85 }}>{phaseLabel[state.phase]}</div>
    </div>
  );
}

/* ── Enemy lineup ── */

function EnemyLineup({
  state,
  selectedPoolId,
  onClick,
  onAttackClick,
  onInspect,
  playerFlashUid,
}: {
  state: DiceCombatState;
  selectedPoolId: number | null;
  onClick: (uid: string) => void;
  onAttackClick: (uid: string, faceIndex: number) => void;
  onInspect: (uid: string) => void;
  playerFlashUid: string | null;
}) {
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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      <div style={rowStyle()}>
        <RowLabel text="BACK" />
        {back.length === 0 ? (
          <Empty />
        ) : (
          back.map((e) => (
            <EnemyCard
              key={e.uid}
              state={state}
              enemy={e}
              targetable={isTargetable(e.uid)}
              onClick={() => onClick(e.uid)}
              isAttackTargetable={(idx) => isAttackTargetable(e.uid, idx)}
              onAttackClick={(idx) => onAttackClick(e.uid, idx)}
              onInspect={() => onInspect(e.uid)}
              playerFlash={playerFlashUid === e.uid}
            />
          ))
        )}
      </div>
      <div style={rowStyle()}>
        <RowLabel text="FRONT" />
        {front.length === 0 ? (
          <Empty />
        ) : (
          front.map((e) => (
            <EnemyCard
              key={e.uid}
              state={state}
              enemy={e}
              targetable={isTargetable(e.uid)}
              onClick={() => onClick(e.uid)}
              isAttackTargetable={(idx) => isAttackTargetable(e.uid, idx)}
              onAttackClick={(idx) => onAttackClick(e.uid, idx)}
              onInspect={() => onInspect(e.uid)}
              playerFlash={playerFlashUid === e.uid}
            />
          ))
        )}
      </div>
    </div>
  );
}

function rowStyle() {
  return {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    minHeight: "120px",
  } as const;
}

function RowLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        width: "60px",
        fontSize: "0.7rem",
        letterSpacing: "0.15em",
        opacity: 0.5,
        textAlign: "right",
        paddingRight: "0.5rem",
      }}
    >
      {text}
    </div>
  );
}

function Empty() {
  return <div style={{ opacity: 0.3, fontStyle: "italic" }}>(empty)</div>;
}

function EnemyCard({
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
  const isActing = state.lastEnemyAction?.uid === enemy.uid;
  const border = playerFlash
    ? "2px solid #9ad6a3"
    : isActing
      ? "2px solid #c0392b"
      : targetable
        ? "2px solid #f1c40f"
        : "1px solid #3a2a1c";
  const opacity = enemy.untargetable || isReassembling ? 0.5 : 1;
  const boxShadow = playerFlash
    ? "0 0 12px 2px rgba(154,214,163,0.6)"
    : isActing
      ? "0 0 12px 2px rgba(192,57,43,0.6)"
      : undefined;
  const def = getEnemyDef(enemy.id);
  const dice = def?.dice ?? [];
  return (
    <div
      style={{
        background: "linear-gradient(180deg,#2a1f18,#1c1410)",
        border,
        borderRadius: "6px",
        color: "#ece0c8",
        fontFamily: FONT,
        padding: "0.5rem 0.7rem",
        minWidth: "140px",
        opacity,
        textAlign: "left",
        boxShadow,
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
      }}
    >
      <button
        onClick={onClick}
        disabled={!targetable}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          font: "inherit",
          padding: 0,
          width: "100%",
          textAlign: "left",
          cursor: targetable ? "pointer" : "default",
        }}
      >
        <div style={{ fontSize: "1.7rem" }}>{enemy.icon}</div>
        <div style={{ fontSize: "0.85rem" }}>{enemy.name}</div>
        <div style={{ fontSize: "0.75rem", color: "#c0392b" }}>
          {isReassembling
            ? `Rises in ${enemy.reassembleCountdown}…`
            : `HP ${enemy.hp}/${enemy.maxHp}`}
        </div>
        {enemy.intangible ? (
          <div style={{ fontSize: "0.7rem", color: "#7B3FA0" }}>👻 intangible</div>
        ) : null}
        {enemy.statuses.bleed ? (
          <div style={{ fontSize: "0.7rem", color: "#c0392b" }}>🩸 {enemy.statuses.bleed}</div>
        ) : null}
        {enemy.statuses.stun ? (
          <div style={{ fontSize: "0.7rem", color: "#f1c40f" }}>⚡ {enemy.statuses.stun}</div>
        ) : null}
        {enemy.statuses.warded ? (
          <div style={{ fontSize: "0.7rem", color: "#bcbcbc" }}>🛡 {enemy.statuses.warded}</div>
        ) : null}
        {enemy.statuses.mark ? (
          <div style={{ fontSize: "0.7rem", color: "#E8821F" }}>⚹ marked</div>
        ) : null}
      </button>
      {enemy.rolledFaces.length > 0 ? (
        <div
          style={{
            marginTop: "0.3rem",
            fontSize: "0.7rem",
            opacity: 0.95,
            borderTop: "1px solid #3a2a1c",
            paddingTop: "0.3rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.15rem",
          }}
        >
          {enemy.rolledFaces.map((rf, idx) => {
            const face = getFace(rf.faceId);
            if (!face) return null;
            const canDefend = isAttackTargetable(idx);
            const mit = state.attackMitigations[`${enemy.uid}:${idx}`];
            const mitigated = mit && (mit.block > 0 || mit.dodge || mit.riposteDamage > 0);
            const cancelled = mitigated && mit.dodge;
            return (
              <button
                key={idx}
                title={face.desc}
                disabled={!canDefend}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canDefend) onAttackClick(idx);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  background: canDefend ? "rgba(241,196,15,0.12)" : "transparent",
                  border: canDefend
                    ? "1px solid #f1c40f"
                    : mitigated
                      ? "1px dashed #3FA3D6"
                      : "1px solid transparent",
                  borderRadius: "3px",
                  color: "inherit",
                  font: "inherit",
                  padding: "0.05rem 0.2rem",
                  cursor: canDefend ? "pointer" : "default",
                  textDecoration: cancelled ? "line-through" : undefined,
                  opacity: cancelled ? 0.5 : 1,
                }}
              >
                <FaceGlyphs face={face} size="0.85rem" />
                <span style={{ opacity: 0.55 }}>{face.label}</span>
                {face.tags?.includes("unblockable") ? <span title="unblockable">⛓🛡</span> : null}
                {face.tags?.includes("area") ? <span title="area">⤧</span> : null}
                {mit?.block ? <span style={{ color: "#3FA3D6" }}>🛡{mit.block}</span> : null}
                {mit?.riposteDamage ? (
                  <span style={{ color: "#c0392b" }}>⤺{mit.riposteDamage}</span>
                ) : null}
                {mit?.dodge ? <span style={{ color: "#3FA3D6" }}>✷</span> : null}
              </button>
            );
          })}
        </div>
      ) : enemy.intent ? (
        <div
          style={{
            marginTop: "0.3rem",
            fontSize: "0.7rem",
            opacity: 0.85,
            borderTop: "1px solid #3a2a1c",
            paddingTop: "0.3rem",
          }}
          title={enemy.intent.tooltip}
        >
          {enemy.intent.icon} {enemy.intent.label}
          {enemy.intent.damage !== undefined ? ` · ${enemy.intent.damage}` : ""}
        </div>
      ) : null}
      {dice.length > 0 ? (
        <button
          onClick={onInspect}
          style={{
            marginTop: "0.3rem",
            background: "transparent",
            border: "1px solid #3a2a1c",
            borderRadius: "4px",
            color: "#9aa9b6",
            font: "inherit",
            fontSize: "0.7rem",
            padding: "0.15rem 0.4rem",
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          🎲 inspect dice
        </button>
      ) : null}
    </div>
  );
}

/* ── Player stats ── */

function PlayerStats({ state }: { state: DiceCombatState }) {
  const p = state.player;
  return (
    <div
      style={{
        display: "flex",
        gap: "1.25rem",
        padding: "0.6rem 0.8rem",
        border: "1px solid #3a2a1c",
        background: "#150f0a",
        borderRadius: "6px",
        fontSize: "0.9rem",
        flexWrap: "wrap",
      }}
    >
      <div>
        ❤️ HP {p.hp}/{p.maxHp}
      </div>
      <div>💎 Salt {p.salt}</div>
      {p.powerCharges > 0 ? <div>💪 Power +{p.powerCharges}</div> : null}
      {p.twoHandedActive ? <div>⚔️ Edge +1</div> : null}
      {p.dodgeActive ? <div>🌀 Dodge</div> : null}
      {p.hymnHumActive ? <div style={{ color: "#3FA3D6" }}>🎵 Hymn-Hum</div> : null}
      {p.resonanceCharges > 0 ? <div style={{ color: "#E8821F" }}>✦ Resonance</div> : null}
      {p.slotLocks.length > 0 ? (
        <div style={{ color: "#c0392b" }}>🔒 Locked: {p.slotLocks.join(", ")}</div>
      ) : null}
    </div>
  );
}

/* ── Pool view ── */

function PoolView({
  state,
  selectedPoolId,
  onClick,
  onClear,
}: {
  state: DiceCombatState;
  selectedPoolId: number | null;
  onClick: (poolId: number) => void;
  onClear: (poolId: number) => void;
}) {
  const busted = state.phase === "busted";
  return (
    <div
      style={{
        padding: "0.7rem",
        border: busted ? "2px solid #C0303A" : "1px solid #3a2a1c",
        background: busted ? "#2a0c0c" : "#0f0a07",
        borderRadius: "6px",
        minHeight: "100px",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          opacity: 0.6,
          marginBottom: "0.4rem",
        }}
      >
        POOL · {state.pool.length} face{state.pool.length === 1 ? "" : "s"}
        {busted ? " · BUST" : null}
      </div>
      {state.pool.length === 0 ? (
        <div style={{ opacity: 0.3, fontStyle: "italic" }}>(roll a die to push)</div>
      ) : (
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {state.pool.map((pf) => (
            <PoolFaceCard
              key={pf.poolId}
              pf={pf}
              state={state}
              selected={selectedPoolId === pf.poolId}
              onClick={() => onClick(pf.poolId)}
              onClear={() => onClear(pf.poolId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PoolFaceCard({
  pf,
  state,
  selected,
  onClick,
  onClear,
}: {
  pf: PoolFace;
  state: DiceCombatState;
  selected: boolean;
  onClick: () => void;
  onClear: () => void;
}) {
  const face = getFace(pf.faceId);
  if (!face) return null;
  const color = COLORS[pf.color];
  const assignment = state.assignments[pf.poolId];
  const target = assignment?.targetUid
    ? state.enemies.find((e) => e.uid === assignment.targetUid)
    : null;
  const border = selected
    ? "2px solid #f1c40f"
    : assignment
      ? "2px solid #8e44ad"
      : "1px solid #3a2a1c";
  return (
    <div
      onClick={onClick}
      title={`${face.label} (${color.label})\n${face.desc}`}
      style={{
        cursor: state.phase === "assigning" ? "pointer" : "default",
        background: "#1c1410",
        border,
        borderRadius: "6px",
        padding: "0.4rem",
        minWidth: "120px",
        position: "relative",
      }}
    >
      <div
        style={{
          height: "8px",
          background: color.hex,
          borderRadius: "3px",
          marginBottom: "0.3rem",
        }}
      />
      <div style={{ fontSize: "1.4rem", textAlign: "center" }}>
        <span style={{ fontSize: "0.9rem", marginRight: "0.2rem", opacity: 0.7 }}>
          {color.badge}
        </span>
        <FaceGlyphs face={face} size="1.3rem" />
      </div>
      <div style={{ fontSize: "0.65rem", textAlign: "center", opacity: 0.7 }}>{face.label}</div>
      <div style={{ fontSize: "0.62rem", opacity: 0.6, textAlign: "center" }}>
        {pf.slot} · {color.label}
      </div>
      {assignment ? (
        <div
          style={{
            marginTop: "0.3rem",
            fontSize: "0.65rem",
            color: "#bb88dd",
            textAlign: "center",
          }}
        >
          → {target ? target.name : "self"}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            style={{
              ...btnStyle("#3a2a1c"),
              padding: "0.05rem 0.3rem",
              fontSize: "0.55rem",
              marginLeft: "0.3rem",
            }}
          >
            ✕
          </button>
        </div>
      ) : null}
      {pf.forced ? (
        <div style={{ fontSize: "0.6rem", color: "#c0392b", textAlign: "center" }}>FORCED</div>
      ) : null}
    </div>
  );
}

/* ── Dice tray ── */

function DiceTray({
  state,
  onRoll,
  onLearn,
}: {
  state: DiceCombatState;
  onRoll: (slot: DieSlot) => void;
  onLearn: (slot: DieSlot) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.6rem",
        padding: "0.7rem",
        border: "1px solid #3a2a1c",
        background: "#0f0a07",
        borderRadius: "6px",
      }}
    >
      {SLOT_ORDER.map((slot) => (
        <DieView
          key={slot}
          state={state}
          slot={slot}
          onRoll={() => onRoll(slot)}
          onLearn={() => onLearn(slot)}
        />
      ))}
    </div>
  );
}

function wouldBust(state: DiceCombatState, colorId: FaceColor, isSilent: boolean): boolean {
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

function DieView({
  state,
  slot,
  onRoll,
  onLearn,
}: {
  state: DiceCombatState;
  slot: DieSlot;
  onRoll: () => void;
  onLearn: () => void;
}) {
  const die = dieForSlot(slot, state);
  const locked = state.player.slotLocks.includes(slot);
  const canRoll = state.phase === "rolling" && !locked;
  const corruptions = state.player.corruptedFaces.filter((c) => c.slot === slot);
  const hasBustRisk =
    canRoll &&
    die.faces.some((faceId) => {
      const face = getFace(faceId);
      if (!face) return false;
      const corruption = corruptions.find((c) => c.faceIndex === die.faces.indexOf(faceId));
      const colorId: FaceColor = corruption ? corruption.recoloredTo : face.color;
      return wouldBust(state, colorId, face.tags?.includes("silent") ?? false);
    });
  const border = locked
    ? "2px solid #c0392b"
    : hasBustRisk
      ? "2px solid #E8821F"
      : canRoll
        ? "2px solid #27ae60"
        : "1px solid #3a2a1c";
  return (
    <div
      onClick={canRoll ? onRoll : undefined}
      style={{
        background: locked ? "#2a0c0c" : "#1c1410",
        border,
        borderRadius: "6px",
        padding: "0.5rem",
        minWidth: "150px",
        cursor: canRoll ? "pointer" : "default",
        opacity: locked ? 0.6 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.7rem",
          opacity: 0.7,
        }}
      >
        <span>
          {die.icon} {die.name}
        </span>
        {locked ? <span style={{ color: "#c0392b" }}>LOCKED</span> : null}
      </div>
      <div style={{ marginTop: "0.3rem", display: "flex", flexDirection: "column", gap: "2px" }}>
        {die.faces.map((faceId, idx) => {
          const face = getFace(faceId);
          if (!face) return null;
          const corruption = corruptions.find((c) => c.faceIndex === idx);
          const colorId: FaceColor = corruption ? corruption.recoloredTo : face.color;
          const color = COLORS[colorId];
          const isSilent = face.tags?.includes("silent") ?? false;
          const bust = canRoll && wouldBust(state, colorId, isSilent);
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.65rem",
                opacity: 0.85,
              }}
            >
              <span
                style={{
                  width: "0.8rem",
                  flexShrink: 0,
                  textAlign: "center",
                  lineHeight: 1,
                  fontSize: "0.8rem",
                  color: "#ff6b00",
                }}
                title={bust ? "Would bust!" : undefined}
              >
                {bust ? "⚠" : ""}
              </span>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  background: color.hex,
                  borderRadius: "2px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: corruption ? "1px solid #f1c40f" : "none",
                  flexShrink: 0,
                  fontSize: "0.5rem",
                  lineHeight: 1,
                  color: "#000",
                  fontWeight: "bold",
                }}
              >
                {color.badge}
              </span>
              <span style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <FaceGlyphs face={face} size="0.85rem" />
                <span style={{ opacity: 0.6 }}>{face.label}</span>
              </span>
            </div>
          );
        })}
      </div>
      {canRoll ? (
        <div
          style={{
            marginTop: "0.4rem",
            fontSize: "0.65rem",
            color: "#9ad6a3",
            textAlign: "center",
          }}
        >
          Click to push →
        </div>
      ) : null}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLearn();
        }}
        style={{
          ...btnStyle("#3a2a1c"),
          marginTop: "0.4rem",
          padding: "0.25rem 0.4rem",
          fontSize: "0.65rem",
          width: "100%",
        }}
      >
        Learn more
      </button>
    </div>
  );
}

/* ── Action bar ── */

function ActionBar({
  state,
  selectedFace,
  onStop,
  onResolve,
  onSelfApply,
}: {
  state: DiceCombatState;
  selectedFace: ReturnType<typeof getFace>;
  onStop: () => void;
  onResolve: () => void;
  onSelfApply: () => void;
}) {
  const phase = state.phase;
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
    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
      {phase === "rolling" ? (
        <button
          style={btnStyle("#27ae60", state.pool.length === 0)}
          disabled={state.pool.length === 0}
          onClick={onStop}
        >
          STOP — Assign Pool ({state.pool.length})
        </button>
      ) : null}
      {phase === "assigning" ? (
        <>
          {canSelfApply ? (
            <button style={btnStyle("#27ae60")} onClick={onSelfApply}>
              Apply to Self
            </button>
          ) : null}
          <button
            style={btnStyle("#8b0000", !allAssigned(state))}
            disabled={!allAssigned(state)}
            onClick={onResolve}
          >
            End Turn
          </button>
        </>
      ) : null}
      {phase === "busted" ? (
        <button style={btnStyle("#8b0000")} onClick={onResolve}>
          End Turn — Bust
        </button>
      ) : null}
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
          border: "1px solid #3a2a1c",
          borderRadius: "8px",
          padding: "1.2rem",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          color: "#ece0c8",
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
          <div style={{ fontSize: "1.2rem" }}>
            {die.icon} {die.name}
          </div>
          <button onClick={onClose} style={{ ...btnStyle("#3a2a1c"), fontSize: "0.8rem" }}>
            Close ✕
          </button>
        </div>
        <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.8rem" }}>
          Each face has a color. Two same colors in your pool = bust.
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
                  border: corruption ? "1px solid #f1c40f" : "1px solid #2a1c10",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    background: color.hex,
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
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

/* ── Combat log ── */

function CombatLog({ state }: { state: DiceCombatState }) {
  const recent = state.log.slice(-12);
  return (
    <div
      style={{
        marginTop: "auto",
        padding: "0.5rem 0.7rem",
        border: "1px solid #3a2a1c",
        background: "#0a0705",
        borderRadius: "6px",
        fontSize: "0.78rem",
        lineHeight: 1.4,
        maxHeight: "180px",
        overflowY: "auto",
      }}
    >
      {recent.map((entry, i) => (
        <div
          key={i}
          style={{
            color:
              entry.source === "player"
                ? "#9ad6a3"
                : entry.source === "enemy"
                  ? "#d68a9a"
                  : "#a89878",
          }}
        >
          [T{entry.turn}] {entry.text}
        </div>
      ))}
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
          border: "1px solid #3a2a1c",
          borderRadius: "8px",
          padding: "1.2rem",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          color: "#ece0c8",
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
          <div style={{ fontSize: "1.2rem" }}>
            {enemy.icon} {enemy.name}
          </div>
          <button onClick={onClose} style={{ ...btnStyle("#3a2a1c"), fontSize: "0.8rem" }}>
            Close ✕
          </button>
        </div>
        <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.8rem" }}>
          The enemy rolls one face per die each turn. You see the rolled face above the enemy before
          you push your own luck.
        </div>
        {dice.length === 0 ? (
          <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
            No dice — this enemy uses a fixed action.
          </div>
        ) : null}
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
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        background: color.hex,
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#000",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
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
                        {face.tags?.includes("unblockable") ? (
                          <span
                            title="unblockable"
                            style={{ color: "#c0392b", fontSize: "0.7rem" }}
                          >
                            ⛓🛡 unblockable
                          </span>
                        ) : null}
                        {face.tags?.includes("undodgeable") ? (
                          <span
                            title="undodgeable"
                            style={{ color: "#c0392b", fontSize: "0.7rem" }}
                          >
                            ⛓✷ undodgeable
                          </span>
                        ) : null}
                        {face.tags?.includes("area") ? (
                          <span title="area" style={{ color: "#E8821F", fontSize: "0.7rem" }}>
                            ⤧ area
                          </span>
                        ) : null}
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
