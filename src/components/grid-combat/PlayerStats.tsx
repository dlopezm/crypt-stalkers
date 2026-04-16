import type { GridConditionKey, GridPlayerState } from "../../grid-combat/types";
import { GRID_WEAPON_MAP } from "../../grid-combat/equipment";
import { CONDITION_DISPLAY } from "./constants";

export function PlayerStats({ player }: { readonly player: GridPlayerState }) {
  const weapon = GRID_WEAPON_MAP.get(player.mainWeaponId);

  return (
    <div
      className="flex items-center gap-5 px-5 py-3 w-full border-t border-crypt-border"
      style={{ background: "#161210" }}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-crypt-red text-lg">❤️</span>
        <span className="text-base font-bold">
          {player.hp}/{player.maxHp}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-crypt-blue text-lg">⚡</span>
        <span className="text-base font-bold">
          {player.ap}/{player.maxAp} AP
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-lg">🧂</span>
        <span className="text-base">{player.salt}</span>
      </div>

      {player.armor > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🛡️</span>
          <span className="text-base">{player.armor}</span>
        </div>
      )}

      {weapon && (
        <div className="flex items-center gap-1.5 text-sm text-crypt-muted">
          <span>{weapon.icon}</span>
          <span>{weapon.name}</span>
        </div>
      )}

      {player.boneResonanceStacks > 0 && (
        <div className="flex items-center gap-1.5 text-sm text-crypt-gold">
          <span>💀</span>
          <span>+{player.boneResonanceStacks} dmg</span>
        </div>
      )}

      {Object.entries(player.conditions).map(([key, val]) => {
        if (!val || val <= 0) {
          return null;
        }
        const disp = CONDITION_DISPLAY[key as GridConditionKey];
        return (
          <span key={key} className={`text-sm ${disp?.color ?? ""}`}>
            {disp?.icon ?? ""} {val}
          </span>
        );
      })}
    </div>
  );
}
