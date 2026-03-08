import { useState } from "react";
import { S } from "../styles";
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
    <div style={{ ...S.root, padding: "1rem", gap: "1rem", justifyContent: "center" }}>
      <div style={S.vignette} />
      <div style={{ ...S.title, fontSize: "1.6rem" }}>{"\u{1F4B0}"} Wandering Merchant</div>
      <div style={{ color: "#5a4a3a", fontSize: "0.75rem", zIndex: 1 }}>Gold: {player.gold} {"\u{1FA99}"}</div>

      <div style={{ display: "flex", gap: "1rem", zIndex: 1, flexWrap: "wrap", justifyContent: "center", maxWidth: "780px" }}>
        <div style={{ ...S.panel, minWidth: "200px" }}>
          <div style={{ fontSize: "0.65rem", color: "#5a4a3a", letterSpacing: "0.2em", marginBottom: "8px" }}>SUPPLIES</div>
          {SHOP_ITEMS.map(item => (
            <div key={item.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid #1a1510",
            }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "#c9b99a" }}>{item.icon} {item.label}</div>
                <div style={{ fontSize: "0.62rem", color: "#5a4a3a" }}>{item.desc}</div>
              </div>
              <button style={{ ...S.btn("#8b0000", player.gold < item.cost), marginLeft: "8px", whiteSpace: "nowrap" }}
                disabled={player.gold < item.cost}
                onClick={() => onBuy(item)}>
                {item.cost}{"\u{1FA99}"}
              </button>
            </div>
          ))}
        </div>

        <div style={{ ...S.panel }}>
          <div style={{ fontSize: "0.65rem", color: "#5a4a3a", letterSpacing: "0.2em", marginBottom: "8px" }}>CARDS FOR SALE (25{"\u{1FA99}"} each)</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {rewards.map(card => (
              <div key={card.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                <CardUI card={card} affordable={player.gold >= 25} onClick={() => {
                  if (player.gold >= 25) onBuy({ id: "card_" + card.id, effect: "addcard", card, cost: 25, label: card.name, icon: "", desc: "", value: 0 });
                }} />
                <button style={{ ...S.btn(card.color, player.gold < 25), fontSize: "0.7rem", padding: "0.3rem 0.6rem" }}
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
        <div style={{ ...S.panel, maxWidth: "600px", zIndex: 2, width: "100%" }}>
          <div style={{ fontSize: "0.75rem", color: "#c9b99a", marginBottom: "8px" }}>Select a card to remove from your deck:</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {player.deck.map(c => (
              <div key={c.uid} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <CardUI card={c} affordable={true} onClick={() => {
                  onBuy({ id: "remove", effect: "remove", cost: 0, targetCard: c.uid, label: "", icon: "", desc: "", value: 0 });
                  setRemoving(false);
                }} />
                <button style={S.btn("#8b0000")} onClick={() => {
                  onBuy({ id: "remove", effect: "remove", cost: 0, targetCard: c.uid, label: "", icon: "", desc: "", value: 0 });
                  setRemoving(false);
                }}>Remove</button>
              </div>
            ))}
          </div>
          <button style={{ ...S.btn("#3a2f25"), marginTop: "8px" }} onClick={() => setRemoving(false)}>Cancel</button>
        </div>
      )}

      <button style={{ ...S.btn("#3a2f25"), zIndex: 1 }} onClick={onLeave}>{"\u2190"} Back to map</button>
    </div>
  );
}
