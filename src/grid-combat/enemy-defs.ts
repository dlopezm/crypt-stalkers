/* ═══════════════════════════════════════════════════════════════════════════
   Grid Enemy Type Definitions — all 15 regular + 3 boss enemy types
   Each enemy is a tactical puzzle piece with telegraphed grid abilities.
   ═══════════════════════════════════════════════════════════════════════════ */

import type {
  GridEnemyTypeDef,
  GridEnemyState,
  GridAIContext,
  EnemyTelegraph,
  GridPos,
} from "./types";
import {
  posAdd,
  posEqual,
  DIR_DELTA,
  DIRECTIONS,
  directionFromTo,
  manhattanDistance,
  isAdjacent,
  isWalkable,
  getTile,
  inBounds,
} from "./types";
import { hasLineOfSight, getOccupiedPositions, findPathAStar } from "./grid";
import { BALANCE } from "./balance";
import { SYNTHETIC_ABILITY_ID } from "./engine/types";

// ─── AI helpers ───

function adjacentToPlayer(self: GridEnemyState, ctx: GridAIContext): boolean {
  return isAdjacent(self.pos, ctx.player.pos);
}

function moveTowardPlayer(
  self: GridEnemyState,
  ctx: GridAIContext,
  steps: number,
): EnemyTelegraph[] {
  const occupied = getOccupiedPositions(ctx.player, ctx.enemies);
  const path = findPathAStar(ctx.grid, self.pos, ctx.player.pos, occupied, steps + 5);
  if (!path || path.length < 2) {
    return [];
  }

  const targetIdx = Math.min(steps, path.length - 1);
  const targetPos = path[targetIdx];

  return [
    {
      abilityId: "move",
      targetTile: targetPos,
      targetUid: null,
      affectedTiles: [targetPos],
      label: `Move`,
      icon: "👣",
      telegraphType: "move",
    },
  ];
}

function meleeAttackAtPlayer(
  self: GridEnemyState,
  ctx: GridAIContext,
  abilityId: string,
  name: string,
  icon: string,
): EnemyTelegraph[] {
  if (!adjacentToPlayer(self, ctx)) {
    return [];
  }

  return [
    {
      abilityId,
      targetTile: ctx.player.pos,
      targetUid: null,
      affectedTiles: [ctx.player.pos],
      label: name,
      icon,
      telegraphType: "attack",
    },
  ];
}

function posIsEmpty(pos: GridPos, ctx: GridAIContext): boolean {
  if (!isWalkable(ctx.grid, pos)) {
    return false;
  }
  if (posEqual(pos, ctx.player.pos)) {
    return false;
  }
  return !ctx.enemies.some((e) => e.hp > 0 && posEqual(e.pos, pos));
}

