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
      damage: 1,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "swarm_bonus", bonusDamage: 1 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];

    if (adjacentToPlayer(self, ctx)) {
      telegraphs.push(...meleeAttackAtPlayer(self, ctx, "rat_bite", "Bite", "🐀"));
    } else {
      telegraphs.push(...moveTowardPlayer(self, ctx, 2));
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
  passives: [{ type: "reform_on_non_bludgeoning" }],
  abilities: [
    {
      id: "skeleton_slash",
      name: "Slash",
      icon: "⚔️",
      targetType: "adjacent",
      range: 1,
      damage: 4,
      damageType: "slash",
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];

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
        abilityId: "reforming",
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
      damage: 2,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [{ condition: "immobilized", stacks: 1, target: "enemy" }],
      special: [{ type: "immobilize_both", turns: 1 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];

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
    }

    return telegraphs;
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
  passives: [{ type: "incorporeal_resistance" }],
  abilities: [
    {
      id: "ghost_chill_touch",
      name: "Chill Touch",
      icon: "❄️",
      targetType: "adjacent",
      range: 1,
      damage: 3,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [{ condition: "slowed", stacks: 1, target: "enemy" }],
      special: [{ type: "drain_ap", amount: 1 }],
    },
    {
      id: "ghost_spectral_wail",
      name: "Spectral Wail",
      icon: "😱",
      targetType: "ring",
      range: 2,
      damage: 2,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "drain_ap", amount: 1 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];

    const dist = manhattanDistance(self.pos, ctx.player.pos);

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

    if (adjacentToPlayer(self, ctx)) {
      telegraphs.push({
        abilityId: "ghost_chill_touch",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Chill Touch",
        icon: "❄️",
        telegraphType: "attack",
      });
    } else if (dist === 2) {
      const ringTiles: GridPos[] = [];
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (Math.abs(dr) + Math.abs(dc) === 2) {
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
      range: 3,
      damage: 0,
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
      damage: 1,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "silence", turns: 1 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];

    telegraphs.push(...moveTowardPlayer(self, ctx, 1));

    const useHymn = ctx.turn % 3 === 0;

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
    } else {
      const dir = directionFromTo(self.pos, ctx.player.pos) ?? "south";
      const coneTiles: GridPos[] = [];
      const delta = DIR_DELTA[dir];
      const perpDelta = delta.row === 0 ? { row: 1, col: 0 } : { row: 0, col: 1 };

      for (let d = 1; d <= 3; d++) {
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
  passives: [],
  abilities: [
    {
      id: "dark_bolt",
      name: "Dark Bolt",
      icon: "⚡",
      targetType: "line",
      range: 4,
      damage: 4,
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

    const hasCorpse = ctx.deadEnemies.length > 0;
    const hasZombie = ctx.enemies.some((e) => e.id === "zombie" && e.hp > 0);

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
    } else if (hasZombie && ctx.turn % 3 === 0) {
      const zombie = ctx.enemies.find((e) => e.id === "zombie" && e.hp > 0);
      if (zombie) {
        telegraphs.push({
          abilityId: "command",
          targetTile: zombie.pos,
          targetUid: zombie.uid,
          affectedTiles: [zombie.pos],
          label: `Command ${zombie.id}`,
          icon: "👆",
          telegraphType: "special",
        });
      }
    } else if (hasLineOfSight(ctx.grid, self.pos, ctx.player.pos)) {
      const dir = directionFromTo(self.pos, ctx.player.pos) ?? "south";
      const lineTiles: GridPos[] = [];
      let cur = self.pos;
      for (let i = 0; i < 4; i++) {
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
  passives: [{ type: "hidden_in_dark" }],
  abilities: [
    {
      id: "ghoul_pounce",
      name: "Pounce",
      icon: "🐾",
      targetType: "tile",
      range: 3,
      damage: 8,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
    {
      id: "ghoul_slash",
      name: "Slash",
      icon: "🐾",
      targetType: "adjacent",
      range: 1,
      damage: 5,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const isHidden = (self.conditions.hidden ?? 0) > 0;
    const dist = manhattanDistance(self.pos, ctx.player.pos);

    if (isHidden) {
      if (dist <= 3) {
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
      damage: 6,
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
      range: 2,
      damage: 0,
      damageType: null,
      aoeRadius: 2,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "spread_darkness", radius: 2, turns: 2 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const selfTile = getTile(ctx.grid, self.pos);
    const inDark = selfTile?.type === "dark_zone";

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
      telegraphs.push({
        abilityId: "shadow_strike",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Shadow Strike",
        icon: "🌑",
        telegraphType: "attack",
      });
    } else if (ctx.turn % 3 === 0) {
      const darkTiles: GridPos[] = [];
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (Math.abs(dr) + Math.abs(dc) <= 2) {
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
    } else {
      telegraphs.push(...moveTowardPlayer(self, ctx, 1));
    }

    return telegraphs;
  },
};

const BONEGUARD: GridEnemyTypeDef = {
  id: "boneguard",
  name: "Boneguard",
  ascii: "🛡️",
  maxHp: 20,
  speedTier: "slow",
  loot: 14,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: { slash: 0.5, pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5 },
  passives: [{ type: "shield_wall_aura" }],
  abilities: [
    {
      id: "boneguard_slam",
      name: "Shield Slam",
      icon: "🛡️",
      targetType: "adjacent",
      range: 1,
      damage: 3,
      damageType: "bludgeoning",
      aoeRadius: 0,
      pushDistance: 1,
      conditions: [],
      special: [],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const hasBackRow = ctx.enemies.some(
      (e) => e.uid !== self.uid && e.hp > 0 && (e.id === "necromancer" || e.id === "banshee"),
    );

    if (hasBackRow && ctx.turn % 2 === 0) {
      telegraphs.push({
        abilityId: "hold_position",
        targetTile: self.pos,
        targetUid: null,
        affectedTiles: [],
        label: "Hold Position (Armor 3)",
        icon: "🛡️",
        telegraphType: "buff",
      });
    } else if (adjacentToPlayer(self, ctx)) {
      telegraphs.push({
        abilityId: "boneguard_slam",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Shield Slam",
        icon: "🛡️",
        telegraphType: "attack",
      });
    } else {
      telegraphs.push(...moveTowardPlayer(self, ctx, 1));

      telegraphs.push({
        abilityId: "shield_wall",
        targetTile: self.pos,
        targetUid: null,
        affectedTiles: [],
        label: "Shield Wall",
        icon: "🛡️",
        telegraphType: "buff",
      });
    }

    return telegraphs;
  },
};

const BONE_HOUND: GridEnemyTypeDef = {
  id: "bone_hound",
  name: "Bone Hound",
  ascii: "🐺",
  maxHp: 8,
  speedTier: "very_fast",
  loot: 10,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: { bludgeoning: 1.5 },
  passives: [{ type: "pack_tactics", bonusDamagePerAdjacentAlly: 2 }],
  abilities: [
    {
      id: "hound_lunge",
      name: "Lunge",
      icon: "🐺",
      targetType: "adjacent",
      range: 1,
      damage: 4,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "pack_tactics", bonusDamage: 2 }],
    },
    {
      id: "hound_howl",
      name: "Howl",
      icon: "🐺",
      targetType: "self",
      range: 0,
      damage: 0,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "summon", enemyId: "skeleton", count: 1 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];

    telegraphs.push(...moveTowardPlayer(self, ctx, 3));

    if (adjacentToPlayer(self, ctx)) {
      telegraphs.push({
        abilityId: "hound_lunge",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Lunge",
        icon: "🐺",
        telegraphType: "attack",
      });
    }

    if (ctx.turn % 3 === 0) {
      const spawnPos = findEmptyAdjacent(self.pos, ctx);
      if (spawnPos) {
        telegraphs.push({
          abilityId: "hound_howl",
          targetTile: spawnPos,
          targetUid: null,
          affectedTiles: [spawnPos],
          label: "Howl (Summon)",
          icon: "🐺",
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
  maxHp: 16,
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
      damage: 3,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "immobilize_both", turns: 2 }],
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
      damage: 8,
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
          label: "Weep (Stun)",
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
          label: "Grapple",
          icon: "🤝",
          telegraphType: "attack",
        });
      }
    } else {
      telegraphs.push(...moveTowardPlayer(self, ctx, 1));
    }

    return telegraphs;
  },
  onDeath(_self, _ctx) {
    return [
      {
        type: "explode",
        radius: 1,
        damage: 3,
      },
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
      special: [{ type: "steal_salt", amount: 5 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];

    if (adjacentToPlayer(self, ctx)) {
      telegraphs.push({
        abilityId: "robber_pilfer",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Pilfer (-5 salt)",
        icon: "💰",
        telegraphType: "attack",
      });
    }

    const exitTile: GridPos = { row: 0, col: 0 };
    telegraphs.push({
      abilityId: "move",
      targetTile: exitTile,
      targetUid: null,
      affectedTiles: [exitTile],
      label: "Sprint (flee)",
      icon: "🏃",
      telegraphType: "move",
    });

    telegraphs.push({
      abilityId: "drop_caltrops",
      targetTile: self.pos,
      targetUid: null,
      affectedTiles: [self.pos],
      label: "Drop Caltrops",
      icon: "📌",
      telegraphType: "special",
    });

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
  passives: [{ type: "metamorphosis", turns: 3, transformInto: "ghoul" }],
  abilities: [],
  selectActions(self, _ctx) {
    return [
      {
        abilityId: "metamorphosis",
        targetTile: null,
        targetUid: null,
        affectedTiles: [],
        label: `Growing... (${self.metamorphosisTimer ?? 3})`,
        icon: "🪱",
        telegraphType: "special",
      },
    ];
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BOSS DEFINITIONS (Phase 8 will expand these significantly)
// ═══════════════════════════════════════════════════════════════════════════

const SKELETON_LORD: GridEnemyTypeDef = {
  id: "boss_skeleton_lord",
  name: "SKELETON LORD",
  ascii: "💀",
  maxHp: 40,
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
      range: 2,
      damage: 5,
      damageType: "bludgeoning",
      aoeRadius: 2,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "bone_storm", radius: 2 }],
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
      special: [{ type: "summon", enemyId: "skeleton", count: 2 }],
    },
    {
      id: "crushing_advance",
      name: "Crushing Advance",
      icon: "💀",
      targetType: "line",
      range: 2,
      damage: 8,
      damageType: "bludgeoning",
      aoeRadius: 0,
      pushDistance: 0,
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
      special: [],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const phase2 = self.hp <= self.maxHp * 0.5;

    if (!phase2) {
      const stormTiles: GridPos[] = [];
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (Math.abs(dr) + Math.abs(dc) <= 2 && !(dr === 0 && dc === 0)) {
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
    } else {
      telegraphs.push(...moveTowardPlayer(self, ctx, 2));

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
  maxHp: 45,
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
      damage: 7,
      damageType: null,
      aoeRadius: 1,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "blood_rush_teleport" }, { type: "teleport_to_dark" }],
    },
    {
      id: "drain_life",
      name: "Drain Life",
      icon: "🩸",
      targetType: "tile",
      range: 3,
      damage: 5,
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
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const selfTile = getTile(ctx.grid, self.pos);
    const inDark = selfTile?.type === "dark_zone";

    if (ctx.turn % 4 === 0) {
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

    return telegraphs;
  },
};

const LICH_KING: GridEnemyTypeDef = {
  id: "boss_lich",
  name: "THE LICH KING",
  ascii: "☠️",
  maxHp: 55,
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
      damage: 8,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
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
      special: [{ type: "mass_raise" }],
    },
    {
      id: "soul_drain",
      name: "Soul Drain",
      icon: "🌀",
      targetType: "radius",
      range: 99,
      damage: 2,
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
      damage: 8,
      damageType: null,
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [{ type: "lich_gambit", damage: 8 }],
    },
  ],
  selectActions(self, ctx) {
    const telegraphs: EnemyTelegraph[] = [];
    const hpPct = self.hp / self.maxHp;

    if (hpPct > 0.66) {
      // Phase 1: Commander
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

      if (ctx.turn % 2 === 0) {
        telegraphs.push({
          abilityId: "mass_raise",
          targetTile: null,
          targetUid: null,
          affectedTiles: [],
          label: "Mass Raise",
          icon: "💀",
          telegraphType: "special",
        });
      }
    } else if (hpPct > 0.33) {
      // Phase 2: Scholar
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

      if (ctx.turn % 3 === 0) {
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
      // Phase 3: The Question (combat pauses for dialogue)
      telegraphs.push({
        abilityId: "lich_dark_bolt",
        targetTile: ctx.player.pos,
        targetUid: null,
        affectedTiles: [ctx.player.pos],
        label: "Deathstrike",
        icon: "☠️",
        telegraphType: "attack",
      });

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
  BONEGUARD,
  BONE_HOUND,
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
