import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Testing Grounds
 *
 * Generated/edited via the in-game Authored Area Editor.
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 */

// prettier-ignore
const A1_TESTING_GROUNDS_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  9,  9,  1,  1,  1,  1,  5,  5,  1,  8,  8,  1, 10, 10,  1, 12, 12,  1,  1], //  1
  [ 1,  9,  9,  1,  1,  1,  1,  5,  5,  1,  8,  8,  1, 10, 10,  1, 12, 12,  1,  1], //  2
  [ 1,  1,  0,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1], //  3
  [ 1,  2,  2,  0,  3,  3,  0,  4,  4,  0,  6,  6,  0,  7,  7,  0, 11, 11,  0,  0], //  4
  [ 1,  2,  2,  1,  3,  3,  1,  4,  4,  1,  6,  6,  1,  7,  7,  1, 11, 11,  1,  0], //  5
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0], //  6
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 18, 18,  1, 16, 16,  1, 14, 14,  1,  0], //  7
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 18, 18,  1, 16, 16,  1, 14, 14,  1,  0], //  8
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0], //  9
  [ 1, 21, 21,  0, 20, 20,  0, 19, 19,  0, 17, 17,  0, 15, 15,  0, 13, 13,  0,  0], // 10
  [ 1, 21, 21,  1, 20, 20,  1, 19, 19,  1, 17, 17,  1, 15, 15,  1, 13, 13,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 15
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 17
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 18
];

