import { WEAPON_MAP } from "../../card-combat/cards";
import type { CardCombatPlayer } from "../../card-combat/types";

export function PlayerStats({ player }: { readonly player: CardCombatPlayer }) {
  const weapon = WEAPON_MAP.get(player.weaponId);
  const conditionKeys = Object.keys(player.conditions) as (keyof typeof player.conditions)[];

  return (
    <div
      className="flex items-center gap-5 px-5 py-3 w-full border-t border-crypt-border flex-wrap"
      style={{ background: "#161210" }}
    >
      <Stat icon="❤" color="#c41c1c" label={`${player.hp}/${player.maxHp}`} />
      <Stat icon="⚡" color="#3ddc84" label={`${player.stamina}/${player.maxStamina}`} />
      <Stat icon="🧂" label={String(player.salt)} />
      {player.armor > 0 && <Stat icon="🛡" label={String(player.armor)} />}
      {player.armorThisTurn > 0 && <Stat icon="🪧" label={`+${player.armorThisTurn}`} />}

      <div className="flex items-center gap-1 text-xs" style={{ color: "#786848" }}>
        <span>🂠 {player.deck.length}</span>
        <span>/ 🗑 {player.discard.length}</span>
      </div>

      {weapon && (
        <div className="flex items-center gap-1.5 text-sm" style={{ color: "#a89878" }}>
          <span>{weapon.icon}</span>
          <span>{weapon.name}</span>
        </div>
      )}

      {player.reactions.ripostePending > 0 && (
        <Stat icon="⚔" color="#c8b878" label={`Riposte ${player.reactions.ripostePending}`} />
      )}
      {player.reactions.overwatch && (
        <Stat
          icon="👁"
          color="#c8b878"
          label={`OW<${player.reactions.overwatch.triggerBelowDistance}`}
        />
      )}
      {player.reactions.negateNextHit && <Stat icon="🫥" color="#c8b878" label="Dodge" />}

      {conditionKeys.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {conditionKeys.map((k) => (
            <span
              key={k}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: "#2a1a16", color: "#c8a878" }}
            >
              {k}:{player.conditions[k]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  color,
  label,
}: {
  readonly icon: string;
  readonly color?: string;
  readonly label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-base" style={color ? { color } : undefined}>
        {icon}
      </span>
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}
