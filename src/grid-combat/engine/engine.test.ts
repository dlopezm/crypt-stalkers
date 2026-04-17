import { describe, expect, it } from "vitest";
import type {
  GridAbility,
  GridCombatState,
  GridEnemyState,
  GridEnemyTypeDef,
  GridPlayerState,
  TacticalGrid,
  TerrainTile,
  TimelineEntry,
} from "../types";
import { makeFloor } from "../types";
import { executeTimeline } from "./index";
import { nextEntryId } from "./insertion";
import { SYNTHETIC_ABILITY_ID } from "./types";

function makeGrid(width: number, height: number): TacticalGrid {
  const tiles: TerrainTile[][] = [];
  for (let r = 0; r < height; r++) {
    const row: TerrainTile[] = [];
    for (let c = 0; c < width; c++) {
      row.push(makeFloor());
    }
    tiles.push(row);
  }
  return { width, height, tiles };
}

function makePlayer(overrides: Partial<GridPlayerState> = {}): GridPlayerState {
  return {
    hp: 30,
    maxHp: 30,
    salt: 0,
    pos: { row: 0, col: 0 },
    ap: 3,
    maxAp: 3,
    conditions: {},
    armor: 0,
    thorns: 0,
    mainWeaponId: "test_weapon",
    offhandId: null,
    armorId: "test_armor",
    consumables: [],
    abilityCooldowns: {},
    boneResonanceStacks: 0,
    overwatchTile: null,
    overwatchDamage: 0,
    riposteActive: false,
    guardDamageReduction: 0,
    braceNegateActive: false,
    blockFirstHitReduction: 0,
    ...overrides,
  };
}

function makeEnemy(overrides: Partial<GridEnemyState> & { uid: string }): GridEnemyState {
  return {
    id: "test_enemy",
    hp: 10,
    maxHp: 10,
    pos: { row: 2, col: 2 },
    facing: "south",
    conditions: {},
    armor: 0,
    thorns: 0,
    isBoss: false,
    incorporeal: false,
    shieldWallActive: false,
    reformTimer: null,
    metamorphosisTimer: null,
    metamorphosisTarget: null,
    resistances: {},
    vulnerabilities: {},
    ...overrides,
  };
}

function makeState(
  player: GridPlayerState,
  enemies: readonly GridEnemyState[],
  timeline: readonly TimelineEntry[] = [],
): GridCombatState {
  return {
    grid: makeGrid(5, 5),
    player,
    enemies,
    timeline,
    playerInsertions: [],
    turn: 1,
    phase: "execution",
    combatLog: [],
    deadEnemyPositions: [],
    objectiveType: "kill_all",
    objectiveState: null,
  };
}

function timelineEntry(
  partial: Partial<TimelineEntry> & Pick<TimelineEntry, "owner" | "abilityId">,
): TimelineEntry {
  return {
    id: nextEntryId(),
    targetTile: null,
    targetUid: null,
    affectedTiles: [],
    label: "test",
    icon: "•",
    insertionIndex: 0,
    telegraphType: "attack",
    ...partial,
  };
}

