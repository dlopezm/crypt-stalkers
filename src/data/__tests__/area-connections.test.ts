import { describe, it, expect } from "vitest";
import { AREAS } from "../rooms";
import { generateArea } from "../../utils/area";
import type { AreaDef } from "../../types";

const authoredAreas = AREAS.filter(
  (a): a is AreaDef & Required<Pick<AreaDef, "authored">> =>
    a.generator === "authored" && !!a.authored,
);

const areaById = new Map(AREAS.map((a) => [a.id, a]));

function collectExits(def: AreaDef & { readonly authored: NonNullable<AreaDef["authored"]> }) {
  return Object.entries(def.authored.rooms)
    .filter(([, r]) => !!r.exit)
    .map(([gridId, r]) => ({
      sourceGridId: Number(gridId),
      sourceLabel: r.label,
      toAreaId: r.exit!.toAreaId,
      toRoomGridId: r.exit!.toRoomGridId,
    }));
}

describe("inter-area connections", () => {
  it.each(authoredAreas.map((a) => [a.id, a]))(
    "%s — every exit toRoomGridId resolves in target area",
    (_id, def) => {
      const exits = collectExits(def);
      if (exits.length === 0) return;

      for (const ex of exits) {
        const targetDef = areaById.get(ex.toAreaId);
        expect(
          targetDef,
          `target area "${ex.toAreaId}" not found (from ${ex.sourceLabel})`,
        ).toBeDefined();

        const { nodes } = generateArea(targetDef!);
        const resolved = nodes.find((n) => n.gridRoomId === ex.toRoomGridId);
        expect(
          resolved,
          `${_id} room "${ex.sourceLabel}" (grid ${ex.sourceGridId}) → ${ex.toAreaId} grid ${ex.toRoomGridId}: no node with that gridRoomId`,
        ).toBeDefined();
      }
    },
  );

  it("every connection is bidirectional (return exit exists)", () => {
    const allEdges: Array<{ from: string; to: string; toGrid: number }> = [];

    for (const def of authoredAreas) {
      for (const ex of collectExits(def)) {
        allEdges.push({ from: def.id, to: ex.toAreaId, toGrid: ex.toRoomGridId });
      }
    }

    for (const edge of allEdges) {
      const returnEdges = allEdges.filter((e) => e.from === edge.to && e.to === edge.from);
      expect(
        returnEdges.length,
        `${edge.from} → ${edge.to} (grid ${edge.toGrid}) has no return exit`,
      ).toBeGreaterThanOrEqual(1);
    }
  });
});
