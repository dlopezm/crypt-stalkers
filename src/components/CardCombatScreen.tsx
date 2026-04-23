import { useMemo, useState } from "react";
import { btnStyle, FONT } from "../styles";
import { getCard } from "../card-combat/cards";
import type { CardCombatState, CombatLoadout, Reach } from "../card-combat/types";
import { canPlayCard, endTurnAndResolve, initCardCombat, playCard } from "../card-combat/engine";
import { DistanceView } from "./card-combat/DistanceView";
import { HandRenderer } from "./card-combat/HandRenderer";
import { PlayerStats } from "./card-combat/PlayerStats";
import { CombatLog } from "./card-combat/CombatLog";

interface Props {
  readonly loadout: CombatLoadout;
  readonly startingHp: number;
  readonly startingMaxHp: number;
  readonly startingSalt: number;
  readonly initialEnemies: readonly {
    readonly id: string;
    readonly uid: string;
    readonly distance?: number;
  }[];
  readonly onVictory: (finalHp: number, finalSalt: number, lootSalt: number) => void;
  readonly onDefeat: () => void;
}

export function CardCombatScreen({
  loadout,
  startingHp,
  startingMaxHp,
  startingSalt,
  initialEnemies,
  onVictory,
  onDefeat,
}: Props) {
  const [state, setState] = useState<CardCombatState>(() =>
    initCardCombat({
      loadout,
      startingHp,
      startingMaxHp,
      startingSalt,
      enemies: initialEnemies,
    }),
  );

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedEnemyUid, setSelectedEnemyUid] = useState<string | null>(null);

  const selectedCard = useMemo(
    () => (selectedCardId ? getCard(selectedCardId) : null),
    [selectedCardId],
  );

  const reachFilter: { min: number; max: number } | null = useMemo(() => {
    if (!selectedCard) return null;
    if (selectedCard.reach === "self") return null;
    return selectedCard.reach as Reach;
  }, [selectedCard]);

  function handlePlay() {
    if (!selectedCardId) return;
    // Self-targeting cards don't need an enemy
    const targetUid = selectedCard?.targetKind === "enemy" ? selectedEnemyUid : null;
    if (selectedCard?.targetKind === "enemy" && !targetUid) return;

    const check = canPlayCard(state, selectedCardId, targetUid);
    if (!check.ok) return;

    const result = playCard(state, selectedCardId, targetUid);
    setState(result.state);
    setSelectedCardId(null);
    setSelectedEnemyUid(null);

    if (result.state.phase === "victory") {
      onVictory(result.state.player.hp, result.state.player.salt, 5);
    } else if (result.state.phase === "defeat") {
      onDefeat();
    }
  }

  function handleEndTurn() {
    const resolved = endTurnAndResolve(state);
    setState(resolved);
    setSelectedCardId(null);
    setSelectedEnemyUid(null);

    if (resolved.phase === "victory") {
      onVictory(resolved.player.hp, resolved.player.salt, 5);
    } else if (resolved.phase === "defeat") {
      onDefeat();
    }
  }

  const needsEnemy = selectedCard?.targetKind === "enemy";
  const canConfirm = selectedCardId !== null && (!needsEnemy || selectedEnemyUid !== null);

  return (
    <div className="flex flex-col w-full h-full" style={{ fontFamily: FONT, color: "#ece0c8" }}>
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-crypt-border"
        style={{ background: "#0f0b08" }}
      >
        <div className="text-sm uppercase tracking-widest" style={{ color: "#c8b878" }}>
          Turn {state.turn} — {state.phase}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            disabled={!canConfirm}
            style={btnStyle("#3ddc84", !canConfirm)}
          >
            Play Card
          </button>
          <button onClick={handleEndTurn} style={btnStyle("#8b0000")}>
            End Turn
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-w-0">
          <DistanceView
            enemies={state.enemies}
            selectedEnemyUid={selectedEnemyUid}
            onSelectEnemy={setSelectedEnemyUid}
            reachFilter={reachFilter}
          />

          <div className="flex-1 px-5 py-3" style={{ background: "#0f0b08" }}>
            {selectedCard && (
              <div className="text-sm" style={{ color: "#a89878" }}>
                <div style={{ color: "#ece0c8" }}>
                  <strong>{selectedCard.name}</strong> — {selectedCard.desc}
                </div>
                {needsEnemy && !selectedEnemyUid && (
                  <div className="mt-1" style={{ color: "#c8b878" }}>
                    Select a target.
                  </div>
                )}
                {!needsEnemy && (
                  <div className="mt-1" style={{ color: "#3ddc84" }}>
                    Ready to play.
                  </div>
                )}
              </div>
            )}
            {!selectedCard && (
              <div className="text-sm italic" style={{ color: "#786848" }}>
                Select a card from your hand.
              </div>
            )}
            {state.corpses.length > 0 && (
              <div className="text-xs mt-2" style={{ color: "#786848" }}>
                {state.corpses.length} corpse{state.corpses.length === 1 ? "" : "s"} on the ground.
              </div>
            )}
          </div>

          <PlayerStats player={state.player} />

          <HandRenderer
            player={state.player}
            selectedCardId={selectedCardId}
            onSelectCard={setSelectedCardId}
            disabled={state.phase !== "planning"}
          />
        </div>

        <CombatLog entries={state.log} />
      </div>
    </div>
  );
}