export const A1_TESTING_GROUNDS_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Game start",
    hint: "green light tubes the ceiling like veins. iron shines slick and false; your shadow looks thin.",
    description:
      "Corridor opens wide - cracked plaster over older stone, green coldfire strips along the vault. Iron picks up the green glow. Footsteps echo; sometimes a faint buzz from the salt on the deep-facing walls.",
    enemies: [],
    isStart: true,
    notes: `R12. Era 1 + coldfire. FIRST skeleton fight. Teaches damage-type gating: dagger pierce resisted, need bludgeoning (Pick). Shielded Stance (Armor 2 every other turn) teaches timing. Bone Thorns teach Unaware value.`,
  },
  3: {
    label: "Rats",
    hint: "shoulder-wide; rubble underfoot. names and marks gouged in the wall - a headless figure of carved salt stares from its niche.",
    description:
      "Shoulder-wide cut, loose rubble underfoot, raw seam where plaster never reached. Pitch black without your light; breath fogs; water dripping ahead.",
    enemies: ["rat", "rat", "rat"],
    notes: `R13. Era 1. DARK. Dead end. ⚔ RAT ×3. Teaches value of AoE (Cleave, Flare, Bone Splinter). Chain Hauberk Armor 2 = all hits do 0. MINING PICK reward — enables skeleton kills in R15+.`,
  },
  4: {
    label: "Zombies",
    hint: "new iron scratches on old stone. a plaque: SEALED BY DECREE - someone chipped around it anyway.",
    description:
      "Old cart scratches on stone; fresher tool marks at a breach beside a sealed-by-decree plaque. Thin cold air; iron lintel scratched and worn bright in patches.",
    enemies: ["rat", "rat", "zombie", "zombie"],
    notes: `R14. Era 1 + recent breach. DARK. Mira escape vector; risky exploration without flame.`,
  },
  5: {
    label: "Get Pickaxe",
    hint: "vaulted roof; four ways to regret. a splintered board still names Chapel, Library, Quarters - deeper in.",
    description:
      "Four-way junction under a high vault - salt-block ribs, cracked signboards, green coldfire on everything. Echoes pile up. Drafts pull dust from the plaster seams.",
    enemies: [],
    notes: `R15. COLDFIRE. Central chokepoint. No enemies yet — pickaxe pickup room. Future: ⚔ SKELETON ×2 + ZOMBIE — formation teaching fight. Teaches prioritization: zombie = slow but tanky, skeleton = fragile but reforms.`,
    props: [
      {
        id: "tg_pickaxe",
        label: "Heavy Pickaxe",
        icon: "⛏️",
        desc: "Two-handed mining pick, iron head, dense enough to crack bone and stone alike.",
        gridPosition: { row: 4, col: 7 },
        actions: [
          {
            id: "take",
            label: "Take it",
            effects: [
              { type: "grant_weapon", weaponId: "pickaxe" },
              { type: "consume_prop" },
              { type: "log", message: "Pickaxe added to your loadout." },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Skeletons + Zombie",
    hint: "bone sentries slump as if between rounds that never end. one mace on the rack forgot to rust through.",
    description:
      "Side room: weapon rack, bench, corners where the green light thins. Steady coldfire glow. Oil smell, grit on the air.",
    enemies: ["skeleton", "skeleton", "zombie"],
    notes: `R16. COLDFIRE. Dead end. ⚔ SKELETON ×2 — multi-skeleton fight. Tests weapon choice: Pick ideal (bludgeoning). Shielded stance timing with two enemies.`,
  },
  7: {
    label: "Zombie + Necro",
    hint: "a slab of dressed salt big as a house front. lever, palm hollow, and gouges beside a slot - like someone tried to write a tune in stone.",
    description:
      "Corridor ends at a huge dressed-salt slab - shallow flame reliefs picked out green by the strips overhead. Lever, worn hand hollow, narrow slot. Lean in and a low vibration comes through the stone into your jaw and hands.",
    enemies: ["zombie", "zombie", "zombie", "necromancer"],
    notes: `R17. COLDFIRE. PROGRESSION GATE to Area 2. ⚔ ZOMBIE ×3 + NECROMANCER — Area 1 climax fight. Tests everything learned: damage types, mixed types, timing, Thorns interaction.`,
  },
  8: {
    label: "Get Main Gauche",
    hint: "carved pocket in the wall; brasswork black with cold. faceted salt winks back at torch or tinder.",
    description:
      "Wall niche off the gate - blackened brass, faceted salt glass in the rim that splinters torchlight. Dark until lit; then heat and a small dry pocket of air.",
    enemies: [],
    notes: `R18. Era 2. DARK. Dead end. When LIT: true-light safe zone R17–R18; skeleton patrols redirect - tactical map shift.`,
    props: [
      {
        id: "tg_main_gauche",
        label: "Main Gauche",
        icon: "🗡️",
        desc: "A slender parrying dagger — catch a blade on the bars, answer with the point.",
        gridPosition: { row: 1, col: 7 },
        actions: [
          {
            id: "take",
            label: "Take it",
            effects: [
              { type: "grant_offhand", offhandId: "main_gauche" },
              { type: "consume_prop" },
              { type: "log", message: "Main Gauche added to your loadout." },
            ],
          },
        ],
      },
    ],
  },
  9: {
    label: "To Mine Mouth",
    hint: "air turns a fraction warmer toward the sun-cut entrance.",
    description: "Air warms slightly toward the sunlit entrance.",
    enemies: [],
    exit: { toAreaId: "a1_mine_mouth", toRoomGridId: 2 },
  },
  10: {
    label: "To Excursion Warrens",
    hint: "props and clawed earth - a newer bite someone dug without asking. the passage ahead is blocked.",
    description:
      "Plaster ends; clawed earth and new timber shoring - a fresh dig. The way forward is caved in.",
    enemies: [],
    notes: "Stub. Needs exit to Excursion Warrens area once that area exists.",
  },
  11: {
    label: "Ghouls",
    hint: "Ashvere iron ahead; the words on the lock will be the ones over the arch.",
    description: "Ashvere iron door frame - heavier metal than the gallery work around it.",
    enemies: ["ghoul", "ghoul", "rat", "rat"],
  },
  12: {
    label: "Get Shout",
    hint: "beyond the gate, the order's deep domain waits.",
    description: "Past the gate: dressed salt, colder air, very little sound.",
    enemies: [],
    props: [
      {
        id: "tg_battle_cries",
        label: "Battle Cries",
        icon: "📯",
        desc: "A scroll of martial shouts — bolsters, demoralizes, breaks formations.",
        gridPosition: { row: 1, col: 13 },
        actions: [
          {
            id: "take",
            label: "Learn it",
            effects: [
              { type: "grant_ability", abilityId: "battle_cries" },
              { type: "consume_prop" },
              { type: "log", message: "Battle Cries ability learned." },
            ],
          },
        ],
      },
    ],
  },
  13: {
    label: "Shadows",
    hint: "",
    enemies: ["shadow", "shadow", "shadow"],
  },
  14: {
    label: "Get Claymore",
    hint: "",
    enemies: [],
    props: [
      {
        id: "tg_claymore",
        label: "Claymore",
        icon: "⚔️",
        desc: "A two-handed greatsword wide enough to hit everything in a row.",
        gridPosition: { row: 7, col: 14 },
        actions: [
          {
            id: "take",
            label: "Take it",
            effects: [
              { type: "grant_weapon", weaponId: "claymore" },
              { type: "consume_prop" },
              { type: "log", message: "Claymore added to your loadout." },
            ],
          },
        ],
      },
    ],
  },
  15: {
    label: "Shadow + Ghoul",
    hint: "",
    enemies: ["shadow", "ghoul", "rat", "rat"],
  },
  16: {
    label: "Get Shadow Cloak",
    hint: "",
    enemies: [],
    props: [
      {
        id: "tg_shadow_cloak",
        label: "Shadow Cloak",
        icon: "🧥",
        desc: "Dark cloth that drinks the light — lets you slip away or vanish entirely.",
        gridPosition: { row: 7, col: 13 },
        actions: [
          {
            id: "take",
            label: "Take it",
            effects: [
              { type: "grant_armor", armorId: "shadow_cloak" },
              { type: "consume_prop" },
              { type: "log", message: "Shadow Cloak added to your loadout." },
            ],
          },
        ],
      },
    ],
  },
  17: {
    label: "Shadow + Ghoul + Skeleton",
    hint: "",
    enemies: ["shadow", "shadow", "ghoul", "skeleton", "skeleton"],
  },
  18: {
    label: "Get Censer",
    hint: "",
    enemies: [],
    props: [
      {
        id: "tg_censer",
        label: "Censer",
        icon: "⛧",
        desc: "Swinging brass censer — smoke blinds, cleanses allies, covers retreat.",
        gridPosition: { row: 7, col: 10 },
        actions: [
          {
            id: "take",
            label: "Take it",
            effects: [
              { type: "grant_offhand", offhandId: "censer_offhand" },
              { type: "consume_prop" },
              { type: "log", message: "Censer added to your loadout." },
            ],
          },
        ],
      },
    ],
  },
  19: {
    label: "Necro + Zombie + Shadow",
    hint: "",
    enemies: ["necromancer", "zombie", "zombie", "shadow", "shadow"],
  },
  20: {
    label: "Final",
    hint: "",
    enemies: ["necromancer", "necromancer", "zombie", "skeleton", "shadow"],
  },
  21: {
    label: "Banshee + Skeletons",
    hint: "a thin sound the stone carries badly - not quite a voice, not quite a crack.",
    description:
      "Dead end pocket - cold air that shouldn't be here, salt seams running wet. The green light flickers without cause. Something ahead is making a sound below hearing.",
    enemies: ["banshee", "skeleton", "skeleton"],
    notes: `Tests banshee's Wail die (stun/weaken pressure) vs skeleton armor interplay. Skeletons in front row draw attention while banshee wails from back.`,
  },
};

export const A1_TESTING_GROUNDS: AreaDef = {
  id: "a1_testing_grounds",
  name: "Testing Grounds",
  desc: "Near-surface tunnels where someone strung sick green lamps overhead and left bone to walk the same path forever.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: A1_TESTING_GROUNDS_GRID,
    rooms: A1_TESTING_GROUNDS_ROOMS,
  },
  combatRooms: [],
  notes: `Main mine corridors; skeleton patrols; Era 1 tunnels under cracking Era 2 plaster; Era 3 coldfire overhead. R15 Junction Hall is the central chokepoint - all western branches (warrens, baron's wing) and deeper access (gate, patrol) route through it. Deeper-facing walls occasionally carry wrong warmth and almost-tone in salt when mine is quiet. Patrol schedule readable from R16; timing matters for stealth approaches.`,
};
