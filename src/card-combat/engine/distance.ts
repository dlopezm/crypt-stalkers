import { MAX_DISTANCE } from "../constants";
import type { CardCombatEnemy, Reach } from "../types";

export function inReach(reach: Reach | "self", distance: number): boolean {
  if (reach === "self") {
    return false;
  }
  return distance >= reach.min && distance <= reach.max;
}

export function clampDistance(n: number): number {
  if (n < 0) return 0;
  if (n > MAX_DISTANCE) return MAX_DISTANCE;
  return n;
}

export function enemiesInReach(
  enemies: readonly CardCombatEnemy[],
  reach: Reach | "self",
): readonly CardCombatEnemy[] {
  if (reach === "self") return [];
  return enemies.filter((e) => inReach(reach, e.distance));
}

export function closestEnemy(enemies: readonly CardCombatEnemy[]): CardCombatEnemy | null {
  if (enemies.length === 0) return null;
  return enemies.reduce((a, b) => (a.distance <= b.distance ? a : b));
}

export function adjustEnemyDistance<T extends { readonly distance: number }>(
  enemy: T,
  delta: number,
): T {
  return { ...enemy, distance: clampDistance(enemy.distance + delta) };
}
