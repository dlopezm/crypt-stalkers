import type { EnemyType } from "../types";

export const ENEMY_TYPES: EnemyType[] = [
  {id:"rat",         name:"Ravager Rat",     maxHp:8,  atk:3,  loot:4,  ascii:"\u{1F400}",mechanic:"swarm",      mechanicDesc:"Each living rat deals 1 chip dmg/turn. Kill them fast.",
    ai:{noiseAttract:true, roam:true, reproduce:true}},
  {id:"skeleton",    name:"Skeleton",        maxHp:28, atk:7,  loot:12, ascii:"\u{1F480}",mechanic:"reassemble", mechanicDesc:"Revives at 5 HP unless killed with 10+ dmg. Use Burst Strike.",
    ai:{roam:false}},
  {id:"zombie",      name:"Rotting Zombie",  maxHp:40, atk:9,  loot:18, ascii:"\u{1F9DF}",mechanic:"controlled", mechanicDesc:"Doubles ATK if Necromancer is alive. Kill necro first.",
    ai:{noiseAttract:true, roam:true}},
  {id:"ghost",       name:"Mournful Ghost",  maxHp:22, atk:12, loot:15, ascii:"\u{1F47B}",mechanic:"phase",      mechanicDesc:"50% evade vs physical. Holy cards always hit.",evadeChance:0.5,
    ai:{lightFlee:true, roam:true}},
  {id:"vampire",     name:"Blood Wraith",    maxHp:30, atk:10, loot:20, ascii:"\u{1F9DB}",mechanic:"lifesteal",  mechanicDesc:"Heals 50% of dmg dealt. Holy dmg \u00D71.5. Burst him down.",
    ai:{lightFlee:true, roam:false}},
  {id:"banshee",     name:"Wailing Banshee", maxHp:22, atk:8,  loot:18, ascii:"\u{1F441}\uFE0F",mechanic:"drain_aura", mechanicDesc:"Drains 1 max energy/turn (min 1). Silence or kill fast.",
    ai:{roam:false}},
  {id:"necromancer", name:"Necromancer",     maxHp:20, atk:6,  loot:35, ascii:"\u{1F9D9}",mechanic:"summon",     mechanicDesc:"Revives/summons a Zombie every 2 turns. He's priority 1.",
    ai:{noiseAttract:false, sendScout:true}},
  {id:"ghoul",       name:"Lurking Ghoul",   maxHp:32, atk:6,  loot:16, ascii:"\u{1F9B4}",mechanic:"ambush",     mechanicDesc:"Crouches 2 turns, then LEAPS for 3\u00D7 damage.",ambushTurns:2,
    ai:{roam:false}},
  {id:"shadow",      name:"The Shadow",      maxHp:25, atk:11, loot:20, ascii:"\u{1F311}",mechanic:"light_drain",mechanicDesc:"Reduces light/turn. In darkness, you discard a card.",
    ai:{lightFlee:false, roam:true}},
  {id:"boss_lich",   name:"THE LICH KING",   maxHp:90, atk:15, loot:80, ascii:"\u2620\uFE0F",mechanic:"boss",       mechanicDesc:"Raises fallen enemies each round. No mercy.",isBoss:true,
    ai:{roam:false}},
];
