import { makeEnemy } from "../utils/helpers";
import type { CombatAction, Enemy, CombatPlayer } from "../types";

export function executeActions(
  actions: CombatAction[],
  self: Enemy,
  player: CombatPlayer,
  enemies: Enemy[],
  light: { value: number },
  lines: string[],
): void {
  for (const action of actions) {
    switch (action.type) {
      case "damage_player": {
        const bl = Math.min(player.block, action.amount);
        player.block = Math.max(0, player.block - bl);
        player.hp -= action.amount - bl;
        break;
      }
      case "apply_status_player": {
        player.statuses[action.status] = (player.statuses[action.status] || 0) + action.stacks;
        break;
      }
      case "heal_self": {
        self.hp = Math.min(self.maxHp, self.hp + action.amount);
        break;
      }
      case "spawn": {
        const e = makeEnemy(action.enemyId);
        if (action.row) e.row = action.row;
        if (action.reassembled) e.reassembled = true;
        if (action.summonCooldown !== undefined) e.summonCooldown = action.summonCooldown;
        enemies.push(e);
        break;
      }
      case "drain_light": {
        light.value = Math.max(0, light.value - action.amount);
        lines.push(light.value === 0 ? "\u{1F311} Total darkness!" : "\u{1F311} Light fades.");
        break;
      }
      case "log": {
        lines.push(action.message);
        break;
      }
      case "skip_attack":
        break;
    }
  }
}