function findEmptyAdjacent(center: GridPos, ctx: GridAIContext): GridPos | null {
  for (const dir of DIRECTIONS) {
    const pos = posAdd(center, DIR_DELTA[dir]);
    if (posIsEmpty(pos, ctx)) {
      return pos;
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENEMY TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const RAT: GridEnemyTypeDef = {
  id: "rat",
  name: "Ravager Rat",
  ascii: "🐀",
  maxHp: 2,
  speedTier: "fast",
  loot: 3,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  passives: [{ type: "swarm_bonus", bonusDamagePerAlly: 1 }],
  abilities: [
    {
      id: "rat_bite",
      name: "Bite",
      icon: "🐀",
      targetType: "adjacent",
      range: 1,
      damage: 2,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "swarm_bonus", bonusDamage: 1 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];

    const adjacentRats = ctx.enemies.filter(
      (e) => e.uid !== self.uid && e.id === "rat" && e.hp > 0 && isAdjacent(self.pos, e.pos),
    );

    if (adjacentRats.length >= 2 && adjacentToPlayer(self, ctx)) {
      const crossTiles: GridPos[] = [];
      for (const dir of DIRECTIONS) {
        const p = posAdd(ctx.player.pos, DIR_DELTA[dir]);
        if (inBounds(p, ctx.grid.width, ctx.grid.height)) {
          crossTiles.push(p);
        }
      }
      crossTiles.push(ctx.player.pos);

      telegraphs.push({
        abilityId: "rat_bite",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: crossTiles,
        label: "Swarm Pile!",
        icon: "🐀",
        telegraphType: "attack",
      });
    } else if (adjacentToPlayer(self, ctx)) {
      telegraphs.push(...meleeAttackAtPlayer(self, ctx, "rat_bite", "Bite", "🐀"));
    } else {
      telegraphs.push(...moveTowardPlayer(self, ctx, 3));
    }

    return telegraphs;
  },
};

const SKELETON: GridEnemyTypeDef = {
  id: "skeleton",
  name: "Skeleton",
  ascii: "💀",
  maxHp: 12,
  speedTier: "medium",
  loot: 8,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: { pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5 },
  passives: [{ type: "reform_on_non_bludgeoning" }, { type: "formation_armor", bonusPerAlly: 1 }],
  abilities: [
    {
      id: "skeleton_slash",
      name: "Slash",
      icon: "⚔️",
      targetType: "adjacent",
      range: 1,
      damage: 5,
      damageType: "slash",
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
    {
      id: "bone_lunge",
      name: "Bone Lunge",
      icon: "⚔️",
      targetType: "line",
      range: 2,
      damage: 4,
      damageType: "pierce",
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
    {
      id: "shielded_stance",
      name: "Shielded Stance",
      icon: "🛡️",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "gain_armor", amount: 3 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const dist = manhattanDistance(self.pos, ctx.player.pos);
    const useShield = ctx.turn % 2 === 0;

    if (useShield) {
      telegraphs.push({
        abilityId: "shielded_stance",
        targetTile: self.pos,
        targetUid: null,
        affectedTiles: [],
        label: "Shielded Stance",
        icon: "🛡️",
        telegraphType: "buff",
      });
      return telegraphs;
    }

    telegraphs.push(...moveTowardPlayer(self, ctx, 1));

    if (adjacentToPlayer(self, ctx)) {
      telegraphs.push(...meleeAttackAtPlayer(self, ctx, "skeleton_slash", "Slash", "⚔️"));
    } else if (dist === 2 && hasLineOfSight(ctx.grid, self.pos, ctx.player.pos)) {
      const dir = directionFromTo(self.pos, ctx.player.pos) ?? "south";
      const lineTiles: GridPos[] = [];
      let cur = self.pos;
      for (let i = 0; i < 2; i++) {
        cur = posAdd(cur, DIR_DELTA[dir]);
        if (inBounds(cur, ctx.grid.width, ctx.grid.height)) {
          lineTiles.push(cur);
        }
      }
      telegraphs.push({
        abilityId: "bone_lunge",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: lineTiles,
        label: "Bone Lunge",
        icon: "⚔️",
        telegraphType: "attack",
      });
    }

    return telegraphs;
  },
  onDeath(self, _ctx) {
    return [{ type: "spawn_heap", pos: self.pos }];
  },
};

const HEAP_OF_BONES: GridEnemyTypeDef = {
  id: "heap_of_bones",
  name: "Heap of Bones",
  ascii: "🦴",
  maxHp: 3,
  speedTier: "slow",
  loot: 0,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: { pierce: 0.5 },
  vulnerabilities: { bludgeoning: 2.0 },
  passives: [],
  abilities: [],
  selectActions(self, _ctx) {
    return [
      {
        abilityId: SYNTHETIC_ABILITY_ID.reforming,
        targetTile: null,
        targetUid: null,
        affectedTiles: [],
        label: `Reforming... (${self.reformTimer ?? 2})`,
        icon: "🦴",
        telegraphType: "special",
      },
    ];
  },
};

const ZOMBIE: GridEnemyTypeDef = {
  id: "zombie",
  name: "Rotting Zombie",
  ascii: "🧟",
  maxHp: 8,
  speedTier: "slow",
  loot: 12,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  passives: [],
  abilities: [
    {
      id: "zombie_grab",
      name: "Grab",
      icon: "🫲",
      targetType: "adjacent",
      range: 1,
      damage: 3,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [{ condition: "immobilized", stacks: 2, target: "enemy" }],
      special: [{ type: "immobilize_both", turns: 2 }],
    },
    {
      id: "zombie_shamble",
      name: "Shamble",
      icon: "🧟",
      targetType: "line",
      range: 3,
      damage: 2,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const dist = manhattanDistance(self.pos, ctx.player.pos);

    telegraphs.push(...moveTowardPlayer(self, ctx, 1));

    if (adjacentToPlayer(self, ctx)) {
      telegraphs.push({
        abilityId: "zombie_grab",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Grab",
        icon: "🫲",
        telegraphType: "attack",
      });
    } else if (dist <= 3 && hasLineOfSight(ctx.grid, self.pos, ctx.player.pos)) {
      const dir = directionFromTo(self.pos, ctx.player.pos) ?? "south";
      const lineTiles: GridPos[] = [];
      let cur = self.pos;
      for (let i = 0; i < 3; i++) {
        cur = posAdd(cur, DIR_DELTA[dir]);
        if (!inBounds(cur, ctx.grid.width, ctx.grid.height)) {
          break;
        }
        lineTiles.push(cur);
      }
      telegraphs.push({
        abilityId: "zombie_shamble",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: lineTiles,
        label: "Shamble",
        icon: "🧟",
        telegraphType: "attack",
      });
    }

    return telegraphs;
  },
  onDeath(self, _ctx) {
    return [{ type: "corpse_burst", pos: self.pos, damage: 2, poisonTurns: 2 }];
  },
};

const GHOST: GridEnemyTypeDef = {
  id: "ghost",
  name: "Mournful Ghost",
  ascii: "👻",
  maxHp: 10,
  speedTier: "fast",
  loot: 10,
  isBoss: false,
  incorporeal: true,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: { slash: 0.5, pierce: 0.5, bludgeoning: 0.5 },
  vulnerabilities: {},
  passives: [{ type: "incorporeal_resistance" }, { type: "immune_to_push" }],
  abilities: [
    {
      id: "ghost_chill_touch",
      name: "Chill Touch",
      icon: "❄️",
      targetType: "adjacent",
      range: 1,
      damage: 4,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [{ condition: "slowed", stacks: 2, target: "enemy" }],
      special: [{ type: "drain_ap", amount: 1 }],
    },
    {
      id: "ghost_spectral_wail",
      name: "Spectral Wail",
      icon: "😱",
      targetType: "ring",
      range: 3,
      damage: 3,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "drain_ap", amount: 1 }],
    },
    {
      id: "ghost_phase_shift",
      name: "Phase Shift",
      icon: "👻",
      targetType: "tile",
      range: 6,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "teleport_to_dark" }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const dist = manhattanDistance(self.pos, ctx.player.pos);
    const useChill = ctx.turn % 2 === 0;

    if (dist > 3) {
      const emptyNearPlayer = findEmptyAdjacent(ctx.player.pos, ctx);
      if (emptyNearPlayer) {
        telegraphs.push({
          abilityId: "phase",
          targetTile: emptyNearPlayer,
          targetUid: null,
          affectedTiles: [emptyNearPlayer],
          label: "Phase",
          icon: "👻",
          telegraphType: "move",
        });
      }
    } else {
      telegraphs.push(...moveTowardPlayer(self, ctx, 1));
    }

    if (useChill && adjacentToPlayer(self, ctx)) {
      telegraphs.push({
        abilityId: "ghost_chill_touch",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Chill Touch",
        icon: "❄️",
        telegraphType: "attack",
      });
    } else if (dist <= 3) {
      const ringTiles: GridPos[] = [];
      for (let dr = -3; dr <= 3; dr++) {
        for (let dc = -3; dc <= 3; dc++) {
          const md = Math.abs(dr) + Math.abs(dc);
          if (md >= 2 && md <= 3) {
            const p = { row: self.pos.row + dr, col: self.pos.col + dc };
            if (inBounds(p, ctx.grid.width, ctx.grid.height)) {
              ringTiles.push(p);
            }
          }
        }
      }
      telegraphs.push({
        abilityId: "ghost_spectral_wail",
        targetTile: null,
        targetUid: null,
        affectedTiles: ringTiles,
        label: "Spectral Wail",
        icon: "😱",
        telegraphType: "attack",
      });

      if (adjacentToPlayer(self, ctx)) {
        telegraphs.push({
          abilityId: "ghost_phase_shift",
          targetTile: null,
          targetUid: null,
          affectedTiles: [],
          label: "Phase Shift",
          icon: "👻",
          telegraphType: "move",
        });
      }
    }

    return telegraphs;
  },
};

const BANSHEE: GridEnemyTypeDef = {
  id: "banshee",
  name: "Wailing Banshee",
  ascii: "👁️",
  maxHp: 10,
  speedTier: "medium",
  loot: 14,
  isBoss: false,
  incorporeal: true,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: { slash: 0.5, pierce: 0.5, bludgeoning: 0.5 },
  vulnerabilities: {},
  passives: [{ type: "incorporeal_resistance" }, { type: "immune_to_push" }],
  abilities: [
    {
      id: "banshee_wail",
      name: "Wail",
      icon: "📢",
      targetType: "cone",
      range: 4,
      damage: 2,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "drain_ap", amount: 2 }],
    },
    {
      id: "corrupted_hymn",
      name: "Corrupted Hymn",
      icon: "🎵",
      targetType: "radius",
      range: 99,
      damage: 3,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "silence", turns: 2 }],
    },
    {
      id: "banshee_dirge",
      name: "Dirge of the Damned",
      icon: "💀",
      targetType: "radius",
      range: 2,
      damage: 0,
      damageType: null,
      aoeRadius: 2,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "dirge_zone", radius: 2, damage: 2, apDrain: 1, turns: 2 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const dist = manhattanDistance(self.pos, ctx.player.pos);

    telegraphs.push(...moveTowardPlayer(self, ctx, 1));

    const useHymn = ctx.turn % BALANCE.enemy.bansheeHymnInterval === 0;

    if (useHymn) {
      const allTiles: GridPos[] = [];
      for (let r = 0; r < ctx.grid.height; r++) {
        for (let c = 0; c < ctx.grid.width; c++) {
          allTiles.push({ row: r, col: c });
        }
      }
      telegraphs.push({
        abilityId: "corrupted_hymn",
        targetTile: null,
        targetUid: null,
        affectedTiles: allTiles,
        label: "Corrupted Hymn",
        icon: "🎵",
        telegraphType: "attack",
      });
    } else if (dist <= 2) {
      const dirgeTiles: GridPos[] = [];
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (Math.abs(dr) + Math.abs(dc) <= 2) {
            const p = { row: self.pos.row + dr, col: self.pos.col + dc };
            if (inBounds(p, ctx.grid.width, ctx.grid.height)) {
              dirgeTiles.push(p);
            }
          }
        }
      }
      telegraphs.push({
        abilityId: "banshee_dirge",
        targetTile: null,
        targetUid: null,
        affectedTiles: dirgeTiles,
        label: "Dirge of the Damned",
        icon: "💀",
        telegraphType: "special",
      });
    } else {
      const dir = directionFromTo(self.pos, ctx.player.pos) ?? "south";
      const coneTiles: GridPos[] = [];
      const delta = DIR_DELTA[dir];
      const perpDelta = delta.row === 0 ? { row: 1, col: 0 } : { row: 0, col: 1 };

      for (let d = 1; d <= 4; d++) {
        const center = { row: self.pos.row + delta.row * d, col: self.pos.col + delta.col * d };
        const halfW = Math.floor(d / 2);
        for (let w = -halfW; w <= halfW; w++) {
          const p = { row: center.row + perpDelta.row * w, col: center.col + perpDelta.col * w };
          if (inBounds(p, ctx.grid.width, ctx.grid.height)) {
            coneTiles.push(p);
          }
        }
      }

      telegraphs.push({
        abilityId: "banshee_wail",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: coneTiles,
        label: "Wail",
        icon: "📢",
        telegraphType: "attack",
      });
    }

    return telegraphs;
  },
};

