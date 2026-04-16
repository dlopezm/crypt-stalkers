import { useState } from "react";
import type { GridAbility, GridPlayerState } from "../../grid-combat/types";

interface AbilityBarProps {
  readonly abilities: readonly GridAbility[];
  readonly player: GridPlayerState;
  readonly selectedAbility: GridAbility | null;
  readonly onAbilityClick: (ability: GridAbility) => void;
  readonly abilitySourceMap: ReadonlyMap<string, string>;
}

export function AbilityBar({
  abilities,
  player,
  selectedAbility,
  onAbilityClick,
  abilitySourceMap,
}: AbilityBarProps) {
  const [hoveredAbility, setHoveredAbility] = useState<GridAbility | null>(null);
  const shownAbility = selectedAbility ?? hoveredAbility;

  return (
    <div className="relative w-full">
      {shownAbility && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-5 py-4 rounded border max-w-md pointer-events-none z-30"
          style={{
            background: "#1a1610",
            border: "1px solid #3a3020",
            boxShadow: "0 -4px 16px rgba(0,0,0,0.5)",
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base font-bold" style={{ color: "#ece0c8" }}>
              {shownAbility.name}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: "#2a2018", color: "#a89878" }}
            >
              {abilitySourceMap.get(shownAbility.id) ?? "Unknown"}
            </span>
          </div>

          <p className="text-sm mb-2" style={{ color: "#a89878" }}>
            {shownAbility.desc}
          </p>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs" style={{ color: "#786848" }}>
            <span>{shownAbility.apCost} AP</span>
            {shownAbility.cooldown > 0 && <span>{shownAbility.cooldown} turn cooldown</span>}
            {shownAbility.baseDamage > 0 && (
              <span>
                {shownAbility.baseDamage} {shownAbility.damageType ?? ""} dmg
              </span>
            )}
            {shownAbility.range > 1 && <span>Range {shownAbility.range}</span>}
            {shownAbility.pushDistance > 0 && <span>Push {shownAbility.pushDistance}</span>}
            {shownAbility.requiresBehindTarget && <span>Requires behind</span>}
            {shownAbility.requiresLOS && <span>Requires LOS</span>}
          </div>
        </div>
      )}

      <div
        className="flex items-center gap-2.5 px-5 py-3 w-full border-t border-crypt-border overflow-x-auto"
        style={{ background: "#1a1610" }}
      >
        {abilities.map((ability) => {
          const cd = player.abilityCooldowns[ability.id] ?? 0;
          const canAfford = player.ap >= ability.apCost;
          const isOnCooldown = cd > 0;
          const isDisabled = !canAfford || isOnCooldown;
          const isSelected = selectedAbility?.id === ability.id;

          return (
            <button
              key={ability.id}
              className="relative flex flex-col items-center px-4 py-2 rounded transition-all min-w-[100px]"
              style={{
                background: isSelected
                  ? "rgba(93, 173, 226, 0.3)"
                  : isDisabled
                    ? "#0c0a08"
                    : "#1a1610",
                border: isSelected
                  ? "1px solid #5dade2"
                  : isDisabled
                    ? "1px solid #2a2018"
                    : "1px solid #3a3020",
                color: isDisabled ? "#5a4a38" : "#ece0c8",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.5 : 1,
              }}
              onClick={() => !isDisabled && onAbilityClick(ability)}
              onMouseEnter={() => setHoveredAbility(ability)}
              onMouseLeave={() => setHoveredAbility(null)}
              disabled={isDisabled}
            >
              <span className="text-sm font-bold truncate max-w-[120px]">{ability.name}</span>
              <span className="text-xs text-crypt-muted mt-0.5">
                {ability.apCost} AP
                {ability.cooldown > 0 && ` · ${ability.cooldown}cd`}
              </span>
              {isOnCooldown && (
                <span className="absolute -top-1.5 -right-1.5 bg-crypt-red text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  {cd}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
