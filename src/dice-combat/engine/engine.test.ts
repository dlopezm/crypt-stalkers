import { describe, expect, it } from "vitest";
import {
  assignFace,
  commitRoll,
  faceForInstance,
  initDiceCombat,
  rerollDice,
  resolveTurn,
  toggleLock,
} from "./index";
import { SOUL_STARTING_FACES } from "../dice-defs";
import type { DiceCombatState, DieSlot, FaceDef } from "../types";
import { getFace } from "../dice-defs";

const BASE_LOADOUT = {
  mainWeaponId: "warhammer",
  offhandId: "shield",
  armorId: "mail_hauberk",
  soulFaces: SOUL_STARTING_FACES,
} as const;

function startFight(overrides: Partial<Parameters<typeof initDiceCombat>[0]> = {}) {
  return initDiceCombat({
    loadout: BASE_LOADOUT,
    startingHp: 30,
    startingMaxHp: 30,
    startingSalt: 0,
    enemies: [{ id: "rat", uid: "rat_1" }],
    seed: 42,
    ...overrides,
  });
}

/** Force a die to show a specific face id by mutating its faceIndex.
 * Pure-immutable: returns a new state. */
function setFace(state: DiceCombatState, slot: DieSlot, faceId: string): DiceCombatState {
  const die = state.dice.find((d) => d.slot === slot);
  if (!die) throw new Error(`No die in slot ${slot}`);
  // Look up the face index in the underlying die definition.
  const dieFaceList = facesForSlot(state, slot);
  const idx = dieFaceList.indexOf(faceId);
  if (idx === -1) throw new Error(`Face ${faceId} not on slot ${slot}: ${dieFaceList.join(", ")}`);
  return {
    ...state,
    dice: state.dice.map((d) => (d.slot === slot ? { ...d, faceIndex: idx } : d)),
  };
}

function facesForSlot(state: DiceCombatState, slot: DieSlot): readonly string[] {
  // Reach into the die instance's resolved definition via faceForInstance trick:
  // we walk the state to find a die in that slot, then resolve faces by trying every index.
  // Easier: use the actual exported dice-defs.
  const die = state.dice.find((d) => d.slot === slot);
  if (!die) return [];
  // Use any face index to introspect: the def has a fixed 6 faces independent of faceIndex.
  // We'll borrow the existing helper by temporarily probing each face id from the imported map.
  const probe = { ...die, faceIndex: 0 };
  // Grab every face by stepping faceIndex 0..5 against a probed copy.
  const out: string[] = [];
  for (let i = 0; i < 6; i++) {
    const ds = {
      ...state,
      dice: state.dice.map((d) => (d.slot === slot ? { ...probe, faceIndex: i } : d)),
    };
    const sd = ds.dice.find((d) => d.slot === slot)!;
    const f = faceForInstance(sd, ds);
    if (f) out.push(f.id);
  }
  return out;
}

describe("initDiceCombat", () => {
  it("sets up the player, dice pool, and enemy roster", () => {
    const s = startFight();
    expect(s.player.hp).toBe(30);
    expect(s.player.rerollsLeft).toBe(2);
    expect(s.dice).toHaveLength(5);
    expect(s.enemies).toHaveLength(1);
    expect(s.enemies[0].name).toBe("Ravager Rat");
    expect(s.enemies[0].intent).not.toBeNull();
    expect(s.phase).toBe("rolling");
  });

  it("skips unknown enemy ids", () => {
    const s = startFight({
      enemies: [
        { id: "rat", uid: "rat_1" },
        { id: "nonexistent", uid: "x" },
      ],
    });
    expect(s.enemies).toHaveLength(1);
  });

  it("rolls all five dice on init", () => {
    const s = startFight();
    for (const d of s.dice) {
      expect(d.faceIndex).toBeGreaterThanOrEqual(0);
      expect(d.faceIndex).toBeLessThan(6);
    }
  });
});