const NECROMANCER: GridEnemyTypeDef = {
  id: "necromancer",
  name: "Necromancer",
  ascii: "🧙",
  maxHp: 7,
  speedTier: "medium",
  loot: 25,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  passives: [{ type: "bone_shield_while_minions", armor: 3 }],
  abilities: [
    {
      id: "dark_bolt",
      name: "Dark Bolt",
      icon: "⚡",
      targetType: "line",
      range: 6,
      damage: 6,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
    {
      id: "raise_dead",
      name: "Raise Dead",
      icon: "💀",
      targetType: "tile",
      range: 8,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "raise_dead" }],
    },
    {
      id: "command",
      name: "Command",
      icon: "👆",
      targetType: "tile",
      range: 6,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "command_extra_action", targetEnemyUid: "" }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const dist = manhattanDistance(self.pos, ctx.player.pos);
    const hasCorpse = ctx.deadEnemies.length > 0;
    const commandable = ctx.enemies.find(
      (e) => e.uid !== self.uid && e.hp > 0 && e.id !== "necromancer",
    );

    if (dist <= 2) {
      const fleeDir = directionFromTo(ctx.player.pos, self.pos);
      if (fleeDir) {
        const fleeTarget = posAdd(self.pos, DIR_DELTA[fleeDir]);
        if (posIsEmpty(fleeTarget, ctx)) {
          telegraphs.push({
            abilityId: "move",
            targetTile: fleeTarget,
            targetUid: null,
            affectedTiles: [fleeTarget],
            label: "Retreat",
            icon: "🏃",
            telegraphType: "move",
          });
        }
      }
    }

    if (hasCorpse && ctx.turn % 2 === 0) {
      const corpse = ctx.deadEnemies[0];
      telegraphs.push({
        abilityId: "raise_dead",
        targetTile: corpse.pos,
        targetUid: null,
        affectedTiles: [corpse.pos],
        label: "Raise Dead",
        icon: "💀",
        telegraphType: "special",
      });
    } else if (commandable && ctx.turn % 3 === 0) {
      telegraphs.push({
        abilityId: "command",
        targetTile: commandable.pos,
        targetUid: commandable.uid,
        affectedTiles: [commandable.pos],
        label: `Command ${commandable.id}`,
        icon: "👆",
        telegraphType: "special",
      });
    } else if (hasLineOfSight(ctx.grid, self.pos, ctx.player.pos)) {
      const dir = directionFromTo(self.pos, ctx.player.pos) ?? "south";
      const lineTiles: GridPos[] = [];
      let cur = self.pos;
      for (let i = 0; i < 6; i++) {
        cur = posAdd(cur, DIR_DELTA[dir]);
        if (!inBounds(cur, ctx.grid.width, ctx.grid.height)) {
          break;
        }
        lineTiles.push(cur);
      }

      telegraphs.push({
        abilityId: "dark_bolt",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: lineTiles,
        label: "Dark Bolt",
        icon: "⚡",
        telegraphType: "attack",
      });
    }

    return telegraphs;
  },
};

