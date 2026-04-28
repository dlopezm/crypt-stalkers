/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat Screen
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useCallback, useEffect } from "react";
import type { LineCombatState, LineEncounterDef } from "./types";
import {
  initLineCombat,
  applyPlayerAction,
  getPlayerAbilities,
  isVictory,
  isDefeat,
  isPlayerTurn,
} from "./engine/index";
import { resolveSlotsForAbility } from "./engine/execute-player";
import { LINE_ENEMY_DEFS } from "./enemy-defs";
import type { LineAbility } from "./types";
import { getTarotSrc } from "../data/tarot";
import { describeAbility } from "./describe";

// ─── Props ───

interface LineScreenProps {
  encounter: LineEncounterDef;
  playerData: {
    hp: number;
    maxHp: number;
    salt: number;
    mainWeaponId: string;
    offhandId: string | null;
    armorId: string;
    armor: number;
  };
  onVictory: (saltEarned: number) => void;
  onDefeat: () => void;
}

// ─── Terrain visuals ───

function terrainIcon(type: string): string {
  switch (type) {
    case "empty":
      return "";
    case "pit":
      return "⬇️";
    case "rubble":
      return "🪨";
    case "hallowed_ground":
      return "✝️";
    case "smoke":
      return "💨";
    case "hazard":
      return "⚠️";
    case "salt_deposit":
      return "🧂";
    case "rot":
      return "☣️";
    case "dark_zone":
      return "🌑";
    case "wall_pillar":
      return "🏛️";
    default:
      return "";
  }
}

function terrainBg(type: string): string {
  switch (type) {
    case "hallowed_ground":
      return "rgba(255,255,180,0.18)";
    case "dark_zone":
      return "rgba(10,0,30,0.7)";
    case "rot":
      return "rgba(20,60,0,0.4)";
    case "hazard":
      return "rgba(180,60,0,0.25)";
    case "smoke":
      return "rgba(200,200,200,0.25)";
    case "pit":
      return "rgba(0,0,0,0.85)";
    case "wall_pillar":
      return "rgba(80,80,80,0.9)";
    default:
      return "transparent";
  }
}

// ─── Constants ───

const SLOT_WIDTH = 200;
const SLOT_HEIGHT = 280;

// ─── Slot ───

interface SlotProps {
  index: number;
  state: LineCombatState;
  previewSlots: Set<number>;
  enemyHoverTargets: Set<number>;
  hoveredEnemyUid: string | null;
  isMoveTarget: boolean;
  onSlotClick: (slot: number) => void;
  onSlotHover: (slot: number | null) => void;
  onEnemyHover: (uid: string | null) => void;
}

