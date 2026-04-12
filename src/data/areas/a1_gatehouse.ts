import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 1 - The Gatehouse (R7–R11)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (per design doc):
 *  exit7(mine mouth) ↔ R7(court) ↔ R8(guard, dead end)
 *                 ↔ R9(receiving) ↔ R10(record, dead end)
 *                          ↔ R11(balcony, dead end)
 */

// prettier-ignore
export const A1_GATEHOUSE_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 1, 1, 1], // 1 R11 Balcony (5x2)
 [ 1, 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 1, 1, 1], // 2
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1], // 3 R9→R11 corridor
 [ 1, 1, 3, 3, 3, 1, 4, 4, 4, 4, 4, 0, 5, 5, 1], // 4 R8, R9, R9→R10
 [ 1, 1, 3, 3, 3, 1, 4, 4, 4, 4, 4, 1, 5, 5, 1], // 5
 [ 1, 1, 1, 0, 1, 1, 4, 4, 4, 4, 4, 1, 5, 5, 1], // 6 R7→R8 corridor
 [ 1, 2, 2, 2, 2, 2, 2, 0, 1, 1, 1, 1, 1, 1, 1], // 7 R7 Outer Court + R7→R9
 [ 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], // 8
 [ 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], // 9
 [ 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], // 10
 [ 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 11 R7→exit7 corridor
 [ 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 12 exit7
 [ 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 13
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 14
];

export const A1_GATEHOUSE_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Outer Court",
    hint: "sky through a broken crown of wall. pillars carved with flame and gaping throats - their warning, still standing.",
    description:
      "Open sky through a broken wall ring - flagstones, grit in the wind. Two salt pillars carved with flames and gaping mouths.",
    enemies: [],
    isStart: true,
    safeRoom: true,
    notes:
      "R7. Era 2 + ruin. LIT (open sky). " + "Foreshadows Grave Robber behavior and patrol danger.",
    props: [
      {
        id: "gate_carvings",
        label: "Carved Gateposts",
        icon: "\u{1F525}",
        desc: "Stone tongues of fire and carved mouths stretched wide - the kind of art that wants you to hear singing you can't quite catch. Beyond, their courtyard sags and splits; only these two stayed proud.",
        gridPosition: { row: 7, col: 3 },
      },
      {
        id: "dead_robber_pack",
        label: "Corpse by the Threshold",
        icon: "\u{1F480}",
        desc: "Bent wrong, skull caved - patrol work, not age. His pack burst on the flags: waxed torches, charcoal scrawl on scraped hide - the upper tunnels sketched quick, X's where he was afraid, circles where he thought treasure sat. Salt crystals weight the belt pouch; he never spent them.",
        gridPosition: { row: 9, col: 5 },
        actions: [
          {
            id: "loot",
            label: "Turn out the pack",
            effects: [
              { type: "grant_salt", amount: 15 },
              { type: "grant_consumable", consumableId: "heal_sm" },
              { type: "grant_consumable", consumableId: "torch" },
              { type: "grant_consumable", consumableId: "torch" },
              { type: "set_flag", flag: "has_area1_map" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Salt, two torches, and another man's map of your inheritance. He died closer to the mouth than you did.",
              },
            ],
          },
        ],
      },
    ],
  },
  3: {
    label: "Guard Room",
    hint: "weapon racks stripped to splinters and rust. one parchment still nailed - shifts, names, dates you don't recognize.",
    description:
      "Narrow room off the court - stripped weapon racks, splinters and rust flakes on the floor. Dim light; damp mortar joints; wet stone and iron on the air.",
    enemies: ["rat", "rat"],
    notes:
      "R8. Era 2 + neglect. DIM. Dead end. " +
      "Wrong weapon type teaches damage-type lesson if player experiments on skeletons.",
    props: [
      {
        id: "duty_roster",
        label: "Pinned Roster",
        icon: "\u{1F4CB}",
        desc: "Ink faded to brown; nailheads weep rust. Four on, two off, repeat until the page ends - the same cadence you watched bone feet keep in the gallery. Someone wrote it clean once; something else still obeys.",
        gridPosition: { row: 4, col: 4 },
        onExamine: [{ type: "set_flag", flag: "read_duty_roster" }],
      },
      {
        id: "rusted_shortsword",
        label: "Guard's Shortsword",
        icon: "\u{1F5E1}\uFE0F",
        desc: "Leather grip gone to powder; blade pocked orange but sharp enough to open a belly. It wants a slashing arm - not the kind of weight that stomps marrow to splinters.",
        gridPosition: { row: 5, col: 3 },
        actions: [
          {
            id: "take",
            label: "Belt the blade",
            effects: [
              { type: "grant_weapon", weaponId: "axe" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Steel for flesh. Against the hollow clicking things in the dark, you already suspect you'll want something heavier.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Receiving Hall",
    hint: "plaster saints lift hands; paint flakes into dust. two slumped figures haul salt toward the yard, same steps, same pause - as if the hall taught them the route.",
    description:
      "Tall hall - peeling plaster, worn floor flags where salt was dragged toward the yard. Thin daylight from the arch. Sound carries; you hear drips and movement along the walls.",
    enemies: ["zombie", "zombie"],
    notes:
      "R9. Era 2. DIM. " +
      "Zombies lug salt on fixed path R9→R7→surface - workers reduced to instructions; player can observe without fight. " +
      "Singing motif in frescoes - resonance hint for R17 Inner Gate.",
    props: [
      {
        id: "order_frescoes",
        label: "Peeling Wall Paintings",
        icon: "\u{1F3A8}",
        desc: "Color gone to ghosts: a pit in the hill, palms lifted, little painted flames hovering like tame stars. A row of open mouths - not screaming; singing, the way choirs do when breath is meant to be shared. Underfoot, letters you can still read: We who keep the vigil stand between the salt and the shadow.",
        gridPosition: { row: 5, col: 8 },
        onExamine: [
          { type: "set_flag", flag: "seen_singing_frescoes" },
          {
            type: "log",
            message:
              "They wanted everyone who passed to hear music in their heads. You do - thin, stubborn, stuck behind your teeth.",
          },
        ],
      },
    ],
  },
  5: {
    label: "Record Room",
    hint: "black damp; shelves slumped into fungus. one dry corner kept a single sheet legible.",
    description:
      "Black damp, sagging shelves, ceiling lost in dark. Floor slopes to a clogged drain. Rotting paper smell; old ink, metallic edge.",
    enemies: [],
    notes: "R10. Era 2. DARK. Dead end. " + "Emotional beat: the heir was sold cheap.",
    props: [
      {
        id: "acquisition_receipt",
        label: "Sale Receipt",
        icon: "\u{1F4DC}",
        desc: "Crisp ink on paper that somehow stayed honest. The Ashvere mining concession - twelve silver marks and a line about spiritual stewardship, whatever that weighed to them. A horse costs more. Scraps beside it call the Ashvere claim greedy, your name thrown around like a joke in a tavern.",
        gridPosition: { row: 4, col: 13 },
        onExamine: [
          { type: "set_flag", flag: "read_acquisition_receipt" },
          {
            type: "log",
            message:
              "Twelve marks. They bought your birthright for saddle money and a sermon. Your hands shake; you fold the page careful, as if anger could tear it.",
          },
        ],
      },
      {
        id: "record_room_salt",
        label: "Clerk's Salt Pouch",
        icon: "\u{1FA99}",
        desc: "Leather pouch kicked under a desk leg, stiff with mildew on the outside, dry within. Six salt crystals, each wrapped in waxed paper - the clerk's emergency supply.",
        gridPosition: { row: 5, col: 12 },
        actions: [
          {
            id: "take",
            label: "Empty the pouch",
            effects: [
              { type: "grant_salt", amount: 6 },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Six crystals. Small theft forgotten in a room full of bigger ones.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Gatehouse Balcony",
    hint: "narrow stone lip over open air. from here the yard and the black mouth read like a map you can walk later.",
    description:
      "Narrow stone ledge over open air; low parapet, wind on your chest. Below: cracked flags, yard, tunnel mouth - you can judge distance and cover from here.",
    enemies: [],
    safeRoom: true,
    notes:
      "R11. Era 2. LIT (open air). Dead end. " +
      "Observation tutorial: learn patrol path before engaging. " +
      "MISSING: bat ×3 (darkvision; blocked by doors; teach door-blocking / vertical nuisance).",
    props: [
      {
        id: "balcony_view",
        label: "View from the Ledge",
        icon: "\u{1F441}\uFE0F",
        desc: "Wind finds your throat. Below, cracked flags and the tunnel's yawn; the tracks shine where nothing living polishes them anymore. Two bone figures walk a circle - arch, court, arch again - never hurrying, never resting. You could time a breath to their stride.",
        gridPosition: { row: 1, col: 9 },
        onExamine: [
          { type: "set_flag", flag: "observed_patrol" },
          {
            type: "log",
            message:
              "You stand until their pattern sits in your bones. When you move, you'll move between heartbeats they don't have.",
          },
        ],
      },
    ],
  },
  7: {
    label: "To Mine Mouth",
    hint: "steps fall toward iron rails and the rough cut your people made first.",
    description: "Steps down to iron rails and the rough first cut of the mine.",
    enemies: [],
    exit: { toAreaId: "a1_mine_mouth", toRoomGridId: 3 },
  },
};

export const A1_GATEHOUSE: AreaDef = {
  id: "a1_gatehouse",
  name: "The Gatehouse",
  desc: "Their fort over your hole - broken now, but still preaching stone and sky while the dark underneath remembers your name.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: A1_GATEHOUSE_GRID,
    rooms: A1_GATEHOUSE_ROOMS,
  },
  combatRooms: [],
  notes:
    "Fortified order entrance over the mine mouth. Era 2 architecture; Era 3 neglect and surface-facing undead activity. " +
    "Frescoes (R9) seed singing motif for R17 resonance lock. " +
    "Dead grave robber (R7) teaches loot/danger dynamic. " +
    "Balcony (R11) is observation tutorial for patrol mechanics.",
};
