import {
  AMBUSH_DMG_MULT,
  ZOMBIE_EMPOWERED_ATK_MULT,
  LIFESTEAL_FRACTION,
  HOLY_VS_VAMPIRE_MULT,
  NECRO_SUMMON_COOLDOWN,
  NECRO_REVIVE_HP_FRAC,
  LICH_REVIVE_HP_FRAC,
  SKELETON_REASSEMBLE_HP,
  GHOST_PHASE_CHANCE,
  SHADOW_DARKNESS_DAMAGE,
  SALT_REVENANT_HP_THRESHOLD,
} from "../data/constants";
import type { CombatMechanics } from "../types";
import {
  selectRatIntent,
  selectSkeletonIntent,
  selectHeapIntent,
  selectZombieIntent,
  selectGhostIntent,
  selectBansheeIntent,
  selectNecromancerIntent,
  selectGhoulIntent,
  selectShadowIntent,
  selectVampireIntent,
  selectLichIntent,
  selectForswornIntent,
  selectFalseSacrariumIntent,
  selectSaltRevenantIntent,
} from "./intents";

export const ratMechanics: CombatMechanics = {
  selectIntent: selectRatIntent,
};

export const skeletonMechanics: CombatMechanics = {
  selectIntent: selectSkeletonIntent,
  onDeath(self, _ctx, killingHit) {
    if (killingHit.damageType === "bludgeoning") {
      return [
        { type: "log", message: `💀 ${self.name} shatters! The bones don't find their way back.` },
      ];
    }
    if (self.reassembled) {
      return [{ type: "log", message: `💀 ${self.name} crumbles - too broken to reform again.` }];
    }
    return [
      { type: "spawn", enemyId: "heap_of_bones", row: self.row, summonCooldown: 1 },
      { type: "log", message: `🦴 ${self.name} collapses into a heap - bones still twitching...` },
    ];
  },
};

export const heapOfBonesMechanics: CombatMechanics = {
  selectIntent: selectHeapIntent,
  onTurnStart(self, _ctx) {
    if (self.summonCooldown > 0) {
      self.summonCooldown -= 1;
      return [];
    }
    self.hp = 0;
    return [
      {
        type: "spawn",
        enemyId: "skeleton",
        row: self.row,
        reassembled: true,
        hpOverride: SKELETON_REASSEMBLE_HP,
      },
      { type: "log", message: "💀 Bones knit back together - a skeleton rises, weakened!" },
    ];
  },
  onDeath(_self, _ctx, killingHit) {
    if (killingHit.damageType === "bludgeoning") {
      return [{ type: "log", message: "🔨 The heap is crushed to powder. It won't reform." }];
    }
    return [];
  },
  onAttack() {
    return { skip: true };
  },
};

export const ghostMechanics: CombatMechanics = {
  selectIntent: selectGhostIntent,
  onReceiveHit(_self, _ctx, hit) {
    if (hit.holy) {
      return {};
    }
    if (Math.random() < GHOST_PHASE_CHANCE) {
      return { evade: true };
    }
    return {};
  },
};

export const vampireMechanics: CombatMechanics = {
  selectIntent: selectVampireIntent,
  onAttack() {
    return { lifestealFraction: LIFESTEAL_FRACTION };
  },
  onReceiveHit(_self, _ctx, hit) {
    return {
      damageMultiplier: hit.holy ? HOLY_VS_VAMPIRE_MULT : 1,
    };
  },
};

export const bansheeMechanics: CombatMechanics = {
  selectIntent: selectBansheeIntent,
  onTurnStart(self, ctx) {
    if ((self.statuses?.silence || 0) > 0) return [];
    const newStacks = (ctx.player.statuses.weaken || 0) + 1;
    return [
      { type: "apply_status_player", status: "weaken", stacks: 1 },
      {
        type: "log",
        message: `👁️ The banshee wails - your strength fades! Weaken ×${newStacks}`,
      },
    ];
  },
};

export const necromancerMechanics: CombatMechanics = {
  selectIntent: selectNecromancerIntent,
  onTurnStart(self, ctx) {
    self.summonCooldown = (self.summonCooldown || NECRO_SUMMON_COOLDOWN) - 1;
    if (self.summonCooldown > 0) return [];
    self.summonCooldown = NECRO_SUMMON_COOLDOWN;

    const dead = ctx.enemies.find(
      (e) => e.hp <= 0 && e.id !== "necromancer" && e.id !== "boss_lich",
    );
    if (dead) {
      dead.hp = Math.floor(dead.maxHp * NECRO_REVIVE_HP_FRAC);
      dead.statuses = {};
      dead.reassembled = false;
      dead.hidden = false;
      return [{ type: "log", message: `🧙 Dark energy flows - ${dead.name} staggers upright!` }];
    }
    return [
      { type: "spawn", enemyId: "zombie" },
      { type: "log", message: "🧙 The necromancer chants - a zombie claws up from the earth!" },
    ];
  },
};

