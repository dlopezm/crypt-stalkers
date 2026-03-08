import type { CardTemplate } from "../types";

export const ALL_CARDS: CardTemplate[] = [
  {id:"slash",       name:"Slash",          cost:1,type:"attack", value:8,  desc:"Deal 8 damage.",                        color:"#c0392b"},
  {id:"bash",        name:"Heavy Bash",      cost:2,type:"attack", value:14, desc:"Deal 14 damage.",                       color:"#c0392b"},
  {id:"shield",      name:"Iron Ward",       cost:1,type:"defend", value:7,  desc:"Gain 7 Block.",                         color:"#2980b9"},
  {id:"bulwark",     name:"Bulwark",         cost:2,type:"defend", value:13, desc:"Gain 13 Block.",                        color:"#2980b9"},
  {id:"fortify",     name:"Fortify",         cost:0,type:"defend", value:4,  desc:"Gain 4 Block. Free.",                   color:"#27ae60"},
  {id:"swift",       name:"Swift Cut",       cost:1,type:"attack", value:10, desc:"Deal 10 damage.",                       color:"#c0392b"},
  {id:"meditate",    name:"Meditate",        cost:1,type:"skill",  value:0,  desc:"Draw 2 cards.",                         color:"#7f8c8d",draw:2},
  {id:"drain",       name:"Soul Drain",      cost:1,type:"attack", value:6,  desc:"Deal 6 dmg, heal 3.",                  color:"#8e44ad",heal:3},
  {id:"hexbolt",     name:"Hex Bolt",        cost:1,type:"attack", value:5,  desc:"Deal 5 dmg + Weaken foe.",             color:"#16a085",applyStatus:{target:"enemy",status:"weaken",stacks:2}},
  {id:"cleave",      name:"Cleave",          cost:2,type:"attack", value:8,  desc:"Deal 8 dmg to ALL enemies.",            color:"#c0392b",aoe:true},
  {id:"backstab",    name:"Backstab",        cost:1,type:"attack", value:16, desc:"Deal 16 dmg. Exhaust.",                color:"#8e44ad",exhaust:true},
  {id:"bloodlust",   name:"Bloodlust",       cost:2,type:"attack", value:12, desc:"12 dmg, heal dmg dealt.",              color:"#c0392b",healOnHit:true},
  {id:"stonewall",   name:"Stone Wall",      cost:2,type:"defend", value:18, desc:"Gain 18 Block.",                       color:"#2980b9"},
  {id:"refocus",     name:"Refocus",         cost:0,type:"skill",  value:0,  desc:"Gain 1 Energy. Exhaust.",              color:"#f0c040",gainEnergy:1,exhaust:true},
  {id:"envenom",     name:"Envenom",         cost:1,type:"skill",  value:0,  desc:"Apply 3 Poison to target.",            color:"#27ae60",applyStatus:{target:"enemy",status:"poison",stacks:3}},
  {id:"blind_dust",  name:"Blind Dust",      cost:1,type:"skill",  value:0,  desc:"Blind target 3 turns.",               color:"#7f8c8d",applyStatus:{target:"enemy",status:"blind",stacks:3}},
  {id:"sunder",      name:"Sunder",          cost:2,type:"attack", value:10, desc:"10 dmg + Bleed 3.",                   color:"#c0392b",applyStatus:{target:"enemy",status:"bleed",stacks:3}},
  {id:"power_word",  name:"Power Word",      cost:2,type:"skill",  value:0,  desc:"Stun target 1 turn.",                  color:"#f1c40f",applyStatus:{target:"enemy",status:"stun",stacks:1}},
  {id:"holy_water",  name:"Holy Water",      cost:1,type:"attack", value:20, desc:"20 holy dmg. +50% vs Vampire.",        color:"#e67e22",holy:true},
  {id:"smite",       name:"Holy Smite",      cost:2,type:"attack", value:18, desc:"18 holy dmg. Always hits Ghosts.",     color:"#e67e22",holy:true},
  {id:"silence_bell",name:"Bell of Silence", cost:1,type:"skill",  value:0,  desc:"Silence target 2t. Stops Banshee.",   color:"#8e44ad",applyStatus:{target:"enemy",status:"silence",stacks:2}},
  {id:"burst_strike",name:"Burst Strike",    cost:2,type:"attack", value:22, desc:"22 dmg. Permanently kills Skeleton.", color:"#c0392b",finishing:true},
  {id:"mass_smite",  name:"Mass Smite",      cost:3,type:"attack", value:7,  desc:"7 dmg ALL. Great vs rat swarms.",     color:"#c0392b",aoe:true},
  {id:"dispel",      name:"Dispel",          cost:1,type:"skill",  value:0,  desc:"Remove all your debuffs.",             color:"#27ae60",cleanse:true},
];

export const STARTER_IDS = ["slash","slash","slash","shield","shield","fortify","swift","bash","drain","hexbolt","meditate"];
export const REWARD_POOL = ALL_CARDS.filter(c => !STARTER_IDS.includes(c.id));