const GHOUL: GridEnemyTypeDef = {
  id: "ghoul",
  name: "Lurking Ghoul",
  ascii: "🦴",
  maxHp: 12,
  speedTier: "fast",
  loot: 12,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  passives: [{ type: "hidden_in_dark" }, { type: "ambush_predator", bonusDamage: 3 }],
  abilities: [
    {
      id: "ghoul_pounce",
      name: "Pounce",
      icon: "🐾",
      targetType: "tile",
      range: 4,
      damage: 10,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [{ condition: "immobilized", stacks: 1, target: "enemy" }],
      special: [],
    },
    {
      id: "ghoul_slash",
      name: "Slash",
      icon: "🐾",
      targetType: "adjacent",
      range: 1,
      damage: 6,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
    {
      id: "ghoul_retreat",
      name: "Retreat to Dark",
      icon: "🌑",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "retreat_to_dark", range: 6 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const isHidden = (self.conditions.hidden ?? 0) > 0;
    const dist = manhattanDistance(self.pos, ctx.player.pos);

    if (isHidden) {
      if (dist <= 4) {
        telegraphs.push({
          abilityId: "ghoul_pounce",
          targetTile: ctx.player.pos,
          targetUid: null,
          affectedTiles: [ctx.player.pos],
          label: "??? Pounce",
          icon: "❓",
          telegraphType: "attack",
        });
      } else {
        telegraphs.push(...moveTowardPlayer(self, ctx, 2));
      }
    } else {
      if (adjacentToPlayer(self, ctx)) {
        telegraphs.push(...meleeAttackAtPlayer(self, ctx, "ghoul_slash", "Slash", "🐾"));

        telegraphs.push({
          abilityId: "ghoul_retreat",
          targetTile: null,
          targetUid: null,
          affectedTiles: [],
          label: "Retreat to Dark",
          icon: "🌑",
          telegraphType: "move",
        });
      } else {
        telegraphs.push(...moveTowardPlayer(self, ctx, 2));
      }
    }

    return telegraphs;
  },
};

const SHADOW: GridEnemyTypeDef = {
  id: "shadow",
  name: "The Shadow",
  ascii: "🌑",
  maxHp: 14,
  speedTier: "medium",
  loot: 15,
  isBoss: false,
  incorporeal: true,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: { slash: 0.5, pierce: 0.5, bludgeoning: 0.5 },
  vulnerabilities: {},
  passives: [
    { type: "dark_empowered", bonusDamage: 3, bonusArmor: 2 },
    { type: "incorporeal_resistance" },
  ],
  abilities: [
    {
      id: "shadow_strike",
      name: "Shadow Strike",
      icon: "🌑",
      targetType: "adjacent",
      range: 1,
      damage: 8,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "teleport_to_dark" }],
    },
    {
      id: "consume_light",
      name: "Consume Light",
      icon: "🔥",
      targetType: "tile",
      range: 3,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "extinguish_light", range: 3 }],
    },
    {
      id: "spread_darkness",
      name: "Spread Darkness",
      icon: "🌫️",
      targetType: "radius",
      range: 3,
      damage: 0,
      damageType: null,
      aoeRadius: 3,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "spread_darkness", radius: 3, turns: 3 }],
    },
    {
      id: "shadow_step",
      name: "Shadow Step",
      icon: "🌑",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "shadow_step" }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const selfTile = getTile(ctx.grid, self.pos);
    const inDark = selfTile?.type === "dark_zone";
    const dist = manhattanDistance(self.pos, ctx.player.pos);

    telegraphs.push({
      abilityId: "consume_light",
      targetTile: null,
      targetUid: null,
      affectedTiles: [],
      label: "Consume Light",
      icon: "🔥",
      telegraphType: "special",
    });

    if (inDark && adjacentToPlayer(self, ctx)) {
      const crossTiles: GridPos[] = [ctx.player.pos];
      for (const dir of DIRECTIONS) {
        const p = posAdd(ctx.player.pos, DIR_DELTA[dir]);
        if (inBounds(p, ctx.grid.width, ctx.grid.height)) {
          crossTiles.push(p);
        }
      }
      telegraphs.push({
        abilityId: "shadow_strike",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: crossTiles,
        label: "Shadow Strike",
        icon: "🌑",
        telegraphType: "attack",
      });
    } else if (ctx.turn % 3 === 0) {
      const darkTiles: GridPos[] = [];
      for (let dr = -3; dr <= 3; dr++) {
        for (let dc = -3; dc <= 3; dc++) {
          if (Math.abs(dr) + Math.abs(dc) <= 3) {
            const p = { row: self.pos.row + dr, col: self.pos.col + dc };
            if (inBounds(p, ctx.grid.width, ctx.grid.height)) {
              darkTiles.push(p);
            }
          }
        }
      }
      telegraphs.push({
        abilityId: "spread_darkness",
        targetTile: null,
        targetUid: null,
        affectedTiles: darkTiles,
        label: "Spread Darkness",
        icon: "🌫️",
        telegraphType: "special",
      });
    } else if (inDark && dist > 2) {
      telegraphs.push({
        abilityId: "shadow_step",
        targetTile: null,
        targetUid: null,
        affectedTiles: [],
        label: "Shadow Step",
        icon: "🌑",
        telegraphType: "move",
      });
    } else {
      telegraphs.push(...moveTowardPlayer(self, ctx, 1));
    }

    return telegraphs;
  },
  onDeath(self, _ctx) {
    return [{ type: "death_darkness", pos: self.pos, radius: 2, turns: 3 }];
  },
};

