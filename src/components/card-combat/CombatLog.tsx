import type { CardCombatLogEntry } from "../../card-combat/types";

export function CombatLog({ entries }: { readonly entries: readonly CardCombatLogEntry[] }) {
  return (
    <div
      className="flex flex-col w-64 flex-shrink-0 border-l border-crypt-border overflow-y-auto"
      style={{ background: "#161210" }}
    >
      <div className="px-3 py-2.5 border-b border-crypt-border">
        <h3 className="text-sm uppercase tracking-widest" style={{ color: "#786848" }}>
          Combat Log
        </h3>
      </div>

      <div className="flex-1 p-2.5 space-y-1">
        {entries.length === 0 ? (
          <p className="text-sm italic" style={{ color: "#786848" }}>
            No actions yet.
          </p>
        ) : (
          entries
            .slice(-40)
            .reverse()
            .map((entry, i) => (
              <p
                key={i}
                className="text-xs leading-snug"
                style={{
                  color:
                    entry.source === "player"
                      ? "#3ddc84"
                      : entry.source === "enemy"
                        ? "#c41c1c"
                        : "#a89878",
                }}
              >
                {entry.text}
              </p>
            ))
        )}
      </div>
    </div>
  );
}
