import type { GridCombatState, GridEnemyState, GridEnemyTypeDef, TimelineEntry } from "../types";
import { nextEntryId } from "./insertion";

export function generateEnemyTelegraphs(
  state: GridCombatState,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): readonly TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  let insertionIdx = 0;

  const speedOrder = sortEnemiesBySpeed(state.enemies, enemyDefs);

  for (const enemy of speedOrder) {
    if (enemy.hp <= 0) {
      continue;
    }

    if ((enemy.conditions.stunned ?? 0) > 0) {
      entries.push({
        id: nextEntryId(),
        owner: { type: "enemy", uid: enemy.uid },
        abilityId: "stunned",
        targetTile: null,
        targetUid: null,
        affectedTiles: [],
        label: `${getEnemyName(enemy.id, enemyDefs)}: Stunned`,
        icon: "💫",
        insertionIndex: insertionIdx++,
        telegraphType: "buff",
      });
      continue;
    }

    if (enemy.reformTimer !== null) {
      entries.push({
        id: nextEntryId(),
        owner: { type: "enemy", uid: enemy.uid },
        abilityId: "reforming",
        targetTile: null,
        targetUid: null,
        affectedTiles: [],
        label: `${getEnemyName(enemy.id, enemyDefs)}: Reforming... (${enemy.reformTimer})`,
        icon: "🦴",
        insertionIndex: insertionIdx++,
        telegraphType: "special",
      });
      continue;
    }

    if (enemy.metamorphosisTimer !== null) {
      entries.push({
        id: nextEntryId(),
        owner: { type: "enemy", uid: enemy.uid },
        abilityId: "metamorphosis",
        targetTile: null,
        targetUid: null,
        affectedTiles: [],
        label: `${getEnemyName(enemy.id, enemyDefs)}: Transforming... (${enemy.metamorphosisTimer})`,
        icon: "🪱",
        insertionIndex: insertionIdx++,
        telegraphType: "special",
      });
      continue;
    }

    const def = enemyDefs.get(enemy.id);
    if (!def) {
      continue;
    }

    const ctx = {
      grid: state.grid,
      player: state.player,
      enemies: state.enemies,
      deadEnemies: state.deadEnemyPositions,
      turn: state.turn,
    };

    const telegraphs = def.selectActions(enemy, ctx);

    for (const telegraph of telegraphs) {
      entries.push({
        id: nextEntryId(),
        owner: { type: "enemy", uid: enemy.uid },
        abilityId: telegraph.abilityId,
        targetTile: telegraph.targetTile,
        targetUid: telegraph.targetUid,
        affectedTiles: telegraph.affectedTiles,
        label: telegraph.label,
        icon: telegraph.icon,
        insertionIndex: insertionIdx++,
        telegraphType: telegraph.telegraphType,
      });
    }
  }

  return entries;
}

function sortEnemiesBySpeed(
  enemies: readonly GridEnemyState[],
  defs: ReadonlyMap<string, GridEnemyTypeDef>,
): readonly GridEnemyState[] {
  const speedValue = (e: GridEnemyState): number => {
    const def = defs.get(e.id);
    if (!def) {
      return 2;
    }
    switch (def.speedTier) {
      case "very_fast":
        return 0;
      case "fast":
        return 1;
      case "medium":
        return 2;
      case "slow":
        return 3;
    }
  };

  return [...enemies].sort((a, b) => speedValue(a) - speedValue(b));
}

export function getEnemyName(id: string, defs: ReadonlyMap<string, GridEnemyTypeDef>): string {
  return defs.get(id)?.name ?? id;
}