const FORSWORN: GridEnemyTypeDef = {
  id: "forsworn",
  name: "The Forsworn",
  ascii: "⚔️",
  maxHp: 22,
  speedTier: "slow",
  loot: 14,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: { slash: 0.5, pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5, holy: 1.5 },
  passives: [
    { type: "perjured_aura", armorBonus: BALANCE.enemy.forswornInterceptArmorBonus },
    { type: "immune_to_push" },
  ],
  abilities: [
    {
      id: "forsworn_strike",
      name: "Oathbreaker's Strike",
      icon: "⚔️",
      targetType: "adjacent",
      range: 1,
      damage: BALANCE.enemy.forswornStrikeDamage,
      damageType: "bludgeoning",
      aoeRadius: 0,
      pushDistance: 1,
      conditions: [],
      special: [],
    },
    {
      id: "forsworn_ward",
      name: "Perjured Ward",
      icon: "⚔️",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "gain_armor", amount: BALANCE.enemy.forswornInterceptArmorBonus }],
    },
    {
      id: "forsworn_intercept",
      name: "Compelled Intercept",
      icon: "⚔️",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "intercept_for_ally" }],
    },
    {
      id: "forsworn_mark",
      name: "Damnation Mark",
      icon: "⚔️",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "damage_reduction_mark", fraction: BALANCE.enemy.forswornMarkReduction }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];

    const squishyAlly = ctx.enemies.find(
      (e) => e.uid !== self.uid && e.hp > 0 && (e.id === "necromancer" || e.id === "banshee"),
    );

    const adjacentToSquishy = squishyAlly != null && isAdjacent(self.pos, squishyAlly.pos);

    if (squishyAlly && !adjacentToSquishy) {
      telegraphs.push(...moveTowardPlayer(self, ctx, 1));
    }

    if (adjacentToSquishy && ctx.turn % 2 === 0) {
      telegraphs.push({
        abilityId: "forsworn_intercept",
        targetTile: self.pos,
        targetUid: squishyAlly.uid,
        affectedTiles: [self.pos, squishyAlly.pos],
        label: "Compelled Intercept",
        icon: "⚔️",
        telegraphType: "buff",
      });
    }

    if (self.hp < self.maxHp / 2 || adjacentToPlayer(self, ctx)) {
      telegraphs.push({
        abilityId: "forsworn_mark",
        targetTile: self.pos,
        targetUid: null,
        affectedTiles: [],
        label: "Damnation Mark",
        icon: "⚔️",
        telegraphType: "buff",
      });
    }

    if (adjacentToPlayer(self, ctx)) {
      telegraphs.push({
        abilityId: "forsworn_strike",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Oathbreaker's Strike",
        icon: "⚔️",
        telegraphType: "attack",
      });
    } else if (!squishyAlly || adjacentToSquishy) {
      telegraphs.push(...moveTowardPlayer(self, ctx, 1));
      telegraphs.push({
        abilityId: "forsworn_ward",
        targetTile: self.pos,
        targetUid: null,
        affectedTiles: [],
        label: "Perjured Ward",
        icon: "⚔️",
        telegraphType: "buff",
      });
    }

    return telegraphs;
  },
};

const FALSE_SACRARIUM: GridEnemyTypeDef = {
  id: "false_sacrarium",
  name: "The False Sacrarium",
  ascii: "⛪",
  maxHp: 12,
  speedTier: "slow",
  loot: 12,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: { slash: 0.5, pierce: 0.5 },
  vulnerabilities: { holy: 1.5, fire: 1.5 },
  passives: [{ type: "ever_growing", hpPerTurn: 1 }],
  abilities: [
    {
      id: "sacrarium_litany",
      name: "Putrid Litany",
      icon: "⛪",
      targetType: "radius",
      range: BALANCE.enemy.sacrariumLitanyRadius,
      damage: BALANCE.enemy.sacrariumLitanyDamage,
      damageType: null,
      aoeRadius: BALANCE.enemy.sacrariumLitanyRadius,
      pushDistance: 0,
      conditions: [{ condition: "poisoned", stacks: 2, target: "enemy" }],
      special: [],
    },
    {
      id: "sacrarium_growth",
      name: "Suppurating Growth",
      icon: "⛪",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [
        { type: "create_terrain_aoe", terrain: "rot", count: BALANCE.enemy.sacrariumGrowthTiles },
      ],
    },
    {
      id: "sacrarium_pulse",
      name: "Sacral Pulse",
      icon: "⛪",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "teleport_to_rot" }],
    },
    {
      id: "sacrarium_spawn",
      name: "Spawn Faithful",
      icon: "⛪",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "summon", enemyId: "gutborn_larva", count: 1 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];

    const growthTiles: GridPos[] = [];
    for (const dir of DIRECTIONS) {
      const pos = posAdd(self.pos, DIR_DELTA[dir]);
      if (
        inBounds(pos, ctx.grid.width, ctx.grid.height) &&
        getTile(ctx.grid, pos)?.type === "floor" &&
        posIsEmpty(pos, ctx)
      ) {
        growthTiles.push(pos);
      }
    }
    if (growthTiles.length > 0) {
      const count = Math.min(BALANCE.enemy.sacrariumGrowthTiles, growthTiles.length);
      const chosen = growthTiles.slice(0, count);
      telegraphs.push({
        abilityId: "sacrarium_growth",
        targetTile: self.pos,
        targetUid: null,
        affectedTiles: chosen,
        label: "Suppurating Growth",
        icon: "⛪",
        telegraphType: "special",
      });
    }

    const dist = manhattanDistance(self.pos, ctx.player.pos);
    if (dist <= BALANCE.enemy.sacrariumLitanyRadius + 1) {
      const affected: GridPos[] = [];
      for (let r = 0; r < ctx.grid.height; r++) {
        for (let c = 0; c < ctx.grid.width; c++) {
          const p = { row: r, col: c };
          if (manhattanDistance(self.pos, p) <= BALANCE.enemy.sacrariumLitanyRadius) {
            affected.push(p);
          }
        }
      }
      telegraphs.push({
        abilityId: "sacrarium_litany",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: affected,
        label: "Putrid Litany",
        icon: "⛪",
        telegraphType: "attack",
      });
    } else {
      let closestRot: GridPos | null = null;
      let closestDist = Infinity;
      for (let r = 0; r < ctx.grid.height; r++) {
        for (let c = 0; c < ctx.grid.width; c++) {
          const tile = getTile(ctx.grid, { row: r, col: c });
          if (tile?.type === "rot") {
            const d = manhattanDistance({ row: r, col: c }, ctx.player.pos);
            if (d < closestDist) {
              closestDist = d;
              closestRot = { row: r, col: c };
            }
          }
        }
      }
      if (closestRot && closestDist < dist) {
        telegraphs.push({
          abilityId: "sacrarium_pulse",
          targetTile: closestRot,
          targetUid: null,
          affectedTiles: [closestRot],
          label: "Sacral Pulse",
          icon: "⛪",
          telegraphType: "special",
        });
      }
    }

    if (ctx.turn % BALANCE.enemy.sacrariumSpawnInterval === 0) {
      const spawnPos = findEmptyAdjacent(self.pos, ctx);
      if (spawnPos) {
        telegraphs.push({
          abilityId: "sacrarium_spawn",
          targetTile: spawnPos,
          targetUid: null,
          affectedTiles: [spawnPos],
          label: "Spawn Faithful",
          icon: "⛪",
          telegraphType: "special",
        });
      }
    }

    return telegraphs;
  },
};

