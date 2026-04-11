import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 — Ossuary — Deep Crypt (R100–R105). Grid: 2=R100 … 7=R105, 8=exit→R98 (bone stacks grid 6).
 * R101 hub: each branch uses its own 0-run (no shared corridor component between spokes).
 */

// prettier-ignore
export const A3_DEEP_CRYPT_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3  R102
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5  R102↔R101
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  8,  8,  0,  2,  2,  2,  0,  3,  3,  3,  3,  3,  0,  5,  5,  5,  1,  1,  1,  1,  1,  1], //  7  R100–R101–R103
  [ 1,  1,  8,  8,  1,  2,  2,  2,  1,  3,  3,  3,  3,  3,  1,  5,  5,  5,  1,  1,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  2,  2,  2,  1,  3,  3,  3,  3,  3,  1,  5,  5,  5,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  2,  2,  2,  1,  3,  3,  3,  3,  3,  1,  5,  5,  5,  0,  6,  6,  6,  1,  1], // 10  R103↔R104
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  6,  6,  6,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12  R101↔R105
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 15
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 16
];

export const A3_DEEP_CRYPT_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Crypt Entrance",
    hint: "clean salt-block and names carved with care; one old guard still walks his beat.",
    enemies: ["skeleton"],
    isStart: true,
    notes:
      "R100. Era 2. DARK. Transition from factory to crypt. " +
      "Skeleton ×1 in corroded order armor; slow patrol. Connects to R101 and exit to R98 Hidden Passage (bone stacks).",
    props: [
      {
        id: "crypt_entrance_inscriptions",
        label: "Doorframe Inscriptions",
        icon: "\u{1F58B}\uFE0F",
        desc: "Clean salt-block returns like a held breath. Names and vigil mottoes curl along the doorframes — the order still speaking to the dead as persons, not grades.",
        gridPosition: { row: 8, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "read_r100_crypt_entrance_inscriptions" },
          {
            type: "log",
            message:
              "The roar of carts fades behind you; here they still speak to the dead like people, not like ore.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Honor Guard Hall",
    hint: "knight-effigy lids; you feel watched before anything moves.",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord", "boss_skeleton_lord"],
    isBoss: true,
    notes:
      "R101. Era 2. DARK. Knight-effigy sarcophagi; three honor guards (Ancient Honor Guard: HP 20, ATK 8, slower — use boss_skeleton_lord ×3) dormant until entry or noise. " +
      "Era 2 dignity weaponized into Era 3 security. Connects to R100, R102 Founding Tomb, R103 Epitaph Gallery, R105 Consecration Circle.",
    props: [
      {
        id: "honor_guard_sarcophagi",
        label: "Knight-Effigy Sarcophagi",
        icon: "\u{26B0}\uFE0F",
        desc: "Stone knights lie in state on their lids, swords crossed over carved surcoats. The effigies are beautiful — and therefore dangerous. You feel watched from beneath closed helms.",
        gridPosition: { row: 9, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "examined_r101_honor_sarcophagi" },
          {
            type: "log",
            message:
              "Beauty cut for war — tombs meant to guard sleep, turned into sentries for someone else's hoard.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Founding Tomb",
    hint: "a single sarcophagus; the plaque asks more of you than gold does.",
    enemies: [],
    notes:
      "R102. Era 2. DARK. Single sarcophagus; founding symbol. Remains of first knight-commander. " +
      "Pair with Area 2 R53 ritual text; activate at R105. Honor guard does not pursue into this room.",
    props: [
      {
        id: "founding_tomb_plaque",
        label: "Founding Plaque",
        icon: "\u{1F3DB}\uFE0F",
        desc: 'Bronze-green with age, letters still proud: "First to serve. Last to rest." The first knight-commander\'s name is half worn away; the sentiment is not.',
        gridPosition: { row: 3, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "read_founding_tomb_plaque_r102" },
          {
            type: "log",
            message:
              "The vigil at its kindest — before the mills taught everyone a crueler way to speak about bodies.",
          },
        ],
      },
      {
        id: "founding_sarcophagus",
        label: "Founding Sarcophagus",
        icon: "\u{26B0}\uFE0F",
        desc: "A single lid, founding symbol carved deep. Beneath: remains dressed with preservation cloth gone brittle — and at the breast, a glint not coin: a blessed salt-crystal pendant on a chain fine as prayer.",
        gridPosition: { row: 4, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "examined_founding_sarcophagus_r102" },
          {
            type: "log",
            message:
              "The honor guard does not follow you here — this room is still under older law.",
          },
        ],
      },
      {
        id: "founding_holy_relic",
        label: "Founding Pendant",
        icon: "\u{1F48E}",
        desc: "Small, cold, almost humming when your palm closes. This is the physical half of consecration — the refusal to strip ground bare. It wants a rite you have not spoken yet.",
        gridPosition: { row: 3, col: 12 },
        actions: [
          {
            id: "take",
            label: "Lift the founding pendant",
            desc: "Small, cold, almost humming — the old refusal to strip ground bare, hung on a chain fine as prayer.",
            effects: [
              { type: "set_flag", flag: "has_founding_tomb_holy_relic" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The pendant settles against your sternum like a second heartbeat, slower than yours.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Epitaph Gallery",
    hint: "centuries of carved names; the last line ends in empty space.",
    enemies: [],
    notes:
      "R103. Era 2. DARK. Carved epitaphs across centuries; late entries sparse — decline visible. Last entry: name, date, empty tribute. " +
      "Connects to R101 and R104 Reliquary Niche.",
    props: [
      {
        id: "epitaph_gallery_carving",
        label: "Carved Epitaphs",
        icon: "\u{1F58B}\uFE0F",
        desc: "Centuries of names pressed into salt-block — early centuries crowded, hands sure; later centuries sparse, letters shallow. The last line gives a name and a date, then stops: no tribute, no prayer, only empty space where grief should sit.",
        gridPosition: { row: 8, col: 16 },
        onExamine: [
          { type: "set_flag", flag: "read_epitaph_gallery_r103" },
          {
            type: "log",
            message:
              "Some of these names appear on the work lists in the halls above — marked on shift years after the dates carved here.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Reliquary Niche",
    hint: "a locked alcove; the sigil is not the library's seal.",
    enemies: [],
    notes:
      "R104. Era 2. DARK. Locked alcove; deceased members' valuables. " +
      "Full vault route also needs Crystal Lantern + Shadow passage + CONSECRATION for sealed door (top optional path). R104 key to Restricted Archive / Area 2 restricted content.",
    props: [
      {
        id: "reliquary_grandmaster_key",
        label: "Grandmaster Ceremonial Key",
        icon: "\u{1F511}",
        desc: "Heavy iron, sigil of the grandmaster's office — not the librarian's common seal, not the warden's ring. This belongs to a door they hid behind the black-silk passage in the lower shelves. Cold bites your palm when you lift it.",
        gridPosition: { row: 10, col: 20 },
        actions: [
          {
            id: "take",
            label: "Take the ceremonial key",
            desc: "Weight and chill — a key meant for what they filed under stewardship and meant as hunger.",
            effects: [
              { type: "set_flag", flag: "has_grandmaster_restricted_vault_key" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "A key to what they filed under stewardship and meant as hunger.",
              },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Consecration Circle",
    hint: "an intact order circle; it brightens when you carry something that remembers prayer.",
    enemies: [],
    notes:
      "R105. Era 2. DARK. Intact order consecration circle. " +
      "Circle faint glows when player enters with relic. Theme — anti-greed: consecration inverts extraction; you give up a room's loot permanently to make ground unusable to the undead cycle — safety by refusing to take. " +
      "Effects (master spec): consecrate rooms / safe pockets, seal loot, deny undead resurrection in combat, open consecration caches dungeon-wide.",
    props: [
      {
        id: "consecration_circle_r105",
        label: "Vigil Consecration Circle",
        icon: "\u{2728}",
        desc: "Stone rings within rings, salt-white in the dark. When you carry the founding pendant, the grooves answer with a shy light — not coldfire, not belt-glow. This is what the vigil meant by giving ground back instead of stripping it hollow.",
        gridPosition: { row: 14, col: 11 },
        actions: [
          {
            id: "perform_first_rite",
            label: "Perform the founding consecration rite",
            desc: "The pendant warms when paired with the sealed ritual words — if you carry both, the stone will answer.",
            requires: {
              flags: ["has_founding_tomb_holy_relic", "read_consecration_rite_knowledge_r53"],
              notFlags: ["consecration_rite_performed_r105"],
            },
            effects: [
              { type: "set_flag", flag: "consecration_rite_performed_r105" },
              {
                type: "log",
                message:
                  "The first rite takes. Light threads the circle once, then settles under your ribs — a vow that will not let their tallies own every grave and tunnel.",
              },
            ],
          },
        ],
        onExamine: [
          {
            type: "log",
            message:
              "The grooves remember prayer. Pendant and sealed ritual text together could wake a power he would call useless — because it refuses to feed him.",
          },
        ],
      },
    ],
  },
  8: {
    label: "Toward the Old Timber Pass",
    hint: "timber and old draft; the bone-mountains feel far behind.",
    enemies: [],
    exit: { toAreaId: "a3_bone_stacks", toRoomGridId: 6 },
    notes:
      'Return to R98 (bone stacks grid 6). Pair: bone stacks "To Deep Crypt" lands grid 2 (R100).',
  },
};

export const A3_DEEP_CRYPT: AreaDef = {
  id: "a3_deep_crypt",
  name: "Deep Crypt",
  desc: "Named dead, carved epitaphs, and a circle that asks you to give treasure back — the vigil's heart under the noise of the mills.",
  difficulty: 3,
  generator: "authored",
  authored: {
    grid: A3_DEEP_CRYPT_GRID,
    rooms: A3_DEEP_CRYPT_ROOMS,
  },
  combatRooms: [],
  bossRoom: {
    label: "Honor Guard Hall",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord", "boss_skeleton_lord"],
    hint: "knight-effigy lids; you feel watched before anything moves.",
  },
  hiddenFromTown: true,
  notes:
    "Ossuary subarea 5: CONSECRATION origin; contrast to Era 3 factory. R102 relic + Area 2 R53 text → R105 activation.",
};