export const zombieMechanics: CombatMechanics = {
  selectIntent: selectZombieIntent,
  onAttack(self, ctx) {
    const necroAlive = ctx.enemies.some((e) => e.id === "necromancer" && e.hp > 0);
    if (!necroAlive) return null;
    return {
      atkOverride: Math.floor(self.atk * ZOMBIE_EMPOWERED_ATK_MULT),
      extraActions: [
        { type: "log", message: `🧟 ${self.name}'s eyes glow - commanded by the Necromancer!` },
      ],
    };
  },
};

export const ghoulMechanics: CombatMechanics = {
  selectIntent: selectGhoulIntent,
  onStartCombat(self) {
    return [
      { type: "set_hidden", targetUid: self.uid, hidden: true },
      { type: "log", message: "Something lurks unseen in the darkness..." },
    ];
  },
  onAttack(self) {
    if (self.hidden) {
      return {
        damageMultiplier: AMBUSH_DMG_MULT,
        extraActions: [
          { type: "push_row", targetUid: self.uid, to: "front" as const },
          { type: "set_hidden", targetUid: self.uid, hidden: false },
          { type: "log", message: `🦴 ${self.name} LEAPS from the darkness!` },
        ],
      };
    }
    if (self.row === "front") {
      return {
        skip: true,
        extraActions: [
          { type: "push_row", targetUid: self.uid, to: "back" as const },
          { type: "log", message: `🦴 ${self.name} slinks back into the shadows...` },
        ],
      };
    }
    return {
      skip: true,
      extraActions: [
        { type: "set_hidden", targetUid: self.uid, hidden: true },
        { type: "log", message: `🦴 ${self.name} vanishes into the darkness...` },
      ],
    };
  },
};

export const shadowMechanics: CombatMechanics = {
  selectIntent: selectShadowIntent,
  onTurnStart(self, ctx) {
    const actions: import("../types").Action[] = [{ type: "drain_light", amount: 1 }];
    if (ctx.lightLevel.value <= 1) {
      actions.push({ type: "damage_player", amount: SHADOW_DARKNESS_DAMAGE });
      actions.push({
        type: "log",
        message: `🌑 ${self.name} feeds in the total darkness! -${SHADOW_DARKNESS_DAMAGE} HP`,
      });
    }
    return actions;
  },
};

export const lichMechanics: CombatMechanics = {
  selectIntent: selectLichIntent,
  onTurnStart(_self, ctx) {
    const dead = ctx.enemies.find((e) => e.hp <= 0 && e.id !== "boss_lich");
    if (!dead) return [];

    dead.hp = Math.floor(dead.maxHp * LICH_REVIVE_HP_FRAC);
    dead.statuses = {};
    dead.reassembled = false;
    dead.hidden = false;
    return [{ type: "log", message: `☠️ The Lich King gestures - ${dead.name} rises once more!` }];
  },
};

/* ── Forsworn: Oath-breaker Tank ── */

export const forswornMechanics: CombatMechanics = {
  selectIntent: selectForswornIntent,
  onAttack(self, ctx) {
    const backRowAllies = ctx.enemies.filter(
      (e) => e.hp > 0 && e.row === "back" && e.uid !== self.uid,
    );
    if (backRowAllies.length > 0) {
      return {
        skip: true,
        extraActions: [
          {
            type: "log",
            message: `⚔️ ${self.name} steps forward, compelled to shield its allies!`,
          },
        ],
      };
    }
    return null;
  },
  onReceiveHit() {
    return {};
  },
};

/* ── False Sacrarium: Growing Corruption ── */

export const falseSacrariumMechanics: CombatMechanics = {
  selectIntent: selectFalseSacrariumIntent,
};

/* ── Salt Revenant: Grappler/Thematic ── */

export const saltRevenantMechanics: CombatMechanics = {
  selectIntent: selectSaltRevenantIntent,
  onAttack(self, ctx) {
    if (ctx.player.hp <= ctx.player.maxHp * SALT_REVENANT_HP_THRESHOLD) {
      return {
        skip: true,
        extraActions: [
          { type: "log", message: `💎 ${self.name} weeps crystalline tears... salt rains down.` },
          { type: "apply_status_player", status: "stun", stacks: 1 },
        ],
      };
    }
    return {
      extraActions: [
        {
          type: "log",
          message: `🤝 ${self.name} grabs you with crystalline arms!`,
        },
        { type: "apply_status_player", status: "bleed", stacks: 1 },
      ],
    };
  },
  onDeath() {
    return [
      {
        type: "log",
        message: "💎 The revenant shatters - salt crystals scatter across the floor.",
      },
    ];
  },
};
