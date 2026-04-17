/* ═══════════════════════════════════════════════════════════════════════════
   Balance Constants — centralized tuning values for grid combat
   ═══════════════════════════════════════════════════════════════════════════ */

export const BALANCE = {
  player: {
    baseAp: 3,
    baseHp: 30,
    movementApCost: 1,
    consumableApCost: 1,
    maxConsumablesPerTurn: 1,
    weaponSwitchApCost: 1,
  },

  terrain: {
    pillarCollapseDamage: 3,
    mineCartDamage: 5,
    pitDamageNonBoss: 999,
    pitDamageBoss: 20,
    hazardDefaultDamage: 2,
    hallowedGroundDamagePerTurn: 3,
    brazierLightRadius: 2,
    poisonDamagePerTurn: 3,
    burningDamagePerTurn: 2,
    saltDepositSaltYield: 3,
  },

  combat: {
    incorporealPhysicalReduction: 0.5,
    swarmBonusDamagePerAlly: 1,
    packTacticsBonusPerAlly: 2,
    darkEmpoweredBonusDamage: 3,
    darkEmpoweredBonusArmor: 2,
    boneResonanceMaxStacks: 3,
    riposteDamage: 5,
    overwatchDefaultDamage: 5,
    backstabMultiplier: 1,
    flankingBonus: 2,
    commanderBonusDamage: 2,
  },

  progression: {
    startingSalt: 0,
    startingHp: 30,
    saltPerEnemyKill: 5,
  },

  enemy: {
    reformTimerTurns: 2,
    metamorphosisTimerTurns: 3,
    necromancerRaiseHpFraction: 0.5,
    graveRobberSaltSteal: 5,
    vampireLordEclipseInterval: 4,
    lichGambitInterval: 3,
    lichGambitDamage: 8,
    sacrariumSpawnInterval: 4,
    sacrariumGrowthTiles: 2,
    sacrariumLitanyRadius: 2,
    sacrariumLitanyDamage: 3,
    sacrariumRotDamage: 2,
    forswornStrikeDamage: 4,
    forswornInterceptArmorBonus: 2,
    forswornMarkReduction: 0.5,
    bansheeHymnInterval: 3,
  },
} as const;
