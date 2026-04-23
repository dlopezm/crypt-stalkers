import type { CardDef, CardCombatPlayer } from "../../card-combat/types";
import { getCard } from "../../card-combat/cards";

interface Props {
  readonly player: CardCombatPlayer;
  readonly selectedCardId: string | null;
  readonly onSelectCard: (cardId: string | null) => void;
  readonly disabled: boolean;
}

export function HandRenderer({ player, selectedCardId, onSelectCard, disabled }: Props) {
  return (
    <div
      className="flex items-end justify-center gap-2 px-4 py-4 w-full"
      style={{ background: "#161210", borderTop: "1px solid #3a3020", minHeight: 190 }}
    >
      {player.hand.length === 0 && (
        <div className="text-sm italic" style={{ color: "#786848" }}>
          No cards in hand.
        </div>
      )}
      {player.hand.map((cardId, i) => {
        const card = getCard(cardId);
        if (!card) return null;
        const cursed = (player.conditions.cursed ?? 0) > 0;
        const cost = cursed ? card.stamina + 1 : card.stamina;
        const canAfford = player.stamina >= cost;
        const selected = selectedCardId === cardId && i === player.hand.indexOf(cardId);
        return (
          <CardView
            key={`${cardId}_${i}`}
            card={card}
            cost={cost}
            selected={selected}
            canAfford={canAfford}
            onClick={() => {
              if (disabled || !canAfford) return;
              onSelectCard(selected ? null : cardId);
            }}
          />
        );
      })}
    </div>
  );
}

function CardView({
  card,
  cost,
  selected,
  canAfford,
  onClick,
}: {
  readonly card: CardDef;
  readonly cost: number;
  readonly selected: boolean;
  readonly canAfford: boolean;
  readonly onClick: () => void;
}) {
  const reachLabel =
    card.reach === "self"
      ? "self"
      : card.reach.max === card.reach.min
        ? `${card.reach.min}`
        : `${card.reach.min}-${card.reach.max}`;

  return (
    <button
      onClick={onClick}
      className="flex flex-col rounded border text-left px-2 py-2 transition-all flex-shrink-0"
      style={{
        background: selected ? "#2a1816" : "#1a1610",
        border: selected ? "2px solid #c8b878" : "1px solid #3a3020",
        opacity: canAfford ? 1 : 0.45,
        cursor: canAfford ? "pointer" : "not-allowed",
        width: 140,
        minHeight: 160,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg">{card.icon}</span>
        <span
          className="text-xs px-1.5 py-0.5 rounded font-bold"
          style={{ background: "#0f0b08", color: "#c8b878" }}
        >
          {cost}
        </span>
      </div>
      <div className="text-sm font-bold leading-tight mb-1" style={{ color: "#ece0c8" }}>
        {card.name}
      </div>
      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#786848" }}>
        ⇥ {reachLabel}
        {card.damage > 0 && (
          <span className="ml-2" style={{ color: "#c41c1c" }}>
            ⚔ {card.damage}
          </span>
        )}
      </div>
      <div className="text-xs leading-snug" style={{ color: "#a89878" }}>
        {card.desc}
      </div>
    </button>
  );
}
