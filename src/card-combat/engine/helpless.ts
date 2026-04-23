import type { CardCombatEnemy } from "../types";

export function isHelpless(enemy: CardCombatEnemy): boolean {
  const { conditions } = enemy;
  return (conditions.stunned ?? 0) > 0 || (conditions.unaware ?? 0) > 0;
}