const BITER_DEF: GridEnemyTypeDef = {
  id: "biter",
  name: "Biter",
  ascii: "b",
  maxHp: 10,
  speedTier: "medium",
  loot: 0,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  abilities: [
    {
      id: "bite",
      name: "Bite",
      icon: "🦷",
      targetType: "adjacent",
      range: 1,
      damage: 5,
      damageType: "pierce",
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
  ],
  selectActions: () => [],
  passives: [],
};

// Exploder's onDeath blasts radius 1 for 4 — used to verify onDeath fires
// through the "friendly fire" / "pit" / "minecart" / "sidestep" kill paths
// where handleEnemyDeath previously wasn't receiving enemyDefs.
const EXPLODER_DEF: GridEnemyTypeDef = {
  id: "exploder",
  name: "Exploder",
  ascii: "x",
  maxHp: 4,
  speedTier: "medium",
  loot: 0,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  abilities: [
    {
      id: "tackle",
      name: "Tackle",
      icon: "💢",
      targetType: "adjacent",
      range: 1,
      damage: 2,
      damageType: "bludgeoning",
      aoeRadius: 0,
      pushDistance: 0,
      conditions: [],
      special: [],
    },
  ],
  selectActions: () => [],
  passives: [],
  onDeath: () => [{ type: "explode", radius: 1, damage: 4 }],
};

const SHAMBLER_DEF: GridEnemyTypeDef = {
  id: "shambler",
  name: "Shambler",
  ascii: "S",
  maxHp: 24,
  speedTier: "slow",
  loot: 0,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 1,
  defaultThorns: 0,
  resistances: {},
  vulnerabilities: {},
  abilities: [],
  selectActions: () => [],
  passives: [],
};

const SLASH_ABILITY: GridAbility = {
  id: "slash",
  name: "Slash",
  desc: "",
  apCost: 1,
  cooldown: 0,
  range: 1,
  targetType: "adjacent",
  damageType: "slash",
  baseDamage: 6,
  aoeRadius: 0,
  pushDistance: 0,
  conditions: [],
  special: [],
  requiresBehindTarget: false,
  requiresLOS: false,
  silenceBlocked: false,
  moveSelfDistance: 0,
  moveSelfDirection: null,
};

const enemyDefs = new Map<string, GridEnemyTypeDef>([
  [BITER_DEF.id, BITER_DEF],
  [EXPLODER_DEF.id, EXPLODER_DEF],
  [SHAMBLER_DEF.id, SHAMBLER_DEF],
]);

const playerAbilities = new Map<string, GridAbility>([[SLASH_ABILITY.id, SLASH_ABILITY]]);

describe("executeTimeline", () => {
  it("player slash kills an adjacent enemy and transitions to victory", () => {
    const player = makePlayer({ pos: { row: 2, col: 2 } });
    const enemy = makeEnemy({ uid: "e1", id: "biter", hp: 5, pos: { row: 2, col: 3 } });
    const entry = timelineEntry({
      owner: { type: "player" },
      abilityId: "slash",
      targetTile: enemy.pos,
      targetUid: enemy.uid,
    });
    const state = makeState(player, [enemy], [entry]);

    const result = executeTimeline(state, enemyDefs, playerAbilities);

    expect(result.state.enemies[0].hp).toBe(0);
    expect(result.state.phase).toBe("victory");
    expect(result.state.player.salt).toBeGreaterThan(0);
  });

  it("enemy bite damages the player through adjacent tile", () => {
    const player = makePlayer({ pos: { row: 2, col: 2 }, hp: 20 });
    const enemy = makeEnemy({ uid: "e1", id: "biter", pos: { row: 2, col: 3 } });
    const entry = timelineEntry({
      owner: { type: "enemy", uid: enemy.uid },
      abilityId: "bite",
      targetTile: player.pos,
      affectedTiles: [player.pos],
    });
    const state = makeState(player, [enemy], [entry]);

    const result = executeTimeline(state, enemyDefs, playerAbilities);

    expect(result.state.player.hp).toBe(15);
  });

  it("player-killed exploder triggers onDeath explosion damaging adjacent enemy", () => {
    // Regression for #1: handleEnemyDeath must receive enemyDefs so onDeath runs.
    const player = makePlayer({ pos: { row: 2, col: 2 } });
    const exploder = makeEnemy({ uid: "ex", id: "exploder", hp: 2, pos: { row: 2, col: 3 } });
    const neighbor = makeEnemy({ uid: "nb", id: "biter", hp: 10, pos: { row: 2, col: 4 } });

    const entry = timelineEntry({
      owner: { type: "player" },
      abilityId: "slash",
      targetTile: exploder.pos,
      targetUid: exploder.uid,
    });
    const state = makeState(player, [exploder, neighbor], [entry]);

    const result = executeTimeline(state, enemyDefs, playerAbilities);

    const ex = result.state.enemies.find((e) => e.uid === "ex")!;
    const nb = result.state.enemies.find((e) => e.uid === "nb")!;
    expect(ex.hp).toBe(0);
    expect(nb.hp).toBe(6); // 10 - 4 explosion
  });

  it("stunned synthetic telegraph does not execute the ability", () => {
    const player = makePlayer({ pos: { row: 2, col: 2 }, hp: 20 });
    const enemy = makeEnemy({
      uid: "e1",
      id: "biter",
      pos: { row: 2, col: 3 },
      conditions: { stunned: 1 },
    });
    const entry = timelineEntry({
      owner: { type: "enemy", uid: enemy.uid },
      abilityId: SYNTHETIC_ABILITY_ID.stunned,
    });
    const state = makeState(player, [enemy], [entry]);

    const result = executeTimeline(state, enemyDefs, playerAbilities);

    expect(result.state.player.hp).toBe(20);
    expect(result.log.some((e) => e.text.includes("stunned"))).toBe(true);
  });

  it("metamorphosis tick transforms enemy into the target def with its maxHp", () => {
    // Regression for #6: transform must inherit target def's maxHp, not hardcode 12.
    const player = makePlayer({ pos: { row: 0, col: 0 } });
    const larva = makeEnemy({
      uid: "larva",
      id: "biter",
      hp: 4,
      maxHp: 4,
      pos: { row: 3, col: 3 },
      metamorphosisTimer: 1,
      metamorphosisTarget: "shambler",
    });
    const entry = timelineEntry({
      owner: { type: "enemy", uid: larva.uid },
      abilityId: SYNTHETIC_ABILITY_ID.metamorphosis,
    });
    const state = makeState(player, [larva], [entry]);

    const result = executeTimeline(state, enemyDefs, playerAbilities);

    const transformed = result.state.enemies[0];
    expect(transformed.id).toBe("shambler");
    expect(transformed.maxHp).toBe(SHAMBLER_DEF.maxHp);
    expect(transformed.hp).toBe(SHAMBLER_DEF.maxHp);
    expect(transformed.armor).toBe(SHAMBLER_DEF.defaultArmor);
  });

  it("mid-turn armor buff survives end-of-turn passive reset", () => {
    // Regression for #2: applyEnemyPassives previously overwrote armor gained
    // from gain_armor / hold_position_armor / mist_form specials.
    const player = makePlayer({ pos: { row: 0, col: 0 } });
    const enemy = makeEnemy({
      uid: "e1",
      id: "shambler", // defaultArmor 1
      pos: { row: 4, col: 4 },
      armor: 8, // simulates a mid-turn buff (e.g. from phylactery_shield)
    });
    const state = makeState(player, [enemy], []);

    const result = executeTimeline(state, enemyDefs, playerAbilities);

    // Empty timeline still triggers end-of-turn cleanup.
    expect(result.state.enemies[0].armor).toBe(8);
  });
});
