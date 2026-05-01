import { useEffect, useMemo, useState } from "react";
import { btnStyle, FONT } from "../styles";
import {
  assignFace,
  canAssign,
  clearAssignment,
  commitRoll,
  faceForInstance,
  initDiceCombat,
  rerollDice,
  resolveTurn,
  toggleLock,
} from "./engine";
import { dieDefForInstance } from "./engine";
import type { DiceCombatState, DiceLoadout, DieInstance, DieSlot } from "./types";
import { getFace, SLOT_ORDER } from "./dice-defs";

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

  const [selectedSlot, setSelectedSlot] = useState<DieSlot | null>(null);

  // Fire victory/defeat callbacks once.
  useEffect(() => {
    if (state.phase === "victory") {
      onVictory(state.player.hp, state.player.salt + 5, 5);
    } else if (state.phase === "defeat") {
      onDefeat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const selectedDie = useMemo(
    () => (selectedSlot ? (state.dice.find((d) => d.slot === selectedSlot) ?? null) : null),
    [selectedSlot, state.dice],
  );
  const selectedFace = useMemo(
    () => (selectedDie ? faceForInstance(selectedDie, state) : null),
    [selectedDie, state],
  );

  function handleDieClick(slot: DieSlot) {
    if (state.phase === "rolling") {
      setState((s) => toggleLock(s, slot));
      return;
    }
    if (state.phase === "assigning") {
      setSelectedSlot(slot);
    }
  }

  function handleEnemyClick(enemyUid: string) {
    if (state.phase !== "assigning" || !selectedSlot) return;
    const check = canAssign(state, selectedSlot, enemyUid);
    if (!check.ok) return;
    setState((s) => assignFace(s, selectedSlot, enemyUid));
    setSelectedSlot(null);
  }

  function handleSelfApply() {
    if (state.phase !== "assigning" || !selectedSlot) return;
    const check = canAssign(state, selectedSlot, null);
    if (!check.ok) return;
    setState((s) => assignFace(s, selectedSlot, null));
    setSelectedSlot(null);
  }

  function handleClearAssignment(slot: DieSlot) {
    setState((s) => clearAssignment(s, slot));
    if (selectedSlot === slot) setSelectedSlot(null);
  }

  function handleReroll() {
    setState((s) => rerollDice(s));
  }

  function handleCommit() {
    setState((s) => commitRoll(s));
  }

  function handleResolve() {
    setState((s) => resolveTurn(s));
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
      <EnemyLineup state={state} selectedSlot={selectedSlot} onClick={handleEnemyClick} />
      <PlayerStats state={state} />
      <DiceTray
        state={state}
        selectedSlot={selectedSlot}
        onDieClick={handleDieClick}
        onClearAssignment={handleClearAssignment}
      />
      <ActionBar
        state={state}
        selectedFace={selectedFace}
        onReroll={handleReroll}
        onCommit={handleCommit}
        onResolve={handleResolve}
        onSelfApply={handleSelfApply}
      />
      <CombatLog state={state} />
    </div>
  );
}

/* ── Subcomponents ── */

function Header({ state }: { state: DiceCombatState }) {
  const phaseLabel = {
    rolling: "ROLLING — lock dice and re-roll",
    assigning: "ASSIGNING — pick a target for each face",
    "resolving-player": "Resolving your faces…",
    "resolving-enemies": "Enemies act…",
    victory: "VICTORY",
    defeat: "DEFEAT",
  }[state.phase];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <div style={{ fontSize: "1.4rem", letterSpacing: "0.08em" }}>
        RELIQUARY · TURN {state.turn}
      </div>
      <div style={{ fontSize: "0.95rem", opacity: 0.85 }}>{phaseLabel}</div>
    </div>
  );
}

function EnemyLineup({
  state,
  selectedSlot,
  onClick,
}: {
  state: DiceCombatState;
  selectedSlot: DieSlot | null;
  onClick: (uid: string) => void;
}) {
  const front = state.enemies.filter((e) => e.row === "front" && (e.hp > 0 || e.reassembleQueued));
  const back = state.enemies.filter((e) => e.row === "back" && (e.hp > 0 || e.reassembleQueued));

  const selectedDie = selectedSlot ? state.dice.find((d) => d.slot === selectedSlot) : null;
  const selectedFace = selectedDie ? faceForInstance(selectedDie, state) : null;

  function isTargetable(uid: string): boolean {
    if (!selectedFace) return false;
    const check = canAssign(state, selectedSlot!, uid);
    return check.ok;
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
              enemy={e}
              targetable={isTargetable(e.uid)}
              onClick={() => onClick(e.uid)}
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
              enemy={e}
              targetable={isTargetable(e.uid)}
              onClick={() => onClick(e.uid)}
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
  enemy,
  targetable,
  onClick,
}: {
  enemy: DiceCombatState["enemies"][number];
  targetable: boolean;
  onClick: () => void;
}) {
  const isReassembling = enemy.reassembleQueued;
  const border = targetable ? "2px solid #f1c40f" : "1px solid #3a2a1c";
  const opacity = enemy.untargetable || isReassembling ? 0.5 : 1;
  return (
    <button
      onClick={onClick}
      disabled={!targetable}
      style={{
        background: "linear-gradient(180deg,#2a1f18,#1c1410)",
        border,
        borderRadius: "6px",
        color: "#ece0c8",
        fontFamily: FONT,
        padding: "0.5rem 0.7rem",
        minWidth: "120px",
        cursor: targetable ? "pointer" : "default",
        opacity,
        textAlign: "left",
      }}
    >
      <div style={{ fontSize: "1.7rem" }}>{enemy.icon}</div>
      <div style={{ fontSize: "0.85rem" }}>{enemy.name}</div>
      <div style={{ fontSize: "0.75rem", color: "#c0392b" }}>
        {isReassembling ? "Reassembling…" : `HP ${enemy.hp}/${enemy.maxHp}`}
      </div>
      {enemy.statuses.bleed ? (
        <div style={{ fontSize: "0.7rem", color: "#c0392b" }}>🩸 {enemy.statuses.bleed}</div>
      ) : null}
      {enemy.statuses.stun ? (
        <div style={{ fontSize: "0.7rem", color: "#f1c40f" }}>⚡ {enemy.statuses.stun}</div>
      ) : null}
      {enemy.intent ? (
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
    </button>
  );
}

function PlayerStats({ state }: { state: DiceCombatState }) {
  const p = state.player;
  return (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
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
      <div>🛡️ Block {p.block}</div>
      <div>💎 Salt {p.salt}</div>
      <div>🎲 Re-rolls {p.rerollsLeft}</div>
      {p.powerCharges > 0 ? <div>💪 Power +{p.powerCharges}</div> : null}
      {p.twoHandedActive ? <div>✊ Two-Hand</div> : null}
      {p.dodgeActive ? <div>🌀 Dodge</div> : null}
      {p.rerollDebt > 0 ? (
        <div style={{ color: "#c0392b" }}>📉 -{p.rerollDebt} re-roll next</div>
      ) : null}
    </div>
  );
}

function DiceTray({
  state,
  selectedSlot,
  onDieClick,
  onClearAssignment,
}: {
  state: DiceCombatState;
  selectedSlot: DieSlot | null;
  onDieClick: (slot: DieSlot) => void;
  onClearAssignment: (slot: DieSlot) => void;
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
      {SLOT_ORDER.map((slot) => {
        const die = state.dice.find((d) => d.slot === slot);
        if (!die) return null;
        return (
          <DieView
            key={slot}
            state={state}
            die={die}
            selected={selectedSlot === slot}
            onClick={() => onDieClick(slot)}
            onClearAssignment={() => onClearAssignment(slot)}
          />
        );
      })}
    </div>
  );
}

function DieView({
  state,
  die,
  selected,
  onClick,
  onClearAssignment,
}: {
  state: DiceCombatState;
  die: DieInstance;
  selected: boolean;
  onClick: () => void;
  onClearAssignment: () => void;
}) {
  const def = dieDefForInstance(die, state);
  const face = faceForInstance(die, state);
  const assignment = state.assignments[die.slot];
  const target = assignment?.targetUid
    ? state.enemies.find((e) => e.uid === assignment.targetUid)
    : null;

  let border = "1px solid #3a2a1c";
  if (selected) border = "2px solid #f1c40f";
  else if (die.locked) border = "2px solid #27ae60";
  else if (assignment) border = "2px solid #8e44ad";

  return (
    <div
      style={{
        background: die.suppressed ? "#1a0d0a" : "#1c1410",
        border,
        borderRadius: "6px",
        padding: "0.5rem",
        minWidth: "150px",
        cursor: "pointer",
        opacity: die.suppressed ? 0.4 : 1,
      }}
      onClick={onClick}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.7rem",
          opacity: 0.6,
        }}
      >
        <span>
          {def.icon} {def.name}
        </span>
        {die.locked ? <span style={{ color: "#27ae60" }}>LOCKED</span> : null}
      </div>
      {die.faceIndex < 0 ? (
        <div
          style={{
            minHeight: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.3,
          }}
        >
          (unrolled)
        </div>
      ) : face ? (
        <>
          <div style={{ fontSize: "1.6rem", textAlign: "center" }}>{face.icon}</div>
          <div style={{ fontSize: "0.8rem", textAlign: "center" }}>{face.label}</div>
          <div
            style={{ fontSize: "0.65rem", opacity: 0.7, textAlign: "center", minHeight: "30px" }}
          >
            {face.desc}
          </div>
        </>
      ) : null}
      {assignment ? (
        <div
          style={{
            marginTop: "0.3rem",
            fontSize: "0.7rem",
            color: "#bb88dd",
            textAlign: "center",
          }}
        >
          → {target ? target.name : "self"}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearAssignment();
            }}
            style={{
              ...btnStyle("#3a2a1c"),
              padding: "0.1rem 0.4rem",
              fontSize: "0.6rem",
              marginLeft: "0.3rem",
            }}
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ActionBar({
  state,
  selectedFace,
  onReroll,
  onCommit,
  onResolve,
  onSelfApply,
}: {
  state: DiceCombatState;
  selectedFace: ReturnType<typeof getFace>;
  onReroll: () => void;
  onCommit: () => void;
  onResolve: () => void;
  onSelfApply: () => void;
}) {
  const phase = state.phase;
  const canSelfApply =
    phase === "assigning" &&
    selectedFace !== null &&
    (selectedFace.target === "self" ||
      selectedFace.target === "none" ||
      selectedFace.target === "all-front" ||
      selectedFace.target === "all-enemies");

  return (
    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
      {phase === "rolling" ? (
        <>
          <button
            style={btnStyle("#8b0000", state.player.rerollsLeft <= 0)}
            disabled={state.player.rerollsLeft <= 0}
            onClick={onReroll}
          >
            Re-Roll ({state.player.rerollsLeft} left)
          </button>
          <button style={btnStyle("#27ae60")} onClick={onCommit}>
            Commit Roll →
          </button>
        </>
      ) : null}
      {phase === "assigning" ? (
        <>
          {canSelfApply ? (
            <button style={btnStyle("#27ae60")} onClick={onSelfApply}>
              Apply to Self
            </button>
          ) : null}
          <button
            style={btnStyle("#8b0000", !canResolveNow(state))}
            disabled={!canResolveNow(state)}
            onClick={onResolve}
          >
            Resolve Turn
          </button>
        </>
      ) : null}
    </div>
  );
}

function canResolveNow(state: DiceCombatState): boolean {
  for (const d of state.dice) {
    if (d.suppressed || d.grappled) continue;
    const face = faceForInstance(d, state);
    if (!face) continue;
    if (face.target === "none") continue;
    if (!state.assignments[d.slot]) return false;
  }
  return true;
}

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
