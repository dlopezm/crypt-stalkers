import type {
  GridAbility,
  GridCombatState,
  GridPlayerState,
  GridPos,
  TimelineEntry,
} from "../types";

let _nextEntryId = 0;
export function nextEntryId(): string {
  return `te_${_nextEntryId++}`;
}

export function insertPlayerAction(
  state: GridCombatState,
  ability: GridAbility,
  targetTile: GridPos | null,
  targetUid: string | null,
  affectedTiles: readonly GridPos[],
  insertAfterIndex: number,
): GridCombatState {
  const playerTelegraphType =
    ability.baseDamage > 0
      ? ("attack" as const)
      : ability.moveSelfDistance > 0
        ? ("move" as const)
        : ("special" as const);

  const entry: TimelineEntry = {
    id: nextEntryId(),
    owner: { type: "player" },
    abilityId: ability.id,
    targetTile,
    targetUid,
    affectedTiles,
    label: `You: ${ability.name}`,
    icon: "⚔️",
    insertionIndex: insertAfterIndex,
    telegraphType: playerTelegraphType,
  };

  const newInsertions = [...state.playerInsertions, entry];

  const newPlayer: GridPlayerState = {
    ...state.player,
    ap: state.player.ap - ability.apCost,
    abilityCooldowns: {
      ...state.player.abilityCooldowns,
      [ability.id]: ability.cooldown,
    },
  };

  return {
    ...state,
    player: newPlayer,
    playerInsertions: newInsertions,
  };
}

export function removePlayerInsertion(
  state: GridCombatState,
  entryId: string,
  ability: GridAbility,
): GridCombatState {
  const entry = state.playerInsertions.find((e) => e.id === entryId);
  if (!entry) {
    return state;
  }

  const newInsertions = state.playerInsertions.filter((e) => e.id !== entryId);

  const newPlayer: GridPlayerState = {
    ...state.player,
    ap: state.player.ap + ability.apCost,
    abilityCooldowns: {
      ...state.player.abilityCooldowns,
      [ability.id]: 0,
    },
  };

  return {
    ...state,
    player: newPlayer,
    playerInsertions: newInsertions,
  };
}

export function buildExecutionTimeline(
  enemyEntries: readonly TimelineEntry[],
  playerInsertions: readonly TimelineEntry[],
): readonly TimelineEntry[] {
  const merged: TimelineEntry[] = [];
  let enemyIdx = 0;

  const sorted = [...playerInsertions].sort((a, b) => a.insertionIndex - b.insertionIndex);

  for (const playerEntry of sorted) {
    while (
      enemyIdx < enemyEntries.length &&
      enemyEntries[enemyIdx].insertionIndex <= playerEntry.insertionIndex
    ) {
      merged.push(enemyEntries[enemyIdx]);
      enemyIdx++;
    }
    merged.push(playerEntry);
  }

  while (enemyIdx < enemyEntries.length) {
    merged.push(enemyEntries[enemyIdx]);
    enemyIdx++;
  }

  return merged;
}