const SALT_REVENANT: GridEnemyTypeDef = {
  id: "salt_revenant",
  name: "Salt Revenant",
  ascii: "💎",
  maxHp: 20,
  speedTier: "medium",
  loot: 20,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: { pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5 },
  passives: [],
  abilities: [
    {
      id: "revenant_grapple",
      name: "Grapple",
      icon: "🤝",
      targetType: "adjacent",
      range: 1,
      damage: 5,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [
        { type: "immobilize_both", turns: 2 },
        { type: "pull_toward", distance: 1 },
      ],
    },
    {
      id: "revenant_weep",
      name: "Weep",
      icon: "😢",
      targetType: "ring",
      range: 1,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [{ condition: "stunned", stacks: 1, target: "enemy" }],
      special: [],
    },
    {
      id: "revenant_salt_crush",
      name: "Salt Crush",
      icon: "💎",
      targetType: "adjacent",
      range: 1,
      damage: 12,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const playerBelow50 = ctx.player.hp < ctx.player.maxHp * 0.5;
    const dist = manhattanDistance(self.pos, ctx.player.pos);

    if (adjacentToPlayer(self, ctx)) {
      if (playerBelow50) {
        const adjTiles: GridPos[] = [];
        for (const dir of DIRECTIONS) {
          const p = posAdd(self.pos, DIR_DELTA[dir]);
          if (inBounds(p, ctx.grid.width, ctx.grid.height)) {
            adjTiles.push(p);
          }
        }
        telegraphs.push({
          abilityId: "revenant_weep",
          targetTile: null,
          targetUid: null,
          affectedTiles: adjTiles,
          label: "Weep (Stun + Buff Allies)",
          icon: "😢",
          telegraphType: "attack",
        });
        telegraphs.push({
          abilityId: "revenant_salt_crush",
          targetTile: ctx.player.pos,
          targetUid: null,
          affectedTiles: [ctx.player.pos],
          label: "Salt Crush",
          icon: "💎",
          telegraphType: "attack",
        });
      } else {
        telegraphs.push({
          abilityId: "revenant_grapple",
          targetTile: ctx.player.pos,
          targetUid: null,
          affectedTiles: [ctx.player.pos],
          label: "Grapple (Pull)",
          icon: "🤝",
          telegraphType: "attack",
        });
      }
    } else if (dist <= 3) {
      telegraphs.push(...moveTowardPlayer(self, ctx, 1));
      telegraphs.push({
        abilityId: "revenant_grapple",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Grapple (Pull)",
        icon: "🤝",
        telegraphType: "attack",
      });
    } else {
      telegraphs.push(...moveTowardPlayer(self, ctx, 1));
    }

    return telegraphs;
  },
  onDeath(self, _ctx) {
    return [
      { type: "explode", radius: 2, damage: 5 },
      { type: "create_terrain", pos: self.pos, terrain: "salt_deposit" },
    ];
  },
};

const GRAVE_ROBBER: GridEnemyTypeDef = {
  id: "grave_robber",
  name: "Grave Robber",
  ascii: "🕵️",
  maxHp: 8,
  speedTier: "fast",
  loot: 20,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  passives: [{ type: "fleeing" }],
  abilities: [
    {
      id: "robber_pilfer",
      name: "Pilfer",
      icon: "💰",
      targetType: "adjacent",
      range: 1,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "steal_salt", amount: 10 }],
    },
    {
      id: "robber_smoke_bomb",
      name: "Smoke Bomb",
      icon: "💨",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "smoke_bomb", radius: 1 }],
    },
    {
      id: "drop_caltrops",
      name: "Drop Caltrops",
      icon: "📌",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "drop_caltrops" }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const dist = manhattanDistance(self.pos, ctx.player.pos);

    if (adjacentToPlayer(self, ctx)) {
      telegraphs.push({
        abilityId: "robber_pilfer",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Pilfer (-10 salt)",
        icon: "💰",
        telegraphType: "attack",
      });

      telegraphs.push({
        abilityId: "robber_smoke_bomb",
        targetTile: self.pos,
        targetUid: null,
        affectedTiles: [],
        label: "Smoke Bomb",
        icon: "💨",
        telegraphType: "special",
      });
    }

    const fleeDir = directionFromTo(ctx.player.pos, self.pos);
    if (fleeDir) {
      let fleeTarget = self.pos;
      for (let i = 0; i < 2; i++) {
        const next = posAdd(fleeTarget, DIR_DELTA[fleeDir]);
        if (posIsEmpty(next, ctx)) {
          fleeTarget = next;
        } else {
          break;
        }
      }
      if (!posEqual(fleeTarget, self.pos)) {
        telegraphs.push({
          abilityId: "move",
          targetTile: fleeTarget,
          targetUid: null,
          affectedTiles: [fleeTarget],
          label: "Sprint (flee)",
          icon: "🏃",
          telegraphType: "move",
        });
      }
    }

    if (dist <= 2) {
      telegraphs.push({
        abilityId: "drop_caltrops",
        targetTile: self.pos,
        targetUid: null,
        affectedTiles: [self.pos],
        label: "Drop Caltrops",
        icon: "📌",
        telegraphType: "special",
      });
    }

    return telegraphs;
  },
};

