/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — Balance Constants
   ═══════════════════════════════════════════════════════════════════════════ */

export const LINE_BALANCE = {
  player: {
    baseAp: 4,
    movementApCost: 1, // 1 AP per slot moved
    consumableApCost: 1,
  },

  line: {
    defaultLength: 9,
    minLength: 7,
    maxLength: 9,
    wallSlamDamage: 2, // bludgeoning damage when pushed into a wall
    wallSlamStunTurns: 1,
    pitFallDamage: 999, // instakill for mortals
    pitFallDamageBoss: 20,
    rubbleMovementCostExtra: 1, // 1 extra AP on top of base 1
    saltDepositYieldPerTurn: 2,
  },

  conditions: {
    poisonDamagePerTurn: 3,
    burningDamagePerTurn: 2,
    rotTerrainDamagePerTurn: 1,
    hallowedGroundDamageUndead: 1,
    dirgeZoneDefaultDamage: 2,
    dirgeZoneDefaultApDrain: 1,
  },

  combat: {
    incorporealReduction: 0.5,
    darkEmpoweredBonusDamage: 3,
    darkEmpoweredBonusArmor: 2,
    ambushPredatorBonus: 3,
    formationArmorPerAlly: 1,
    swarmBonusPerAlly: 1,
    boneShieldWhileMinionsArmor: 3,
    forswornPerjuredArmorBonus: 2,
    lifeStealFraction: 1.0,
    shadowCloakDarkReduction: 0.5,
    graveRobberSaltSteal: 15,
    riposteDamage: 5,
    overwatchDefaultDamage: 5,
  },

  enemy: {
    reformTimerTurns: 2,
    metamorphosisTimerTurns: 2, // slightly faster in cramped 1D
    sacrariumSpawnInterval: 4,
    bansheeHymnInterval: 3,
    necromancerRaiseHpFraction: 0.5,
    lichGambitInterval: 3,
    lichGambitDamage: 10,
    vampireEclipseInterval: 3,
    sacrariumGrowthSlots: 2,
  },
} as const;