function Slot({
  index,
  state,
  previewSlots,
  enemyHoverTargets,
  hoveredEnemyUid,
  isMoveTarget,
  onSlotClick,
  onSlotHover,
  onEnemyHover,
}: SlotProps) {
  const terrain = state.slots[index];
  const isPlayer = state.player.position === index;
  const enemy = state.enemies.find(
    (e) => e.position === index && (e.hp > 0 || e.countdownTimer !== null),
  );
  const corpse = state.corpses.find((c) => c.position === index);

  // Telegraphs owned by THIS enemy (shown attached to them)
  const ownTelegraphs = enemy ? state.telegraphs.filter((t) => t.ownerUid === enemy.uid) : [];

  // A movement telegraph (any enemy) ending at this slot → show footstep
  const incomingMoveTelegraph = state.telegraphs.find(
    (t) => t.selfRepositionSlot === index && t !== undefined,
  );

  // Highlight when this slot is targeted by the hovered enemy
  const isEnemyTarget = enemyHoverTargets.has(index);
  const isPreview = previewSlots.has(index);
  const isHoveredEnemy = enemy?.uid === hoveredEnemyUid;

  const def = enemy ? LINE_ENEMY_DEFS[enemy.id] : null;
  const tarotSrc = enemy ? getTarotSrc(enemy.id) : null;
  const corpseDef = corpse ? LINE_ENEMY_DEFS[corpse.enemyId] : null;
  const corpseTarot = corpse ? getTarotSrc(corpse.enemyId) : null;

  const hpPct = enemy ? enemy.hp / enemy.maxHp : 0;
  const hpColor = hpPct > 0.5 ? "#3ddc84" : hpPct > 0.25 ? "#f0c040" : "#c41c1c";

  const borderColor = isMoveTarget
    ? "#4af"
    : isPreview
      ? "#4af"
      : isEnemyTarget
        ? "#e44"
        : isHoveredEnemy
          ? "#fff"
          : incomingMoveTelegraph
            ? "#fa0"
            : isPlayer
              ? "#4f4"
              : enemy
                ? enemy.passives.some((p) => p.type === "incorporeal_resistance")
                  ? "#a8e"
                  : "#a44"
                : "#2a2a2a";

  const slotStyle: React.CSSProperties = {
    position: "relative",
    width: SLOT_WIDTH,
    height: SLOT_HEIGHT,
    border: "2px solid",
    borderColor,
    borderRadius: 8,
    background: terrainBg(terrain.type),
    cursor: isPlayerTurn(state) && (isPlayer || enemy || !corpse) ? "pointer" : "default",
    transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
    flexShrink: 0,
    overflow: "hidden",
    boxShadow: isEnemyTarget ? "inset 0 0 30px rgba(255,80,80,0.35)" : "none",
  };

  return (
    <div
      style={slotStyle}
      onClick={() => onSlotClick(index)}
      onMouseEnter={() => {
        onSlotHover(index);
        if (enemy) onEnemyHover(enemy.uid);
      }}
      onMouseLeave={() => {
        onSlotHover(null);
        if (enemy) onEnemyHover(null);
      }}
    >
      {/* Slot index */}
      <span
        style={{
          position: "absolute",
          top: 4,
          left: 6,
          fontSize: 11,
          color: "#555",
          fontFamily: "monospace",
        }}
      >
        {index}
      </span>

      {/* Terrain icon */}
      {terrain.type !== "empty" && (
        <span style={{ position: "absolute", top: 4, right: 6, fontSize: 18 }}>
          {terrainIcon(terrain.type)}
        </span>
      )}

      {/* Targeted-by-hovered-enemy red overlay */}
      {isEnemyTarget && !enemy && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,60,60,0.18)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Footstep on enemy movement destination */}
      {incomingMoveTelegraph && !enemy && !isPlayer && !isMoveTarget && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            opacity: 0.55,
            pointerEvents: "none",
          }}
        >
          👣
        </div>
      )}

      {/* Player move target — blue tint + footstep */}
      {isMoveTarget && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(80,160,255,0.18)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              color: "#4af",
              opacity: 0.85,
              pointerEvents: "none",
            }}
          >
            👣
          </div>
        </>
      )}

      {/* Player */}
      {isPlayer && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: "30px 10px 10px",
          }}
        >
          <div
            style={{
              width: 110,
              height: 150,
              border: "2px solid #4f4",
              borderRadius: 6,
              background: "rgba(20,80,20,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
              boxShadow: "0 0 12px rgba(80,255,80,0.3)",
            }}
          >
            🧑
          </div>
          <div style={{ fontSize: 13, color: "#cfc", fontWeight: "bold" }}>You</div>
          <div
            style={{
              width: "85%",
              height: 8,
              background: "#222",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid #444",
            }}
          >
            <div
              style={{
                width: `${(state.player.hp / state.player.maxHp) * 100}%`,
                height: "100%",
                background:
                  state.player.hp > state.player.maxHp * 0.5
                    ? "#3ddc84"
                    : state.player.hp > state.player.maxHp * 0.25
                      ? "#f0c040"
                      : "#c41c1c",
                transition: "width 0.3s",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "#8f8" }}>
            {state.player.hp} / {state.player.maxHp}
          </div>
          {Object.entries(state.player.conditions).filter(([, v]) => (v ?? 0) > 0).length > 0 && (
            <div style={{ fontSize: 10, color: "#fa0", textAlign: "center" }}>
              {Object.entries(state.player.conditions)
                .filter(([, v]) => (v ?? 0) > 0)
                .map(([k, v]) => `${k} ${v}`)
                .join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Enemy */}
      {enemy && def && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "26px 8px 6px",
          }}
        >
          {tarotSrc ? (
            <div
              style={{
                width: 110,
                height: 150,
                border: `2px solid ${enemy.passives.some((p) => p.type === "incorporeal_resistance") ? "#a8e" : def.isBoss ? "#f0c040" : "#8a6010"}`,
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: def.isBoss
                  ? "0 0 10px rgba(240,192,64,0.5)"
                  : "0 0 6px rgba(138,96,16,0.3)",
              }}
            >
              <img
                src={tarotSrc}
                alt={def.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 20%",
                  opacity: enemy.mistFormTurns > 0 ? 0.4 : 1,
                }}
                draggable={false}
              />
            </div>
          ) : (
            <div
              style={{
                width: 110,
                height: 150,
                border: "2px solid #c41c1c",
                borderRadius: 6,
                background: "rgba(196,28,28,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 60,
              }}
            >
              {def.ascii}
            </div>
          )}
          <div
            style={{
              fontSize: 12,
              color: "#fcc",
              fontWeight: "bold",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            {def.name}
          </div>
          {/* HP bar (or countdown) */}
          {enemy.countdownTimer !== null ? (
            <div style={{ fontSize: 12, color: "#aaa" }}>⏳ {enemy.countdownTimer}t</div>
          ) : (
            <>
              <div
                style={{
                  width: "85%",
                  height: 6,
                  background: "#222",
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid #444",
                }}
              >
                <div
                  style={{
                    width: `${hpPct * 100}%`,
                    height: "100%",
                    background: hpColor,
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: "#aaa" }}>
                {enemy.hp}/{enemy.maxHp}
                {enemy.armor > 0 && (
                  <span style={{ color: "#88f", marginLeft: 4 }}>🛡️{enemy.armor}</span>
                )}
              </div>
            </>
          )}
          {/* Conditions */}
          {Object.entries(enemy.conditions).filter(([, v]) => (v ?? 0) > 0).length > 0 && (
            <div style={{ fontSize: 9, color: "#fa0", textAlign: "center" }}>
              {Object.entries(enemy.conditions)
                .filter(([, v]) => (v ?? 0) > 0)
                .map(([k, v]) => `${k.slice(0, 3)} ${v}`)
                .join(" ")}
            </div>
          )}
        </div>
      )}

      {/* Corpse */}
      {corpse && !enemy && !isPlayer && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "30px 8px 6px",
            opacity: 0.4,
          }}
        >
          {corpseTarot ? (
            <div
              style={{
                width: 100,
                height: 140,
                border: "2px solid #555",
                borderRadius: 6,
                overflow: "hidden",
                filter: "grayscale(1)",
              }}
            >
              <img
                src={corpseTarot}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 20%",
                }}
                draggable={false}
              />
            </div>
          ) : (
            <div style={{ fontSize: 50 }}>💀</div>
          )}
          <div style={{ fontSize: 11, color: "#888" }}>{corpseDef?.name ?? "Corpse"}</div>
          <div style={{ fontSize: 10, color: "#cc8" }}>🧂 {corpse.salt}</div>
        </div>
      )}

      {/* Enemy's own telegraph banner — what they're about to do */}
      {enemy && ownTelegraphs.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background:
              ownTelegraphs[0].abilityId === "move" || ownTelegraphs[0].abilityId === "retreat"
                ? "rgba(180,120,20,0.9)"
                : "rgba(160,30,30,0.92)",
            color: "#fff",
            fontSize: 11,
            padding: "4px 6px",
            textAlign: "center",
            fontFamily: "monospace",
            lineHeight: 1.25,
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {ownTelegraphs.map((t, i) => (
            <div key={i}>
              {t.icon} {t.label}
              {t.damage > 0 ? ` (${t.damage})` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main screen ───

export function LineScreen({ encounter, playerData, onVictory, onDefeat }: LineScreenProps) {
  const [state, setState] = useState<LineCombatState>(() => initLineCombat(encounter, playerData));
  const [selectedAbility, setSelectedAbility] = useState<LineAbility | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [hoveredEnemyUid, setHoveredEnemyUid] = useState<string | null>(null);
  const log = state.log.slice(-30);

  // Handle victory/defeat
  useEffect(() => {
    if (isVictory(state)) {
      const totalSalt = state.corpses.reduce((s, c) => s + c.salt, 0);
      onVictory(totalSalt);
    } else if (isDefeat(state)) {
      onDefeat();
    }
  }, [state, onVictory, onDefeat]);

  // Is the hovered slot a valid move target for the player right now?
  const canMoveTo = (slot: number): boolean => {
    if (!isPlayerTurn(state)) return false;
    if (selectedAbility) return false;
    if (slot === state.player.position) return false;
    if (slot < 0 || slot >= state.lineLength) return false;
    if ((state.player.conditions.immobilized ?? 0) > 0) return false;
    if ((state.player.conditions.stunned ?? 0) > 0) return false;

    // Walk every step from current → target; reject if any intermediate slot
    // is impassable terrain OR occupied by an entity.
    const dir = slot > state.player.position ? 1 : -1;
    const distance = Math.abs(slot - state.player.position);
    let cost = distance;
    for (let s = state.player.position + dir; s !== slot + dir; s += dir) {
      const t = state.slots[s];
      if (t.type === "wall_pillar") return false;
      const occupant = state.enemies.some(
        (e) => e.position === s && (e.hp > 0 || e.countdownTimer !== null),
      );
      if (occupant) return false;
      if (t.type === "rubble") cost += 1;
    }
    return state.player.ap >= cost;
  };

  // Slots affected by the hovered enemy's telegraphs
  const enemyHoverTargets = (() => {
    if (!hoveredEnemyUid) return new Set<number>();
    const ts = state.telegraphs.filter((t) => t.ownerUid === hoveredEnemyUid);
    const slots = new Set<number>();
    for (const t of ts) {
      for (const s of t.affectedSlots) slots.add(s);
      if (t.selfRepositionSlot !== null) slots.add(t.selfRepositionSlot);
    }
    return slots;
  })();

  // Compute preview slots when an ability is selected and a slot is hovered
  const previewSlots = (() => {
    if (!selectedAbility || hoveredSlot === null) return new Set<number>();
    const dir: 1 | -1 = hoveredSlot >= state.player.position ? 1 : -1;
    try {
      return new Set(
        resolveSlotsForAbility(
          selectedAbility,
          state.player.position,
          hoveredSlot,
          dir,
          state.lineLength,
        ),
      );
    } catch {
      return new Set<number>();
    }
  })();

  const handleAbilityClick = useCallback(
    (ability: LineAbility) => {
      if (!isPlayerTurn(state)) return;
      if (selectedAbility?.id === ability.id) {
        setSelectedAbility(null);
        return;
      }
      setSelectedAbility(ability);
    },
    [state, selectedAbility],
  );

  const handleSlotClick = useCallback(
    (slot: number) => {
      if (!isPlayerTurn(state)) return;

      if (selectedAbility) {
        // Direction inferred from target slot vs player
        const dir: 1 | -1 =
          slot < state.player.position ? -1 : slot > state.player.position ? 1 : 1;
        const newState = applyPlayerAction(state, {
          type: "use_ability",
          abilityId: selectedAbility.id,
          targetSlot: slot,
          direction: dir,
        });
        setState(newState);
        setSelectedAbility(null);
      } else if (slot !== state.player.position) {
        const newState = applyPlayerAction(state, { type: "move", toSlot: slot });
        setState(newState);
      }
    },
    [state, selectedAbility],
  );

  const handleEndTurn = useCallback(() => {
    if (!isPlayerTurn(state)) return;
    const newState = applyPlayerAction(state, { type: "end_turn" });
    setState(newState);
    setSelectedAbility(null);
  }, [state]);

  const handleCollectSalt = useCallback(
    (corpseUid: string) => {
      if (!isPlayerTurn(state)) return;
      setState(applyPlayerAction(state, { type: "collect_salt", fromCorpseUid: corpseUid }));
    },
    [state],
  );

  const abilities = getPlayerAbilities(state);
  const p = state.player;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        padding: 20,
        minHeight: "100vh",
        background: "#0d0d0d",
        color: "#ddd",
        fontFamily: "monospace",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", gap: 28, alignItems: "center", fontSize: 15 }}>
        <span>Turn {state.turn}</span>
        <span style={{ color: "#8f8" }}>
          ❤️ {p.hp}/{p.maxHp}
        </span>
        <span style={{ color: "#88f" }}>
          ⚡ {p.ap}/{p.maxAp} AP
        </span>
        <span style={{ color: "#ff8" }}>🧂 {p.salt}</span>
        {p.armor > 0 && <span style={{ color: "#aaf" }}>🛡️ {p.armor}</span>}
        <span style={{ color: "#888", fontSize: 12 }}>
          {state.phase === "player_turn" ? "Your turn" : state.phase}
        </span>
      </div>

      {/* The Line — the main interactive surface */}
      <div style={{ display: "flex", gap: 8, alignItems: "stretch", padding: "12px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#555",
            fontSize: 11,
            writingMode: "vertical-rl",
            paddingRight: 4,
          }}
        >
          WALL
        </div>
        {Array.from({ length: state.lineLength }, (_, i) => (
          <Slot
            key={i}
            index={i}
            state={state}
            previewSlots={previewSlots}
            enemyHoverTargets={enemyHoverTargets}
            hoveredEnemyUid={hoveredEnemyUid}
            isMoveTarget={hoveredSlot === i && canMoveTo(i)}
            onSlotClick={handleSlotClick}
            onSlotHover={setHoveredSlot}
            onEnemyHover={setHoveredEnemyUid}
          />
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#555",
            fontSize: 11,
            writingMode: "vertical-rl",
            paddingLeft: 4,
          }}
        >
          WALL
        </div>
      </div>

      {/* Hover tooltip — describes hovered enemy's intent or selected ability */}
      <div style={{ minHeight: 60, maxWidth: 720, textAlign: "center" }}>
        {hoveredEnemyUid &&
          (() => {
            const enemy = state.enemies.find((e) => e.uid === hoveredEnemyUid);
            if (!enemy) return null;
            const def = LINE_ENEMY_DEFS[enemy.id];
            const ts = state.telegraphs.filter((t) => t.ownerUid === enemy.uid);
            return (
              <div
                style={{
                  background: "#1a1410",
                  border: "1px solid #6a4a20",
                  borderRadius: 6,
                  padding: "8px 14px",
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: "#ddd",
                }}
              >
                <div style={{ color: "#fa8", fontWeight: "bold", marginBottom: 4 }}>
                  {def?.ascii} {def?.name}
                </div>
                {ts.length === 0 && <div style={{ color: "#888" }}>Stunned or waiting.</div>}
                {ts.map((t, i) => {
                  if (t.abilityId === "move" || t.abilityId === "retreat") {
                    return (
                      <div key={i}>
                        <b>{t.label}</b> to slot {t.selfRepositionSlot}.
                      </div>
                    );
                  }
                  const ability = def?.abilities.find((a) => a.id === t.abilityId);
                  return (
                    <div key={i}>
                      <span style={{ color: "#fc8" }}>
                        <b>
                          {t.icon} {t.label}
                        </b>
                        :
                      </span>{" "}
                      <span style={{ color: "#bbb" }}>
                        {ability
                          ? describeAbility(ability)
                          : `Targets slots [${t.affectedSlots.join(", ")}].`}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        {!hoveredEnemyUid && selectedAbility && (
          <div
            style={{
              background: "#10141a",
              border: "1px solid #4a5a8a",
              borderRadius: 6,
              padding: "8px 14px",
              fontSize: 12,
              lineHeight: 1.4,
              color: "#ddd",
            }}
          >
            <div style={{ color: "#8af", fontWeight: "bold", marginBottom: 4 }}>
              {selectedAbility.icon} {selectedAbility.name}
            </div>
            <div style={{ color: "#bbb" }}>{describeAbility(selectedAbility)}</div>
            <div style={{ color: "#888", fontStyle: "italic", marginTop: 4 }}>
              Click a slot to target.
            </div>
          </div>
        )}
      </div>

      {/* Abilities */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1100,
        }}
      >
        {abilities.map((ability) => {
          const onCd = (p.abilityCooldowns[ability.id] ?? 0) > 0;
          const noAp = p.ap < ability.apCost;
          const isSelected = selectedAbility?.id === ability.id;
          return (
            <button
              key={ability.id}
              onClick={() => handleAbilityClick(ability)}
              disabled={!isPlayerTurn(state) || onCd || noAp}
              title={`${ability.name} — ${describeAbility(ability)}`}
              style={{
                padding: "10px 16px",
                background: isSelected ? "#224" : onCd || noAp ? "#1a1a1a" : "#222",
                border: `2px solid ${isSelected ? "#88f" : onCd ? "#555" : "#444"}`,
                color: onCd || noAp ? "#555" : "#ccc",
                borderRadius: 6,
                cursor: onCd || noAp ? "not-allowed" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                minWidth: 90,
              }}
            >
              <span style={{ fontSize: 22 }}>{ability.icon}</span>
              <span style={{ fontSize: 12 }}>{ability.name}</span>
              <span style={{ fontSize: 11, color: "#88f" }}>{ability.apCost} AP</span>
              {onCd && (
                <span style={{ fontSize: 10, color: "#a44" }}>
                  CD: {p.abilityCooldowns[ability.id]}
                </span>
              )}
            </button>
          );
        })}

        {/* Collect salt for adjacent corpses */}
        {state.corpses
          .filter((c) => Math.abs(c.position - p.position) <= 1)
          .map((c) => (
            <button
              key={c.uid}
              onClick={() => handleCollectSalt(c.uid)}
              disabled={!isPlayerTurn(state)}
              style={{
                padding: "10px 16px",
                background: "#221a00",
                border: "2px solid #885500",
                color: "#cc8",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                minWidth: 90,
              }}
            >
              <span style={{ fontSize: 22 }}>🧂</span>
              <span style={{ fontSize: 12 }}>Collect</span>
              <span style={{ fontSize: 11, color: "#aa8" }}>{c.salt} salt</span>
            </button>
          ))}

        {/* End turn */}
        <button
          onClick={handleEndTurn}
          disabled={!isPlayerTurn(state)}
          style={{
            padding: "10px 24px",
            background: isPlayerTurn(state) ? "#2a1a00" : "#1a1a1a",
            border: `2px solid ${isPlayerTurn(state) ? "#a80" : "#444"}`,
            color: isPlayerTurn(state) ? "#fa0" : "#555",
            borderRadius: 6,
            cursor: isPlayerTurn(state) ? "pointer" : "not-allowed",
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          End Turn
        </button>
      </div>

      {/* Goal */}
      <div style={{ fontSize: 13, color: "#888" }}>
        Goal:{" "}
        {state.goal.type === "kill_all"
          ? `Kill all enemies (${state.enemies.filter((e) => e.hp > 0).length} left)`
          : state.goal.type === "survive"
            ? `Survive until turn ${(state.goal as { type: "survive"; turns: number }).turns} (turn ${state.turn})`
            : state.goal.type === "kill_target"
              ? `Kill the ${(state.goal as { type: "kill_target"; targetName: string }).targetName}`
              : "Complete objective"}
      </div>

      {/* Combat log */}
      <div
        style={{
          maxWidth: 800,
          width: "100%",
          maxHeight: 120,
          overflowY: "auto",
          background: "#111",
          border: "1px solid #333",
          borderRadius: 4,
          padding: "6px 10px",
          fontSize: 12,
          color: "#888",
        }}
      >
        {log.slice(-12).map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* Victory/defeat overlay */}
      {(isVictory(state) || isDefeat(state)) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: 40,
              background: "#111",
              border: `3px solid ${isVictory(state) ? "#4a4" : "#a44"}`,
              borderRadius: 8,
              textAlign: "center",
              fontSize: 24,
            }}
          >
            {isVictory(state) ? "⚔️ Victory!" : "☠️ Defeated"}
          </div>
        </div>
      )}
    </div>
  );
}

export default LineScreen;