const GUTBORN_LARVA: GridEnemyTypeDef = {
  id: "gutborn_larva",
  name: "Gutborn Larva",
  ascii: "🪱",
  maxHp: 1,
  speedTier: "slow",
  loot: 2,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  passives: [{ type: "metamorphosis", turns: 2, transformInto: "ghoul" }],
  abilities: [],
  selectActions(self, _ctx) {
    return [
      {
        abilityId: SYNTHETIC_ABILITY_ID.metamorphosis,
        targetTile: null,
        targetUid: null,
        affectedTiles: [],
        label: `Growing... (${self.metamorphosisTimer ?? 2})`,
        icon: "🪱",
        telegraphType: "special",
      },
    ];
  },
  onDeath(self, _ctx) {
    return [{ type: "infected_adjacent", pos: self.pos, turns: 2 }];
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BOSS DEFINITIONS (Phase 8 will expand these significantly)
// ═══════════════════════════════════════════════════════════════════════════

const SKELETON_LORD: GridEnemyTypeDef = {
  id: "boss_skeleton_lord",
  name: "SKELETON LORD",
  ascii: "💀",
  maxHp: 50,
  speedTier: "medium",
  loot: 40,
  isBoss: true,
  incorporeal: false,
  defaultArmor: 2,
  defaultThorns: 2,
  resistances: { pierce: 0.75 },
  vulnerabilities: { bludgeoning: 1.25 },
  passives: [],
  abilities: [
    {
      id: "bone_storm",
      name: "Bone Storm",
      icon: "💀",
      targetType: "radius",
      range: 3,
      damage: 7,
      damageType: "bludgeoning",
      aoeRadius: 3,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "bone_storm", radius: 3 }],
    },
    {
      id: "rally_bones",
      name: "Rally Bones",
      icon: "💀",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "summon", enemyId: "skeleton", count: 3 }],
    },
    {
      id: "crushing_advance",
      name: "Crushing Advance",
      icon: "💀",
      targetType: "line",
      range: 3,
      damage: 10,
      damageType: "bludgeoning",
      aoeRadius: 0,
      pushDistance: 1,
      conditions: [],
      special: [],
    },
    {
      id: "bone_cage",
      name: "Bone Cage",
      icon: "🦴",
      targetType: "tile",
      range: 4,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "bone_cage" }],
    },
    {
      id: "bone_pillar",
      name: "Bone Pillar",
      icon: "🦴",
      targetType: "tile",
      range: 5,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "bone_pillar", damage: 4 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const phase2 = self.hp <= self.maxHp * 0.5;

    if (!phase2) {
      const stormTiles: GridPos[] = [];
      for (let dr = -3; dr <= 3; dr++) {
        for (let dc = -3; dc <= 3; dc++) {
          if (Math.abs(dr) + Math.abs(dc) <= 3 && !(dr === 0 && dc === 0)) {
            const p = { row: self.pos.row + dr, col: self.pos.col + dc };
            if (inBounds(p, ctx.grid.width, ctx.grid.height)) {
              stormTiles.push(p);
            }
          }
        }
      }

      telegraphs.push({
        abilityId: "bone_storm",
        targetTile: null,
        targetUid: null,
        affectedTiles: stormTiles,
        label: "Bone Storm",
        icon: "💀",
        telegraphType: "attack",
      });

      if (ctx.turn % 2 === 0) {
        telegraphs.push({
          abilityId: "rally_bones",
          targetTile: null,
          targetUid: null,
          affectedTiles: [],
          label: "Rally Bones",
          icon: "💀",
          telegraphType: "special",
        });
      }

      if (ctx.turn % 3 === 0) {
        telegraphs.push({
          abilityId: "bone_pillar",
          targetTile: ctx.player.pos,
          targetUid: null,
          affectedTiles: [ctx.player.pos],
          label: "Bone Pillar",
          icon: "🦴",
          telegraphType: "special",
        });
      }
    } else {
      telegraphs.push(...moveTowardPlayer(self, ctx, 2));

      const dir = directionFromTo(self.pos, ctx.player.pos) ?? "south";
      const lineTiles: GridPos[] = [];
      let cur = self.pos;
      for (let i = 0; i < 3; i++) {
        cur = posAdd(cur, DIR_DELTA[dir]);
        if (inBounds(cur, ctx.grid.width, ctx.grid.height)) {
          lineTiles.push(cur);
        }
      }

      telegraphs.push({
        abilityId: "crushing_advance",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: lineTiles,
        label: "Crushing Advance",
        icon: "💀",
        telegraphType: "attack",
      });

      if (ctx.turn % 3 === 0) {
        telegraphs.push({
          abilityId: "bone_cage",
          targetTile: ctx.player.pos,
          targetUid: null,
          affectedTiles: [ctx.player.pos],
          label: "Bone Cage",
          icon: "🦴",
          telegraphType: "special",
        });

        telegraphs.push({
          abilityId: "rally_bones",
          targetTile: null,
          targetUid: null,
          affectedTiles: [],
          label: "Rally Bones",
          icon: "💀",
          telegraphType: "special",
        });
      }
    }

    return telegraphs;
  },
};

const VAMPIRE_LORD: GridEnemyTypeDef = {
  id: "boss_vampire_lord",
  name: "VAMPIRE LORD",
  ascii: "🧛",
  maxHp: 55,
  speedTier: "fast",
  loot: 60,
  isBoss: true,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  passives: [
    { type: "lifesteal", fraction: 0.5 },
    { type: "shadow_cloak_in_dark", damageReduction: 0.5 },
    { type: "feast_heal_on_adjacent_kill" },
  ],
  abilities: [
    {
      id: "blood_rush",
      name: "Blood Rush",
      icon: "🧛",
      targetType: "tile",
      range: 8,
      damage: 9,
      damageType: null,
      aoeRadius: 1,
      pushDistance: 0,
      conditions: [{ condition: "burning", stacks: 2, target: "enemy" }],
      special: [{ type: "blood_rush_teleport" }, { type: "teleport_to_dark" }],
    },
    {
      id: "drain_life",
      name: "Drain Life",
      icon: "🩸",
      targetType: "tile",
      range: 5,
      damage: 7,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "lifesteal", fraction: 1.0 }],
    },
    {
      id: "eclipse",
      name: "Eclipse",
      icon: "🌑",
      targetType: "radius",
      range: 99,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "eclipse", turns: 2 }],
    },
    {
      id: "blood_puppet",
      name: "Blood Puppet",
      icon: "🩸",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "blood_puppet" }],
    },
    {
      id: "mist_form",
      name: "Mist Form",
      icon: "🌫️",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "mist_form", turns: 2 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const selfTile = getTile(ctx.grid, self.pos);
    const inDark = selfTile?.type === "dark_zone";
    const phase2 = self.hp <= self.maxHp * 0.5;

    if (ctx.turn % 3 === 0) {
      const allTiles: GridPos[] = [];
      for (let r = 0; r < ctx.grid.height; r++) {
        for (let c = 0; c < ctx.grid.width; c++) {
          allTiles.push({ row: r, col: c });
        }
      }
      telegraphs.push({
        abilityId: "eclipse",
        targetTile: null,
        targetUid: null,
        affectedTiles: allTiles,
        label: "Eclipse!",
        icon: "🌑",
        telegraphType: "special",
      });
    } else if (phase2 && ctx.turn % 4 === 0) {
      telegraphs.push({
        abilityId: "mist_form",
        targetTile: null,
        targetUid: null,
        affectedTiles: [],
        label: "Mist Form",
        icon: "🌫️",
        telegraphType: "special",
      });
    } else if (inDark) {
      const adjTiles: GridPos[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            const p = { row: ctx.player.pos.row + dr, col: ctx.player.pos.col + dc };
            if (inBounds(p, ctx.grid.width, ctx.grid.height)) {
              adjTiles.push(p);
            }
          }
        }
      }

      telegraphs.push({
        abilityId: "blood_rush",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: adjTiles,
        label: "Blood Rush",
        icon: "🧛",
        telegraphType: "attack",
      });
    } else {
      telegraphs.push({
        abilityId: "drain_life",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Drain Life",
        icon: "🩸",
        telegraphType: "attack",
      });
    }

    const hasMinions = ctx.enemies.some((e) => e.uid !== self.uid && e.hp > 0);
    if (hasMinions && self.hp < self.maxHp * 0.3) {
      telegraphs.push({
        abilityId: "blood_puppet",
        targetTile: null,
        targetUid: null,
        affectedTiles: [],
        label: "Blood Puppet",
        icon: "🩸",
        telegraphType: "special",
      });
    }

    return telegraphs;
  },
};