describe("re-rolling and locking", () => {
  it("re-roll decrements rerollsLeft", () => {
    const s = startFight();
    const after = rerollDice(s);
    expect(after.player.rerollsLeft).toBe(1);
  });

  it("locked dice keep their face on re-roll", () => {
    const s = startFight();
    const lockedBody = toggleLock(s, "body");
    const bodyFaceBefore = lockedBody.dice.find((d) => d.slot === "body")!.faceIndex;
    const after = rerollDice(lockedBody);
    const bodyFaceAfter = after.dice.find((d) => d.slot === "body")!.faceIndex;
    expect(bodyFaceAfter).toBe(bodyFaceBefore);
  });

  it("re-roll cap is 0 — clicking again does nothing", () => {
    let s = startFight();
    s = rerollDice(s);
    s = rerollDice(s);
    expect(s.player.rerollsLeft).toBe(0);
    s = rerollDice(s);
    expect(s.player.rerollsLeft).toBe(0);
  });
});

describe("damage + resistances", () => {
  it("hammer Crush kills a rat in one hit", () => {
    let s = startFight();
    s = setFace(s, "main", "hammer_crush");
    s = forceSelfFacesEverywhereExcept(s, "main");
    s = commitRoll(s);
    s = assignFace(s, "main", "rat_1");
    s = resolveTurn(s);
    expect(s.phase === "victory" || s.enemies.find((e) => e.uid === "rat_1") === undefined).toBe(
      true,
    );
  });

  it("skeleton resists slash and reassembles on slash kill", () => {
    let s = startFight({
      enemies: [{ id: "skeleton", uid: "sk_1" }],
      // Bring extra HP so we survive Bash.
      startingHp: 99,
      startingMaxHp: 99,
    });
    // Drop the skeleton to 1 HP so a single damage face on body_strike (1 slash) finishes it.
    s = {
      ...s,
      enemies: s.enemies.map((e) => (e.uid === "sk_1" ? { ...e, hp: 1 } : e)),
    };
    s = setFace(s, "body", "body_strike");
    s = forceSelfFacesEverywhereExcept(s, "body");
    s = commitRoll(s);
    s = assignFace(s, "body", "sk_1");
    s = resolveTurn(s);
    // Slash kill → reassembleQueued, then end-of-turn revives at half HP.
    const sk = s.enemies.find((e) => e.uid === "sk_1");
    expect(sk).toBeDefined();
    expect(sk!.hp).toBeGreaterThan(0);
  });

  it("bludgeoning kill prevents reassemble", () => {
    let s = startFight({
      enemies: [{ id: "skeleton", uid: "sk_1" }],
      startingHp: 99,
      startingMaxHp: 99,
    });
    s = {
      ...s,
      enemies: s.enemies.map((e) => (e.uid === "sk_1" ? { ...e, hp: 1 } : e)),
    };
    s = setFace(s, "main", "hammer_smash"); // 2 bludgeoning, vuln 1.5 → 3 dmg
    s = forceSelfFacesEverywhereExcept(s, "main");
    s = commitRoll(s);
    s = assignFace(s, "main", "sk_1");
    s = resolveTurn(s);
    const sk = s.enemies.find((e) => e.uid === "sk_1");
    expect(sk).toBeUndefined();
  });
});

describe("banshee re-roll attack", () => {
  it("howl steals one re-roll on the next turn", () => {
    let s = startFight({
      enemies: [{ id: "banshee", uid: "b_1" }],
      startingHp: 99,
      startingMaxHp: 99,
    });
    s = forceSelfFacesEverywhereExcept(s, null);
    s = commitRoll(s);
    s = resolveTurn(s);
    // After Banshee's resolved Howl, next turn's re-rolls should be reduced.
    expect(s.player.rerollsLeft).toBe(1);
  });
});

/* ── Helpers ── */

/** Force every die except `keepSlot` to a self-target / none-target face so the test can
 * isolate the behaviour of one die without spending other dice on attacks. */
function forceSelfFacesEverywhereExcept(
  state: DiceCombatState,
  keepSlot: DieSlot | null,
): DiceCombatState {
  let s = state;
  for (const d of s.dice) {
    if (d.slot === keepSlot) continue;
    const faceIds = facesForSlot(s, d.slot);
    const benignIdx = faceIds.findIndex((id) => {
      const f = getFace(id);
      return faceIsBenign(f);
    });
    if (benignIdx >= 0) {
      s = {
        ...s,
        dice: s.dice.map((x) => (x.slot === d.slot ? { ...x, faceIndex: benignIdx } : x)),
      };
    }
  }
  return s;
}

function faceIsBenign(face: FaceDef | null): boolean {
  if (!face) return false;
  return face.target === "self" || face.target === "none";
}
