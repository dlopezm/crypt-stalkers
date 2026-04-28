/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — Telegraph Phase
   Calls each enemy's selectActions() to produce the telegraph array.
   Respects stun/conditions that prevent enemy actions.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { LineCombatState, LineTelegraph, LineAIContext } from "../types";
import { getLineEnemyDef } from "../enemy-defs";

export function buildTelegraphs(state: LineCombatState): LineCombatState {
  const ctx: LineAIContext = {
    player: state.player,
    enemies: state.enemies,
    corpses: state.corpses,
    slots: state.slots,
    turn: state.turn,
  };

  const telegraphs: LineTelegraph[] = [];

  for (const enemy of state.enemies) {
    if (enemy.hp <= 0 && enemy.countdownTimer === null) continue;

    // Stunned enemies skip their action
    if ((enemy.conditions.stunned ?? 0) > 0) continue;
    // Reforming/metamorphosing enemies (countdownTimer active) show waiting state
    if (enemy.countdownTimer !== null) continue;
    // Mist form — invulnerable, skip
    if (enemy.mistFormTurns > 0) continue;

    const def = getLineEnemyDef(enemy.id);
    const actions = def.selectActions(enemy, ctx);

    // Silenced enemies cannot use silenceBlocked abilities
    if ((enemy.conditions.silenced ?? 0) > 0) {
      for (const tel of actions) {
        const ability = def.abilities.find((a) => a.id === tel.abilityId);
        if (!ability || !ability.silenceBlocked) {
          telegraphs.push(tel);
        }
      }
    } else {
      telegraphs.push(...actions);
    }

    // Commanded enemies get one extra action
    if (enemy.commandedExtraAction) {
      const extraActions = def.selectActions({ ...enemy, commandedExtraAction: false }, ctx);
      if (extraActions.length > 0) {
        telegraphs.push(extraActions[0]);
      }
    }
  }

  return { ...state, telegraphs, phase: "player_turn" };
}
