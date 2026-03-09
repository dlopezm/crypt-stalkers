import { useState } from "react";
import { btnStyle } from "../styles";
import { BUILDINGS } from "../data/buildings";
import { WEAPONS } from "../data/weapons";
import { CONSUMABLES } from "../data/consumables";
import { ABILITIES } from "../data/abilities";
import { DUNGEONS } from "../data/rooms";
import { HpBar, StatusBadges } from "./shared";
import type { Player, Weapon, Consumable, BuildingDef, DungeonDef } from "../types";

type ActiveBuilding = string | null;

export function TownScreen({
  player,
  onUpdatePlayer,
  onEnterDungeon,
}: {
  player: Player;
  onUpdatePlayer: (p: Player) => void;
  onEnterDungeon: (def: DungeonDef) => void;
}) {
  const [activeBuilding, setActiveBuilding] = useState<ActiveBuilding>(null);

  const bld = (id: string) => player.buildings[id];

  function buyWeapon(w: Weapon) {
    if (player.gold < w.cost) return;
    if (player.weapons.some((pw) => pw.id === w.id)) return;
    onUpdatePlayer({
      ...player,
      gold: player.gold - w.cost,
      weapons: [...player.weapons, { ...w }],
    });
  }

  function buyConsumable(c: Consumable) {
    if (player.gold < c.cost) return;
    onUpdatePlayer({
      ...player,
      gold: player.gold - c.cost,
      consumables: [...player.consumables, { ...c }],
    });
  }

  function unlockBuilding(b: BuildingDef) {
    if (player.gold < b.unlockCost) return;
    if (bld(b.id)?.unlocked) return;
    const buildings = { ...player.buildings, [b.id]: { unlocked: true, level: 1 } };
    const newAbilities = [...player.abilities];
    ABILITIES.filter((a) => a.building === b.id && a.buildingLevel <= 1).forEach((a) => {
      if (!newAbilities.includes(a.id)) newAbilities.push(a.id);
    });
    onUpdatePlayer({
      ...player,
      gold: player.gold - b.unlockCost,
      buildings,
      abilities: newAbilities,
    });
  }

  function upgradeBuilding(b: BuildingDef) {
    const state = bld(b.id);
    if (!state?.unlocked || state.level >= 2 || player.gold < b.upgradeCost) return;
    const buildings = { ...player.buildings, [b.id]: { unlocked: true, level: 2 } };
    const newAbilities = [...player.abilities];
    ABILITIES.filter((a) => a.building === b.id && a.buildingLevel <= 2).forEach((a) => {
      if (!newAbilities.includes(a.id)) newAbilities.push(a.id);
    });
    onUpdatePlayer({
      ...player,
      gold: player.gold - b.upgradeCost,
      buildings,
      abilities: newAbilities,
    });
  }

  function renderBuildingInterior() {
    if (!activeBuilding) return null;
    const b = BUILDINGS.find((b) => b.id === activeBuilding);
    if (!b) return null;
    const state = bld(b.id);

    if (!state?.unlocked) {
      return (
        <div className="panel max-w-lg w-full">
          <div className="text-lg font-bold text-crypt-text mb-2">
            {b.icon} {b.name}
          </div>
          <p className="text-sm text-crypt-muted mb-4">{b.desc}</p>
          <p className="text-sm text-crypt-dim mb-3">This building is locked.</p>
          <button
            style={btnStyle("#8b0000", player.gold < b.unlockCost)}
            disabled={player.gold < b.unlockCost}
            onClick={() => unlockBuilding(b)}
          >
            Unlock ({b.unlockCost}
            {"\u{1FA99}"})
          </button>
        </div>
      );
    }

    if (b.id === "smithy") return renderSmithy();
    if (b.id === "store") return renderStore();
    if (b.id === "tavern") return renderTavern();
    if (["shrine", "hunter", "knight", "alchemist"].includes(b.id)) return renderAbilityBuilding(b);
    if (b.id === "cartographer") return renderCartographer(b);
    return null;
  }

  function renderSmithy() {
    const owned = new Set(player.weapons.map((w) => w.id));
    return (
      <div className="panel max-w-xl w-full">
        <div className="text-lg font-bold text-crypt-text mb-1">{"\u2692\uFE0F"} Smithy</div>
        <p className="text-xs text-crypt-dim mb-3">
          Purchase weapons. You can switch between owned weapons in combat.
        </p>
        <div className="flex flex-col gap-2">
          {WEAPONS.filter((w) => w.cost > 0).map((w) => (
            <div
              key={w.id}
              className="flex justify-between items-center pb-2 border-b border-crypt-border-dim"
            >
              <div className="flex-1">
                <div className="text-sm text-crypt-text">
                  {w.icon} {w.name}{" "}
                  <span className="text-crypt-dim">
                    ({w.damage} {w.range})
                  </span>
                </div>
                <div className="text-xs text-crypt-muted">{w.desc}</div>
              </div>
              {owned.has(w.id) ? (
                <span className="text-xs text-crypt-green ml-3">Owned</span>
              ) : (
                <button
                  style={btnStyle("#8b0000", player.gold < w.cost)}
                  disabled={player.gold < w.cost}
                  className="ml-3 whitespace-nowrap"
                  onClick={() => buyWeapon(w)}
                >
                  {w.cost}
                  {"\u{1FA99}"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderStore() {
    return (
      <div className="panel max-w-xl w-full">
        <div className="text-lg font-bold text-crypt-text mb-1">{"\u{1F3EA}"} General Store</div>
        <p className="text-xs text-crypt-dim mb-3">Purchase consumables. Use them in combat.</p>
        <div className="flex flex-col gap-2">
          {CONSUMABLES.map((c) => (
            <div
              key={c.id}
              className="flex justify-between items-center pb-2 border-b border-crypt-border-dim"
            >
              <div className="flex-1">
                <div className="text-sm text-crypt-text">
                  {c.icon} {c.name}
                </div>
                <div className="text-xs text-crypt-muted">{c.desc}</div>
              </div>
              <button
                style={btnStyle("#8b0000", player.gold < c.cost)}
                disabled={player.gold < c.cost}
                className="ml-3 whitespace-nowrap"
                onClick={() => buyConsumable(c)}
              >
                {c.cost}
                {"\u{1FA99}"}
              </button>
            </div>
          ))}
        </div>
        {player.consumables.length > 0 && (
          <div className="mt-3 pt-3 border-t border-crypt-border-dim">
            <div className="text-xs text-crypt-dim mb-1">
              YOUR INVENTORY ({player.consumables.length})
            </div>
            <div className="flex gap-1 flex-wrap">
              {player.consumables.map((c, i) => (
                <span
                  key={i}
                  className="text-xs bg-[#1a1610] border border-crypt-border-dim rounded px-2 py-0.5 text-crypt-muted"
                >
                  {c.icon} {c.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderTavern() {
    return (
      <div className="panel max-w-lg w-full">
        <div className="text-lg font-bold text-crypt-text mb-1">{"\u{1F37A}"} Tavern</div>
        <p className="text-sm text-crypt-muted mb-3">
          The barkeep nods toward the back of the tavern. A cloaked figure traces the outline of a
          map.
        </p>
        <p className="text-xs text-crypt-dim italic">
          "Three paths into the dark, stranger. Shallow Graves for the green. The Crypt for the
          tested. The Lich's Domain... for the doomed."
        </p>
      </div>
    );
  }

  function renderAbilityBuilding(b: BuildingDef) {
    const state = bld(b.id);
    const buildingAbilities = ABILITIES.filter((a) => a.building === b.id);
    return (
      <div className="panel max-w-xl w-full">
        <div className="text-lg font-bold text-crypt-text mb-1">
          {b.icon} {b.name}{" "}
          <span className="text-xs text-crypt-dim">(Level {state?.level || 0})</span>
        </div>
        <p className="text-xs text-crypt-dim mb-3">{b.desc}</p>
        <div className="flex flex-col gap-2">
          {buildingAbilities.map((a) => {
            const unlocked = player.abilities.includes(a.id);
            const available = (state?.level || 0) >= a.buildingLevel;
            return (
              <div
                key={a.id}
                className={`flex justify-between items-center pb-2 border-b border-crypt-border-dim ${!available ? "opacity-40" : ""}`}
              >
                <div className="flex-1">
                  <div className="text-sm text-crypt-text">
                    {a.icon} {a.name}
                  </div>
                  <div className="text-xs text-crypt-muted">{a.desc}</div>
                  {!available && (
                    <div className="text-xs text-crypt-red">
                      Requires building level {a.buildingLevel}
                    </div>
                  )}
                </div>
                {unlocked && <span className="text-xs text-crypt-green ml-3">Learned</span>}
              </div>
            );
          })}
        </div>
        {state && state.level < 2 && b.upgradeCost > 0 && (
          <button
            style={btnStyle("#6a3a1a", player.gold < b.upgradeCost)}
            disabled={player.gold < b.upgradeCost}
            className="mt-3"
            onClick={() => upgradeBuilding(b)}
          >
            Upgrade to Level 2 ({b.upgradeCost}
            {"\u{1FA99}"})
          </button>
        )}
      </div>
    );
  }

  function renderCartographer(b: BuildingDef) {
    const state = bld(b.id);
    return (
      <div className="panel max-w-lg w-full">
        <div className="text-lg font-bold text-crypt-text mb-1">
          {b.icon} {b.name}{" "}
          <span className="text-xs text-crypt-dim">(Level {state?.level || 0})</span>
        </div>
        <p className="text-sm text-crypt-muted mb-3">{b.desc}</p>
        <div className="text-sm text-crypt-dim italic">
          {"\u{1F5FA}\uFE0F"} Your scouting reveals more details about dungeon rooms. Passive bonus.
        </div>
        {state && state.level < 2 && b.upgradeCost > 0 && (
          <button
            style={btnStyle("#6a3a1a", player.gold < b.upgradeCost)}
            disabled={player.gold < b.upgradeCost}
            className="mt-3"
            onClick={() => upgradeBuilding(b)}
          >
            Upgrade ({b.upgradeCost}
            {"\u{1FA99}"})
          </button>
        )}
      </div>
    );
  }

  const diffStars = (n: number) => "\u2605".repeat(n) + "\u2606".repeat(3 - n);
  const diffColor = (n: number) => (n === 1 ? "#3ddc84" : n === 2 ? "#e6a817" : "#e74c3c");

  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center gap-4 relative overflow-y-auto p-4">
      <div className="vignette" />

      {/* Header */}
      <div className="relative z-1 text-center">
        <h1
          className="text-[clamp(1.8rem,4vw,2.8rem)] tracking-[0.15em] uppercase text-crypt-gold font-bold"
          style={{ textShadow: "0 0 20px #f0c040, 0 0 40px #8a6010" }}
        >
          {"\u{1F3F0}"} Town
        </h1>
        <div className="text-crypt-dim tracking-[0.25em] text-xs">
          {"\u25C6"} A HAVEN FROM DARKNESS {"\u25C6"}
        </div>
      </div>

      {/* Player status bar */}
      <div className="panel max-w-2xl w-full relative z-1">
        <div className="flex gap-6 items-center flex-wrap justify-center">
          <div className="flex-1 min-w-[140px]">
            <HpBar current={player.hp} max={player.maxHp} color="#3ddc84" />
          </div>
          <div className="text-crypt-gold text-base font-bold">
            {"\u{1FA99}"} {player.gold}
          </div>
          <div className="text-crypt-muted text-sm">
            {"\u{1F5E1}\uFE0F"} {player.weapons.length} weapons
          </div>
          <div className="text-crypt-muted text-sm">
            {"\u{1F392}"} {player.consumables.length} items
          </div>
          {player.abilities.length > 0 && (
            <div className="text-crypt-muted text-sm">
              {"\u2728"} {player.abilities.length} abilities
            </div>
          )}
        </div>
        <StatusBadges statuses={player.statuses} />
      </div>

      {/* Buildings grid */}
      <div className="flex gap-3 flex-wrap justify-center relative z-1 max-w-3xl">
        {BUILDINGS.map((b) => {
          const state = bld(b.id);
          const unlocked = state?.unlocked;
          const isActive = activeBuilding === b.id;
          return (
            <div
              key={b.id}
              onClick={() => setActiveBuilding(isActive ? null : b.id)}
              className="panel cursor-pointer transition-all duration-200 select-none"
              style={{
                width: "150px",
                minHeight: "120px",
                border: `1px solid ${isActive ? "#d4a830" : unlocked ? "#3a3020" : "#201820"}`,
                opacity: unlocked ? 1 : 0.6,
                boxShadow: isActive ? "0 0 20px rgba(212,168,48,0.3)" : "none",
              }}
            >
              <div className="text-center text-2xl mb-1">{unlocked ? b.icon : "\u{1F512}"}</div>
              <div className="text-sm font-bold text-center text-crypt-text leading-tight mb-1">
                {b.name}
              </div>
              {unlocked ? (
                <div className="text-xs text-crypt-dim text-center">
                  {state?.level ? `Level ${state.level}` : ""}
                </div>
              ) : (
                <div className="text-xs text-crypt-red text-center">
                  {b.unlockCost}
                  {"\u{1FA99}"} to unlock
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Building interior panel */}
      {activeBuilding && (
        <div className="relative z-1 flex flex-col items-center gap-3 w-full max-w-xl">
          {renderBuildingInterior()}
          <button style={btnStyle("#3a2f25")} onClick={() => setActiveBuilding(null)}>
            {"\u2190"} Back
          </button>
        </div>
      )}

      {/* Dungeon selection */}
      {!activeBuilding && (
        <div className="relative z-1 w-full max-w-2xl">
          <div className="text-xs text-crypt-dim tracking-[0.2em] mb-2 uppercase text-center">
            {"\u2620"} Choose Your Descent {"\u2620"}
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            {DUNGEONS.map((d) => (
              <div
                key={d.id}
                className="panel flex flex-col items-center gap-2"
                style={{ width: "200px" }}
              >
                <div className="text-sm font-bold text-crypt-text text-center">{d.name}</div>
                <div className="text-sm tracking-wider" style={{ color: diffColor(d.difficulty) }}>
                  {diffStars(d.difficulty)}
                </div>
                <div className="text-xs text-crypt-muted text-center leading-relaxed">{d.desc}</div>
                <div className="text-xs text-crypt-dim">
                  Difficulty {d.difficulty} {"\u00B7"} Randomized layout
                </div>
                <button
                  style={btnStyle("#8b0000")}
                  className="w-full"
                  onClick={() => onEnterDungeon(d)}
                >
                  {"\u2694"} Descend
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory overview when no building selected */}
      {!activeBuilding && (
        <div className="panel max-w-2xl w-full relative z-1">
          <div className="text-xs text-crypt-dim tracking-[0.2em] mb-2 uppercase">
            Equipment & Inventory
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <div className="text-xs text-crypt-muted mb-1">Weapons:</div>
              <div className="flex gap-1 flex-wrap">
                {player.weapons.map((w, i) => (
                  <span
                    key={i}
                    className={`text-xs rounded px-2 py-0.5 ${i === player.activeWeaponIdx ? "bg-[#3a2a14] border border-crypt-gold text-crypt-gold" : "bg-[#1a1610] border border-crypt-border-dim text-crypt-muted"}`}
                  >
                    {w.icon} {w.name} ({w.damage} {w.range})
                  </span>
                ))}
              </div>
            </div>
            {player.consumables.length > 0 && (
              <div>
                <div className="text-xs text-crypt-muted mb-1">Consumables:</div>
                <div className="flex gap-1 flex-wrap">
                  {player.consumables.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#1a1610] border border-crypt-border-dim rounded px-2 py-0.5 text-crypt-muted"
                    >
                      {c.icon} {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {player.abilities.length > 0 && (
              <div>
                <div className="text-xs text-crypt-muted mb-1">Abilities:</div>
                <div className="flex gap-1 flex-wrap">
                  {player.abilities.map((id) => {
                    const a = ABILITIES.find((ab) => ab.id === id);
                    return a ? (
                      <span
                        key={id}
                        className="text-xs bg-[#1a1610] border border-crypt-border-dim rounded px-2 py-0.5 text-crypt-muted"
                      >
                        {a.icon} {a.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
