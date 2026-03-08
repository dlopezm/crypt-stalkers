import { ALL_CARDS, STARTER_IDS, REWARD_POOL } from "../data/cards";
import { ENEMY_TYPES } from "../data/enemies";
import type { Card, CardTemplate, Enemy, CombatPlayer, Statuses } from "../types";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function uid(p: string): string {
  return `${p}-${Math.random().toString(36).slice(2, 7)}`;
}

export function makeEnemy(id: string): Enemy {
  const b = ENEMY_TYPES.find(e => e.id === id)!;
  return {
    ...b,
    hp: b.maxHp,
    block: 0,
    statuses: {},
    reassembled: false,
    ambushTurns: b.ambushTurns || 0,
    summonCooldown: 2,
    uid: uid(id),
  };
}

export function makeStarterDeck(): Card[] {
  return STARTER_IDS.map((id, i) => ({
    ...ALL_CARDS.find(c => c.id === id)!,
    uid: `${id}-${i}`,
  }));
}

export function drawCards(count: number, p: CombatPlayer): CombatPlayer {
  const draw = [...p.drawPile];
  let disc = [...p.discard];
  const h = [...p.hand];
  for (let i = 0; i < count; i++) {
    if (!draw.length) {
      if (!disc.length) break;
      const reshuffled = shuffle(disc);
      draw.push(...reshuffled);
      disc = [];
    }
    h.push(draw.shift()!);
  }
  return { ...p, hand: h, drawPile: draw, discard: disc };
}

export function tickStatuses(entity: { hp: number; name?: string; statuses: Statuses }): { entity: typeof entity; log: string[] } {
  const e = { ...entity, statuses: { ...(entity.statuses || {}) } };
  const log: string[] = [];
  const s = e.statuses;

  if ((s.bleed || 0) > 0) {
    e.hp -= s.bleed!;
    log.push(`\u{1FA78} ${e.name || "You"} bleeds ${s.bleed}.`);
    s.bleed = Math.max(0, s.bleed! - 1);
  }
  if ((s.poison || 0) > 0) {
    e.hp -= s.poison!;
    log.push(`\u{1F40D} ${e.name || "You"} poisoned ${s.poison}.`);
  }
  if ((s.stun || 0) > 0) s.stun = Math.max(0, s.stun! - 1);
  if ((s.weaken || 0) > 0) s.weaken = Math.max(0, s.weaken! - 1);
  if ((s.blind || 0) > 0) s.blind = Math.max(0, s.blind! - 1);
  if ((s.silence || 0) > 0) s.silence = Math.max(0, s.silence! - 1);

  return { entity: e, log };
}

export function getRewards(): CardTemplate[] {
  return shuffle(REWARD_POOL).slice(0, 3);
}
