import {
  AMBUSH_DMG_MULT,
  ZOMBIE_EMPOWERED_ATK_MULT,
  LIFESTEAL_FRACTION,
  HOLY_VS_VAMPIRE_MULT,
  NECRO_SUMMON_COOLDOWN,
  NECRO_REVIVE_HP_FRAC,
  LICH_REVIVE_HP_FRAC,
} from "../data/constants";
import type { CombatMechanics } from "../types";

export const ratMechanics: CombatMechanics = {};

export const skeletonMechanics: CombatMechanics = {
  onDeath(self, _ctx, killingHit) {
    if (self.reassembled || killingHit.damageType === "bludgeoning") return [];
    return [
      { type: "spawn", enemyId: "heap_of_bones", row: self.row, summonCooldown: 1 },
      { type: "log", message: `\u{1F9B4} ${self.name} collapses into a heap of bones...` },
    ];
  },
};

export const heapOfBonesMechanics: CombatMechanics = {
  onTurnStart(self, _ctx) {
    if (self.summonCooldown > 0) {
      self.summonCooldown -= 1;
      return [];
    }
    self.hp = 0;
    return [
      { type: "spawn", enemyId: "skeleton", row: self.row, reassembled: true },
      { type: "log", message: "\u{1F480} A skeleton reassembles from the heap of bones!" },
    ];
  },
  onAttack() {
    return { skip: true };
  },
};

export const ghostMechanics: CombatMechanics = {
  onReceiveHit(self, _ctx, hit) {
    if (!hit.holy && Math.random() < (self.evadeChance ?? 0.5)) {
      return { evade: true };
    }
    return {};
  },
};

export const vampireMechanics: CombatMechanics = {
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
  onTurnStart(self, ctx) {
    if ((self.statuses?.silence || 0) > 0) return [];
    const newStacks = (ctx.player.statuses.weaken || 0) + 1;
    return [
      { type: "apply_status_player", status: "weaken", stacks: 1 },
      {
        type: "log",
        message: `\u{1F441}\uFE0F Banshee's wail weakens you! Weaken \u00D7${newStacks}`,
      },
    ];
  },
};

export const necromancerMechanics: CombatMechanics = {
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
      return [{ type: "log", message: `\u{1F9D9} Necro revives ${dead.name}!` }];
    }
    return [
      { type: "spawn", enemyId: "zombie" },
      { type: "log", message: "\u{1F9D9} Necro summons Zombie!" },
    ];
  },
};

export const zombieMechanics: CombatMechanics = {
  onAttack(self, ctx) {
    const necroAlive = ctx.enemies.some((e) => e.id === "necromancer" && e.hp > 0);
    if (!necroAlive) return null;
    return {
      atkOverride: Math.floor(self.atk * ZOMBIE_EMPOWERED_ATK_MULT),
      extraActions: [{ type: "log", message: `\u{1F9DF} ${self.name} empowered by Necromancer!` }],
    };
  },
};

export const ghoulMechanics: CombatMechanics = {
  onStartCombat(self) {
    return [{ type: "set_hidden", targetUid: self.uid, hidden: true }];
  },
  onAttack(self) {
    if (self.hidden) {
      // Leap from the shadows — engine handles reveal animation
      return {
        damageMultiplier: AMBUSH_DMG_MULT,
        extraActions: [
          { type: "push_row", targetUid: self.uid, to: "front" as const },
          { type: "set_hidden", targetUid: self.uid, hidden: false },
          { type: "log", message: `\u{1F9B4} ${self.name} LEAPS from the darkness!` },
        ],
      };
    }
    if (self.row === "front") {
      // Retreat to back row
      return {
        skip: true,
        extraActions: [
          { type: "push_row", targetUid: self.uid, to: "back" as const },
          { type: "log", message: `\u{1F9B4} ${self.name} slinks to the back...` },
        ],
      };
    }
    // Back row — hide
    return {
      skip: true,
      extraActions: [
        { type: "set_hidden", targetUid: self.uid, hidden: true },
        { type: "log", message: `\u{1F9B4} ${self.name} vanishes into the shadows...` },
      ],
    };
  },
};

export const shadowMechanics: CombatMechanics = {
  onTurnStart() {
    return [{ type: "drain_light", amount: 1 }];
  },
};

export const lichMechanics: CombatMechanics = {
  onTurnStart(_self, ctx) {
    const dead = ctx.enemies.find((e) => e.hp <= 0 && e.id !== "boss_lich");
    if (!dead) return [];
    dead.hp = Math.floor(dead.maxHp * LICH_REVIVE_HP_FRAC);
    dead.statuses = {};
    dead.reassembled = false;
    dead.hidden = false;
    return [{ type: "log", message: `\u2620\uFE0F Lich King raises ${dead.name}!` }];
  },
};
