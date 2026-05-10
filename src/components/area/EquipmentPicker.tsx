import { useState } from "react";
import type { IconProps } from "../../icons";
import { btnStyle, FONT } from "../../styles";
import {
  ABILITY_DICE,
  ARMOR_DICE,
  COLORS,
  getFace,
  OFFHAND_DICE,
  WEAPON_DICE,
} from "../../dice-combat/dice-defs";
import type { FaceColor } from "../../dice-combat/types";
import type { Player } from "../../types";
import { WEAPONS } from "../../data/weapons";
import { STARTER_ABILITY_ID } from "../../data/constants";

export type EquipmentSlot = "main" | "offhand" | "armor" | "ability";

interface Props {
  readonly player: Player;
  readonly debugMode: boolean;
  readonly onEquip: (slot: EquipmentSlot, id: string) => void;
  readonly onGrantAndEquip: (slot: EquipmentSlot, id: string) => void;
  readonly onClose: () => void;
}

export function EquipmentPicker({ player, debugMode, onEquip, onGrantAndEquip, onClose }: Props) {
  const [tab, setTab] = useState<EquipmentSlot>("main");
  const [showAll, setShowAll] = useState(false);

  const ownedGridWeaponIds = new Set(player.ownedGridWeaponIds);
  const ownedGridOffhandIds = new Set(player.ownedGridOffhandIds);
  const ownedAbilityIds = new Set(player.abilities);
  // Steady Hands is always available — it's the Fourth Hand's basic kit.
  ownedAbilityIds.add(STARTER_ABILITY_ID);
  const ownedArmorIds = new Set(player.ownedGridArmorIds);

  const items: Array<{
    id: string;
    name: string;
    icon: React.FC<IconProps>;
    faces: readonly string[];
    owned: boolean;
    equipped: boolean;
  }> = [];

  if (tab === "main") {
    for (const w of WEAPONS) {
      if (w.hand === "offhand") continue;
      if (!WEAPON_DICE[w.id]) continue;
      items.push({
        id: w.id,
        name: w.name,
        icon: WEAPON_DICE[w.id].icon,
        faces: WEAPON_DICE[w.id].faces,
        owned: ownedGridWeaponIds.has(w.id),
        equipped: player.mainWeapon.id === w.id,
      });
    }
  } else if (tab === "offhand") {
    for (const w of WEAPONS) {
      if (w.hand !== "offhand") continue;
      if (!OFFHAND_DICE[w.id]) continue;
      items.push({
        id: w.id,
        name: w.name,
        icon: OFFHAND_DICE[w.id].icon,
        faces: OFFHAND_DICE[w.id].faces,
        owned: ownedGridOffhandIds.has(w.id),
        equipped: player.offhandWeapon?.id === w.id,
      });
    }
  } else if (tab === "armor") {
    for (const [id, def] of Object.entries(ARMOR_DICE)) {
      items.push({
        id,
        name: def.name,
        icon: def.icon,
        faces: def.faces,
        owned: ownedArmorIds.has(id),
        equipped: player.gridArmorId === id,
      });
    }
  } else if (tab === "ability") {
    for (const def of Object.values(ABILITY_DICE)) {
      items.push({
        id: def.id,
        name: def.name,
        icon: def.icon,
        faces: def.faces,
        owned: ownedAbilityIds.has(def.id),
        equipped: (player.activeAbilityId ?? STARTER_ABILITY_ID) === def.id,
      });
    }
  }

  const visible = debugMode || showAll ? items : items.filter((it) => it.owned);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
        fontFamily: FONT,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a120c",
          border: "1px solid #3a2a1c",
          borderRadius: "8px",
          padding: "1.2rem",
          width: "min(720px, 100%)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          color: "#ece0c8",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.8rem",
          }}
        >
          <div style={{ fontSize: "1.2rem", letterSpacing: "0.05em" }}>
            ⚙️ Equipment {debugMode ? <span style={{ color: "#9b59b6" }}>· DEBUG</span> : null}
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {!debugMode && (
              <button
                onClick={() => setShowAll((v) => !v)}
                style={{
                  ...btnStyle(showAll ? "#6a3a1a" : "#2a1f18", showAll),
                  fontSize: "0.8rem",
                }}
              >
                {showAll ? "Owned only" : "Show all"}
              </button>
            )}
            <button onClick={onClose} style={{ ...btnStyle("#3a2a1c"), fontSize: "0.8rem" }}>
              Close ✕
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
          {(["main", "offhand", "armor", "ability"] as const).map((slot) => (
            <button
              key={slot}
              onClick={() => setTab(slot)}
              style={btnStyle(tab === slot ? "#6a3a1a" : "#2a1f18", tab === slot)}
            >
              {SLOT_LABELS[slot]}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "0.6rem",
            overflowY: "auto",
            paddingRight: "0.4rem",
          }}
        >
          {visible.length === 0 ? (
            <div style={{ opacity: 0.5, fontStyle: "italic", padding: "1rem" }}>
              Nothing owned in this slot yet.
            </div>
          ) : (
            visible.map((it) => (
              <ItemCard
                key={it.id}
                item={it}
                onClick={() => {
                  if (it.equipped) return;
                  if (it.owned) onEquip(tab, it.id);
                  else onGrantAndEquip(tab, it.id);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  main: "🗡️ Main Hand",
  offhand: "🛡️ Off Hand",
  armor: "👕 Armor",
  ability: "✋ Ability",
};

function ItemCard({
  item,
  onClick,
}: {
  item: {
    id: string;
    name: string;
    icon: React.FC<IconProps>;
    faces: readonly string[];
    owned: boolean;
    equipped: boolean;
  };
  onClick: () => void;
}) {
  const border = item.equipped
    ? "2px solid #f1c40f"
    : item.owned
      ? "1px solid #3a2a1c"
      : "1px dashed #5a4a30";
  return (
    <button
      onClick={onClick}
      disabled={item.equipped}
      style={{
        background: "#0f0a07",
        border,
        borderRadius: "6px",
        padding: "0.6rem",
        textAlign: "left",
        color: "#ece0c8",
        fontFamily: FONT,
        cursor: item.equipped ? "default" : "pointer",
        opacity: item.owned ? 1 : 0.65,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: "0.95rem" }}>
          {(() => {
            const I = item.icon;
            return (
              <I
                style={{
                  width: "1em",
                  height: "1em",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
              />
            );
          })()}{" "}
          {item.name}
        </div>
        {item.equipped ? (
          <div style={{ fontSize: "0.65rem", color: "#f1c40f" }}>EQUIPPED</div>
        ) : !item.owned ? (
          <div style={{ fontSize: "0.65rem", color: "#9b59b6" }}>DEBUG</div>
        ) : null}
      </div>
      <div style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "2px" }}>
        {item.faces.map((faceId, idx) => {
          const face = getFace(faceId);
          if (!face) return null;
          const colorId: FaceColor = face.color;
          const color = COLORS[colorId];
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.65rem",
                opacity: 0.9,
              }}
              title={`${face.label} (${color.label})`}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  background: color.hex,
                  borderRadius: "2px",
                  display: "inline-block",
                }}
              />
              <span style={{ width: "10px", textAlign: "center" }}>{color.badge}</span>
              <span style={{ flex: 1 }}>{face.label}</span>
            </div>
          );
        })}
      </div>
    </button>
  );
}
