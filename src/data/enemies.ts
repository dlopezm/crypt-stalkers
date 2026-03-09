import type { EnemyType } from "../types";

export const ENEMY_TYPES: EnemyType[] = [
  {id:"rat",         name:"Ravager Rat",     maxHp:6,  atk:2,  loot:3,  ascii:"\u{1F400}",mechanic:"swarm",      mechanicDesc:"Each living rat deals 1 chip dmg/turn. Kill them fast.", defaultRow:"front",
    ai:{noiseAttract:true, roam:true, reproduce:true}},
  {id:"skeleton",    name:"Skeleton",        maxHp:16, atk:4,  loot:8,  ascii:"\u{1F480}",mechanic:"reassemble", mechanicDesc:"Revives at 5 HP unless killed with finishing weapon.", defaultRow:"front",
    ai:{roam:false}},
  {id:"zombie",      name:"Rotting Zombie",  maxHp:22, atk:5,  loot:12, ascii:"\u{1F9DF}",mechanic:"controlled", mechanicDesc:"Doubles ATK if Necromancer is alive. Kill necro first.", defaultRow:"front",
    ai:{noiseAttract:true, roam:true}},
  {id:"ghost",       name:"Mournful Ghost",  maxHp:14, atk:5,  loot:10, ascii:"\u{1F47B}",mechanic:"phase",      mechanicDesc:"50% evade vs physical. Holy always hits.",evadeChance:0.5, defaultRow:"front",
    ai:{lightFlee:true, roam:true}},
  {id:"vampire",     name:"Blood Wraith",    maxHp:20, atk:6,  loot:15, ascii:"\u{1F9DB}",mechanic:"lifesteal",  mechanicDesc:"Heals 50% of dmg dealt. Holy dmg \u00D71.5. Burst him down.", defaultRow:"front",
    ai:{lightFlee:true, roam:false}},
  {id:"banshee",     name:"Wailing Banshee", maxHp:14, atk:4,  loot:14, ascii:"\u{1F441}\uFE0F",mechanic:"drain_aura", mechanicDesc:"Applies Weaken each turn. Silence or kill fast.", defaultRow:"back",
    ai:{roam:false}},
  {id:"necromancer", name:"Necromancer",     maxHp:12, atk:3,  loot:25, ascii:"\u{1F9D9}",mechanic:"summon",     mechanicDesc:"Revives/summons a Zombie every 2 turns. Priority target.", defaultRow:"back",
    ai:{noiseAttract:false, sendScout:true}},
  {id:"ghoul",       name:"Lurking Ghoul",   maxHp:18, atk:4,  loot:12, ascii:"\u{1F9B4}",mechanic:"ambush",     mechanicDesc:"Crouches 2 turns, then LEAPS for 3\u00D7 damage.",ambushTurns:2, defaultRow:"front",
    ai:{roam:false}},
  {id:"shadow",      name:"The Shadow",      maxHp:16, atk:5,  loot:15, ascii:"\u{1F311}",mechanic:"light_drain",mechanicDesc:"Reduces light/turn. In darkness, take 3 dmg/turn.", defaultRow:"front",
    ai:{lightFlee:false, roam:true}},

  /* ── Bosses ── */
  {id:"boss_skeleton_lord", name:"SKELETON LORD", maxHp:35, atk:6, loot:40, ascii:"\u{1F480}", mechanic:"reassemble", mechanicDesc:"Revives at 10 HP once unless killed with finishing weapon.", isBoss:true, defaultRow:"front",
    ai:{roam:false}},
  {id:"boss_vampire_lord",  name:"VAMPIRE LORD",  maxHp:45, atk:7, loot:60, ascii:"\u{1F9DB}", mechanic:"lifesteal",  mechanicDesc:"Heals 50% of dmg dealt. Holy dmg \u00D71.5.", isBoss:true, defaultRow:"front",
    ai:{roam:false}},
  {id:"boss_lich",   name:"THE LICH KING",   maxHp:55, atk:8,  loot:80, ascii:"\u2620\uFE0F",mechanic:"boss",       mechanicDesc:"Raises fallen enemies each round. No mercy.",isBoss:true, defaultRow:"back",
    ai:{roam:false}},
];
