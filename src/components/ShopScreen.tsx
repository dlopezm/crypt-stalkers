import { useState } from "react";
import { btnStyle } from "../styles";
import { SHOP_ITEMS } from "../data/rooms";
import { getRewards } from "../utils/helpers";
import { CardUI } from "./shared";
import type { Player, ShopItem, CardTemplate } from "../types";

export function ShopScreen({ player, onBuy, onLeave }: {
  player: Player;
  onBuy: (item: ShopItem) => void;
  onLeave: () => void;
}) {
  const [removing, setRemoving] = useState(false);
  const [rewards] = useState<CardTemplate[]>(() => getRewards());

  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center justify-center gap-4 relative overflow-hidden p-4">
      <div className="vignette" />
      <h1 className="text-2xl tracking-[0.15em] uppercase text-crypt-red-glow font-bold relative z-1"
        style={{ textShadow: "0 0 20px #8b0000" }}>
        {"\u{1F4B0}"} Wandering Merchant
      </h1>
      <div className="text-crypt-muted text-sm relative z-1">Gold: {player.gold} {"\u{1FA99}"}</div>

      <div className="flex gap-4 relative z-1 flex-wrap justify-center max-w-4xl">
        <div className="panel min-w-[240px]">
          <div className="text-xs text-crypt-dim tracking-[0.2em] mb-3 uppercase">Supplies</div>
          {SHOP_ITEMS.map(item => (
            <div key={item.id} className="flex justify-between items-center mb-3 pb-3 border-b border-crypt-border-dim">
              <div>
                <div className="text-sm text-crypt-text">{item.icon} {item.label}</div>
                <div className="text-xs text-crypt-muted">{item.desc}</div>
              </div>
              <button style={btnStyle("#8b0000", player.gold < item.cost)}
                className="ml-3 whitespace-nowrap"
                disabled={player.gold < item.cost}
                onClick={() => onBuy(item)}>
                {item.cost}{"\u{1FA99}"}
              </button>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="text-xs text-crypt-dim tracking-[0.2em] mb-3 uppercase">Cards for sale (25{"\u{1FA99}"} each)</div>
          <div className="flex gap-3 flex-wrap">
            {rewards.map(card => (
              <div key={card.id} className="flex flex-col items-center gap-2">
                <CardUI card={card} affordable={player.gold >= 25} onClick={() => {
                  if (player.gold >= 25) onBuy({ id: "card_" + card.id, effect: "addcard", card, cost: 25, label: card.name, icon: "", desc: "", value: 0 });
                }} />
                <button style={btnStyle(card.color, player.gold < 25)}
                  className="text-sm! px-3! py-1!"
                  disabled={player.gold < 25}
                  onClick={() => {
                    if (player.gold >= 25) onBuy({ id: "card_" + card.id, effect: "addcard", card, cost: 25, label: card.name, icon: "", desc: "", value: 0 });
                  }}>
                  25{"\u{1FA99}"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {removing && (
        <div className="panel max-w-2xl w-full relative z-2">
          <div className="text-sm text-crypt-text mb-3">Select a card to remove from your deck:</div>
          <div className="flex gap-2 flex-wrap">
            {player.deck.map(c => (
              <div key={c.uid} className="flex flex-col items-center gap-1">
                <CardUI card={c} affordable={true} onClick={() => {
                  onBuy({ id: "remove", effect: "remove", cost: 0, targetCard: c.uid, label: "", icon: "", desc: "", value: 0 });
                  setRemoving(false);
                }} />
                <button style={btnStyle("#8b0000")} onClick={() => {
                  onBuy({ id: "remove", effect: "remove", cost: 0, targetCard: c.uid, label: "", icon: "", desc: "", value: 0 });
                  setRemoving(false);
                }}>Remove</button>
              </div>
            ))}
          </div>
          <button style={btnStyle("#3a2f25")} className="mt-3" onClick={() => setRemoving(false)}>Cancel</button>
        </div>
      )}

      <button style={btnStyle("#3a2f25")} className="relative z-1" onClick={onLeave}>{"\u2190"} Back to map</button>
    </div>
  );
}