const LICH_KING: GridEnemyTypeDef = {
  id: "boss_lich",
  name: "THE LICH KING",
  ascii: "☠️",
  maxHp: 70,
  speedTier: "medium",
  loot: 80,
  isBoss: true,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  passives: [{ type: "shield_of_will_while_minions_live", armor: 5 }],
  abilities: [
    {
      id: "lich_dark_bolt",
      name: "Dark Bolt",
      icon: "⚡",
      targetType: "line",
      range: 8,
      damage: 10,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [{ condition: "burning", stacks: 1, target: "enemy" }],
      special: [],
    },
    {
      id: "mass_raise",
      name: "Mass Raise",
      icon: "💀",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "mass_raise_all", hpFraction: 0.3 }],
    },
    {
      id: "soul_drain",
      name: "Soul Drain",
      icon: "🌀",
      targetType: "radius",
      range: 99,
      damage: 4,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "soul_drain" }],
    },
    {
      id: "barrier_breach",
      name: "Barrier Breach",
      icon: "💥",
      targetType: "radius",
      range: 3,
      damage: 0,
      damageType: null,
      aoeRadius: 3,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "barrier_breach", radius: 3 }],
    },
    {
      id: "lich_gambit",
      name: "Lich's Gambit",
      icon: "☠️",
      targetType: "radius",
      range: 99,
      damage: 10,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [{ condition: "stunned", stacks: 1, target: "enemy" }],
      special: [{ type: "lich_gambit", damage: 10 }],
    },
    {
      id: "phylactery_shield",
      name: "Phylactery Shield",
      icon: "🛡️",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "phylactery_shield" }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const hpPct = self.hp / self.maxHp;

    if (hpPct > 0.66) {
      if (hasLineOfSight(ctx.grid, self.pos, ctx.player.pos)) {
        const dir = directionFromTo(self.pos, ctx.player.pos) ?? "south";
        const lineTiles: GridPos[] = [];
        let cur = self.pos;
        for (let i = 0; i < 8; i++) {
          cur = posAdd(cur, DIR_DELTA[dir]);
          if (!inBounds(cur, ctx.grid.width, ctx.grid.height)) {
            break;
          }
          lineTiles.push(cur);
        }

        telegraphs.push({
          abilityId: "lich_dark_bolt",
          targetTile: ctx.player.pos,
          targetUid: null,
          affectedTiles: lineTiles,
          label: "Dark Bolt",
          icon: "⚡",
          telegraphType: "attack",
        });
      }

      if (ctx.turn % 2 === 0 && ctx.deadEnemies.length > 0) {
        telegraphs.push({
          abilityId: "mass_raise",
          targetTile: null,
          targetUid: null,
          affectedTiles: [],
          label: "Mass Raise (ALL dead!)",
          icon: "💀",
          telegraphType: "special",
        });
      }
    } else if (hpPct > 0.33) {
      const allTiles: GridPos[] = [];
      for (let r = 0; r < ctx.grid.height; r++) {
        for (let c = 0; c < ctx.grid.width; c++) {
          allTiles.push({ row: r, col: c });
        }
      }

      telegraphs.push({
        abilityId: "soul_drain",
        targetTile: null,
        targetUid: null,
        affectedTiles: allTiles,
        label: "Soul Drain",
        icon: "🌀",
        telegraphType: "attack",
      });

      if (ctx.turn % 2 === 0) {
        telegraphs.push({
          abilityId: "barrier_breach",
          targetTile: self.pos,
          targetUid: null,
          affectedTiles: [],
          label: "Barrier Breach",
          icon: "💥",
          telegraphType: "special",
        });
      }

      if (ctx.turn % BALANCE.enemy.lichGambitInterval === 0) {
        telegraphs.push({
          abilityId: "lich_gambit",
          targetTile: null,
          targetUid: null,
          affectedTiles: allTiles,
          label: "Lich's Gambit (Stun to cancel!)",
          icon: "☠️",
          telegraphType: "attack",
        });
      }
    } else {
      if (ctx.turn % 2 === 0) {
        telegraphs.push({
          abilityId: "phylactery_shield",
          targetTile: null,
          targetUid: null,
          affectedTiles: [],
          label: "Phylactery Shield",
          icon: "🛡️",
          telegraphType: "special",
        });
      }

      if (hasLineOfSight(ctx.grid, self.pos, ctx.player.pos)) {
        const dir = directionFromTo(self.pos, ctx.player.pos) ?? "south";
        const lineTiles: GridPos[] = [];
        let cur = self.pos;
        for (let i = 0; i < 8; i++) {
          cur = posAdd(cur, DIR_DELTA[dir]);
          if (!inBounds(cur, ctx.grid.width, ctx.grid.height)) {
            break;
          }
          lineTiles.push(cur);
        }
        telegraphs.push({
          abilityId: "lich_dark_bolt",
          targetTile: ctx.player.pos,
          targetUid: null,
          affectedTiles: lineTiles,
          label: "Deathstrike",
          icon: "☠️",
          telegraphType: "attack",
        });
      }

      if (ctx.deadEnemies.length > 0) {
        telegraphs.push({
          abilityId: "mass_raise",
          targetTile: null,
          targetUid: null,
          affectedTiles: [],
          label: "Desperate Raise",
          icon: "💀",
          telegraphType: "special",
        });
      }
    }

    return telegraphs;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export const GRID_ENEMY_TYPES: readonly GridEnemyTypeDef[] = [
  RAT,
  SKELETON,
  HEAP_OF_BONES,
  ZOMBIE,
  GHOST,
  BANSHEE,
  NECROMANCER,
  GHOUL,
  SHADOW,
  FORSWORN,
  FALSE_SACRARIUM,
  SALT_REVENANT,
  GRAVE_ROBBER,
  GUTBORN_LARVA,
  SKELETON_LORD,
  VAMPIRE_LORD,
  LICH_KING,
];

export const GRID_ENEMY_TYPE_MAP: ReadonlyMap<string, GridEnemyTypeDef> = new Map(
  GRID_ENEMY_TYPES.map((e) => [e.id, e]),
);
