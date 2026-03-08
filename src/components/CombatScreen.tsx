import { useState, useCallback } from "react";
import { S } from "../styles";
import { ENEMY_TYPES } from "../data/enemies";
import { STATUS_ICONS } from "../data/status";
import { shuffle, makeEnemy, drawCards, tickStatuses } from "../utils/helpers";
import { StatusBadges, HpBar, CardUI } from "./shared";
import type { DungeonNode, Player, Enemy, CombatPlayer } from "../types";

function EnemyPanel({ enemy, targeted, onClick }: {
  enemy: Enemy; targeted: boolean; onClick: () => void;
}) {
  const stunned = (enemy.statuses?.stun || 0) > 0;
  const crouching = enemy.mechanic === "ambush" && (enemy.ambushTurns ?? 0) > 0;
  return (
    <div onClick={onClick} style={{
      ...S.panel, cursor: "pointer", minWidth: "132px", maxWidth: "158px",
      border: `1px solid ${targeted ? "#8b0000" : "#2a1f15"}`,
      boxShadow: targeted ? "0 0 16px rgba(139,0,0,0.4)" : "none",
      transition: "all 0.2s", transform: targeted ? "scale(1.03)" : "scale(1)",
      opacity: enemy.hp <= 0 ? 0.2 : 1,
    }}>
      <div style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: "2px" }}>{enemy.ascii}</div>
      <div style={{ fontSize: "0.72rem", fontWeight: "bold", color: enemy.isBoss ? "#8b0000" : "#c9b99a", textAlign: "center", marginBottom: "2px", lineHeight: 1.2 }}>{enemy.name}</div>
      {enemy.mechanic && enemy.mechanic !== "boss" && (
        <div title={enemy.mechanicDesc} style={{
          fontSize: "0.52rem", color: "#4a3a2a", textAlign: "center",
          marginBottom: "3px", cursor: "help", borderBottom: "1px dotted #2a1f15", paddingBottom: "2px",
        }}>
          {"\u2699"} {enemy.mechanic.replace("_", " ")} {"\u2139"}
        </div>
      )}
      {crouching && <div style={{ fontSize: "0.6rem", color: "#f1c40f", textAlign: "center", marginBottom: "2px" }}>{"\u{1F9B4}"} Crouching {enemy.ambushTurns}t</div>}
      {stunned && <div style={{ fontSize: "0.6rem", color: "#f1c40f", textAlign: "center" }}>{"\u26A1"} Stunned</div>}
      <HpBar current={enemy.hp} max={enemy.maxHp} color="#8b0000" />
      {enemy.block > 0 && <div style={{ fontSize: "0.6rem", color: "#2980b9", textAlign: "center", marginTop: "2px" }}>{"\u{1F6E1}"} {enemy.block}</div>}
      <StatusBadges statuses={enemy.statuses} />
      <div style={{ fontSize: "0.56rem", color: "#3a2a1a", textAlign: "center", marginTop: "3px", fontStyle: "italic" }}>
        {crouching ? "Preparing..." : stunned ? "Skip turn" : `ATK ${(enemy.statuses?.weaken || 0) > 0 ? Math.floor(enemy.atk * 0.75) : enemy.atk}`}
      </div>
    </div>
  );
}

export function CombatScreen({ room, player, onVictory, onDefeat, onFleeToMap }: {
  room: DungeonNode;
  player: Player;
  onVictory: (p: CombatPlayer) => void;
  onDefeat: (gold: number) => void;
  onFleeToMap: (p: CombatPlayer) => void;
}) {
  const initEnemies = useCallback((): Enemy[] => {
    let enems = room.enemies.map(id => makeEnemy(id));
    if (room.trap === "snare") enems = enems.map(e => ({ ...e, statuses: { ...e.statuses, stun: 1 } }));
    if (room.trap === "flash") enems = enems.map(e => ({ ...e, hp: Math.max(1, e.hp - 8) }));
    return enems;
  }, [room]);

  const [enemies, setEnemies] = useState(initEnemies);
  const [p, setP] = useState<CombatPlayer>(() => {
    const shuffled = shuffle([...player.deck]);
    return { ...player, hand: shuffled.slice(0, 5), drawPile: shuffled.slice(5), discard: [], energy: player.maxEnergy, block: 0 };
  });
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [targetIdx, setTargetIdx] = useState(0);
  const [log, setLog] = useState([`\u2694 Combat begins: ${room.label}`]);
  const [animating, setAnimating] = useState(false);
  const [lightLevel, setLightLevel] = useState(4);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 10));
  const liveEnems = enemies.filter(e => e.hp > 0);

  function playCard(cardUid: string) {
    if (animating) return;
    const card = p.hand.find(c => c.uid === cardUid);
    if (!card || card.cost > p.energy) return;
    if (card.type === "skill" && (p.statuses?.silence || 0) > 0) { addLog("\u{1F507} Silenced."); return; }

    let np: CombatPlayer = { ...p, statuses: { ...p.statuses } };
    const enems = enemies.map(e => ({ ...e, statuses: { ...(e.statuses || {}) } }));
    const lines: string[] = [];
    np.energy -= card.cost;

    if (card.type === "attack" && (np.statuses?.blind || 0) > 0 && Math.random() < 0.3) {
      lines.push("\u{1F441}\uFE0F Blinded \u2014 miss!");
      np.hand = np.hand.filter(c => c.uid !== cardUid);
      np.discard = [...np.discard, card];
      lines.forEach(addLog); setP(np); return;
    }

    if (card.type === "attack") {
      const targets = card.aoe ? enems.filter(e => e.hp > 0) : [enems[targetIdx]].filter(Boolean);
      targets.forEach(t => {
        if (t.mechanic === "phase" && !card.holy && Math.random() < (t.evadeChance || 0.5)) { lines.push(`\u{1F47B} ${t.name} phases!`); return; }
        let dmg = card.value;
        if ((np.statuses?.weaken || 0) > 0) dmg = Math.floor(dmg * 0.75);
        if (card.holy && t.id === "vampire") dmg = Math.floor(dmg * 1.5);
        const bl = Math.min(t.block, dmg); t.block = Math.max(0, t.block - bl); const dealt = dmg - bl; t.hp -= dealt;
        lines.push(`\u2694 ${card.name}\u2192${t.name}: ${dmg}${bl > 0 ? ` (${bl}blk)` : ""}`);
        if (card.heal) { np.hp = Math.min(np.maxHp, np.hp + card.heal); lines.push(`+${card.heal}hp`); }
        if (card.healOnHit && dealt > 0) { np.hp = Math.min(np.maxHp, np.hp + dealt); lines.push(`+${dealt}hp Bloodlust`); }
        if (t.mechanic === "lifesteal" && dealt > 0) { const st = Math.floor(dealt * 0.5); t.hp = Math.min(t.maxHp, t.hp + st); lines.push(`\u{1F9DB} steals ${st}hp`); }
        if (card.applyStatus && card.applyStatus.target === "enemy") {
          const { status, stacks } = card.applyStatus;
          t.statuses[status] = (t.statuses[status] || 0) + stacks;
          lines.push(`${STATUS_ICONS[status]} ${t.name} ${status}\u00D7${stacks}`);
        }
        if (t.mechanic === "reassemble" && t.hp <= 0 && !t.reassembled && !card.finishing && card.value < 10) {
          t.hp = 5; t.reassembled = true; lines.push(`\u{1F480} Skeleton reassembles!`);
        }
        const idx = enems.findIndex(e => e.uid === t.uid); if (idx >= 0) enems[idx] = t;
      });
    } else if (card.type === "defend") {
      np.block += card.value; lines.push(`\u{1F6E1} +${card.value} Block`);
    } else {
      if (card.draw) { np = drawCards(card.draw, np); lines.push(`\u2728 Drew ${card.draw}`); }
      if (card.gainEnergy) { np.energy = Math.min(np.maxEnergy + 1, np.energy + card.gainEnergy); lines.push(`\u2728 +1 Energy`); }
      if (card.cleanse) { np.statuses = {}; lines.push("\u2728 Debuffs cleared"); }
      if (card.applyStatus && card.applyStatus.target === "enemy") {
        const t = enems[targetIdx];
        if (t) {
          const { status, stacks } = card.applyStatus;
          t.statuses[status] = (t.statuses[status] || 0) + stacks;
          lines.push(`${STATUS_ICONS[status]} ${t.name} ${status}\u00D7${stacks}`);
        }
      }
    }

    np.hand = np.hand.filter(c => c.uid !== cardUid);
    if (!card.exhaust) np.discard = [...np.discard, card];
    lines.forEach(addLog); setSelectedCard(null);

    const alive = enems.filter(e => e.hp > 0);
    if (!alive.length) {
      const loot = room.enemies.reduce((s, id) => s + (ENEMY_TYPES.find(t => t.id === id)?.loot || 0), 0);
      setP(prev => ({ ...prev, ...np })); setEnemies([]);
      setTimeout(() => onVictory({ ...np, gold: np.gold + loot, block: 0 }), 300);
    } else {
      setP(np); setEnemies(enems);
      if (targetIdx >= alive.length) setTargetIdx(0);
    }
  }

  function endTurn() {
    if (animating) return; setAnimating(true);
    let np: CombatPlayer = { ...p, statuses: { ...p.statuses } };
    const enems = enemies.map(e => ({ ...e, statuses: { ...(e.statuses || {}) } }));
    const lines: string[] = ["\u2014 Enemy Turn \u2014"];

    const necro = enems.find(e => e.id === "necromancer" && e.hp > 0);
    if (necro) {
      necro.summonCooldown = (necro.summonCooldown || 2) - 1;
      if (necro.summonCooldown <= 0) {
        const dead = enems.find(e => e.hp <= 0 && e.id !== "necromancer");
        if (dead) { dead.hp = Math.floor(dead.maxHp * 0.5); dead.statuses = {}; dead.reassembled = false; lines.push(`\u{1F9D9} Necro revives ${dead.name}!`); }
        else { enems.push(makeEnemy("zombie")); lines.push("\u{1F9D9} Necro summons Zombie!"); }
        necro.summonCooldown = 2;
      }
    }

    const banshee = enems.find(e => e.id === "banshee" && e.hp > 0 && !((e.statuses?.silence || 0) > 0));
    if (banshee) { np.maxEnergy = Math.max(1, (np.maxEnergy || 3) - 1); lines.push(`\u{1F441}\uFE0F Banshee drains energy \u2192 ${np.maxEnergy} max`); }

    const shadow = enems.find(e => e.id === "shadow" && e.hp > 0);
    if (shadow) { setLightLevel(prev => { const nl = Math.max(0, prev - 1); lines.push(nl === 0 ? "\u{1F311} Total darkness!" : "\u{1F311} Light fades."); return nl; }); }

    const rats = enems.filter(e => e.id === "rat" && e.hp > 0);
    if (rats.length) { const chip = rats.length; const bl = Math.min(np.block, chip); np.block = Math.max(0, np.block - bl); np.hp -= (chip - bl); lines.push(`\u{1F400} Rat swarm \u00D7${rats.length}: ${chip} chip dmg`); }

    enems.forEach(enemy => {
      if (enemy.hp <= 0) return;
      if ((enemy.statuses?.stun || 0) > 0) { lines.push(`\u26A1 ${enemy.name} stunned.`); return; }
      if (enemy.mechanic === "swarm") return;
      if (enemy.mechanic === "ambush") {
        if ((enemy.ambushTurns ?? 0) > 0) {
          enemy.ambushTurns = (enemy.ambushTurns ?? 0) - 1;
          if ((enemy.ambushTurns ?? 0) > 0) { lines.push(`\u{1F9B4} ${enemy.name} crouches...`); return; }
          else { const leap = enemy.atk * 3; const bl = Math.min(np.block, leap); np.block = Math.max(0, np.block - bl); np.hp -= (leap - bl); lines.push(`\u{1F9B4} LEAP: ${leap} dmg!`); return; }
        }
      }
      let atk = enemy.atk;
      if (enemy.id === "zombie" && enems.find(e => e.id === "necromancer" && e.hp > 0)) { atk *= 2; lines.push(`\u{1F9DF} ${enemy.name} empowered!`); }
      if ((enemy.statuses?.weaken || 0) > 0) atk = Math.floor(atk * 0.75);
      const bl = Math.min(np.block, atk); np.block = Math.max(0, np.block - bl); const dt = atk - bl; np.hp -= dt;
      lines.push(`${enemy.ascii} ${enemy.name}: ${atk}\u2192${dt} dmg`);
      if (enemy.mechanic === "lifesteal" && dt > 0) { const st = Math.floor(dt * 0.5); enemy.hp = Math.min(enemy.maxHp, enemy.hp + st); lines.push(`\u{1F9DB} heals ${st}`); }
    });

    const ptick = tickStatuses({ ...np, name: "You" });
    np = { ...np, ...ptick.entity }; ptick.log.forEach(l => lines.push(l));
    const tickedEnems = enems.map(e => { if (e.hp <= 0) return e; const t = tickStatuses(e); t.log.forEach(l => lines.push(l)); return t.entity as Enemy; });

    if (lightLevel <= 0 && np.hand.length > 0) {
      const ri = Math.floor(Math.random() * np.hand.length);
      np.discard = [...np.discard, np.hand[ri]];
      np.hand = np.hand.filter((_, i) => i !== ri);
      lines.push("\u{1F311} Darkness devours a card.");
    }

    if (np.hp <= 0) { lines.forEach(addLog); setAnimating(false); onDefeat(np.gold); return; }

    np.discard = [...np.discard, ...np.hand]; np.hand = []; np.block = 0; np.energy = np.maxEnergy;
    np = drawCards(5, np); lines.forEach(addLog); addLog("\u2014 Your Turn \u2014");
    setP(np); setEnemies(tickedEnems); setAnimating(false);
  }

  const uniqueMechanics = [...new Map(liveEnems.filter(e => e.mechanicDesc && e.mechanic !== "boss").map(e => [e.mechanic, e])).values()];

  return (
    <div style={{ ...S.root, padding: "0.8rem", gap: "0.55rem" }}>
      <div style={S.vignette} />

      <div style={{ display: "flex", gap: "1rem", alignItems: "center", zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ color: "#5a4a3a", fontSize: "0.7rem", letterSpacing: "0.15em" }}>
          {"\u2694"} <span style={{ color: "#8b0000" }}>{room.label.toUpperCase()}</span>
        </div>
        <div style={{ color: "#f0c040", fontSize: "0.72rem" }}>{"\u{1FA99}"} {p.gold}</div>
        <div style={{ fontSize: "0.7rem", color: lightLevel > 2 ? "#f0c040" : lightLevel > 0 ? "#e67e22" : "#8b0000" }}>
          {"\u{1F525}".repeat(lightLevel)}{"\u25AA".repeat(5 - lightLevel)}
        </div>
        <button style={{ ...S.btn("#3a2f25"), fontSize: "0.65rem", padding: "0.25rem 0.6rem" }} onClick={() => onFleeToMap(p)}>{"\u2190"} Flee to map</button>
      </div>

      <div style={{ display: "flex", gap: "0.8rem", zIndex: 1, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ ...S.panel, minWidth: "130px", maxWidth: "152px" }}>
          <div style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: "2px" }}>{"\u{1F9DD}"}</div>
          <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#c9b99a", textAlign: "center", marginBottom: "3px" }}>You</div>
          <HpBar current={p.hp} max={p.maxHp} color="#22a55a" />
          {p.block > 0 && <div style={{ fontSize: "0.6rem", color: "#2980b9", textAlign: "center", marginTop: "2px" }}>{"\u{1F6E1}"} {p.block}</div>}
          <StatusBadges statuses={p.statuses} />
          <div style={{ marginTop: "7px", display: "flex", justifyContent: "center", gap: "3px", flexWrap: "wrap" }}>
            {Array.from({ length: Math.max(p.maxEnergy, 3) }).map((_, i) => (
              <div key={i} style={{ width: "9px", height: "9px", borderRadius: "50%", background: i < p.energy ? "#8b0000" : "#1a1210", border: "1px solid #3a2f25" }} />
            ))}
          </div>
          <div style={{ fontSize: "0.58rem", color: "#5a4a3a", textAlign: "center", marginTop: "2px" }}>{p.energy}/{p.maxEnergy}</div>
        </div>

        <div style={{ color: "#2a1f15", fontSize: "1.3rem", alignSelf: "center" }}>{"\u2726"}</div>

        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "center" }}>
          {enemies.map((enemy, i) => (
            <EnemyPanel key={enemy.uid} enemy={enemy} targeted={targetIdx === i && enemy.hp > 0}
              onClick={() => { if (enemy.hp > 0) setTargetIdx(i); }} />
          ))}
        </div>
      </div>

      {uniqueMechanics.length > 0 && (
        <div style={{ ...S.panel, maxWidth: "560px", width: "100%", padding: "0.4rem 0.8rem", zIndex: 1 }}>
          {uniqueMechanics.map(e => (
            <div key={e.mechanic} style={{ fontSize: "0.62rem", color: "#4a3a2a", lineHeight: 1.5 }}>
              <span style={{ color: "#8b0000" }}>{"\u2699"} {e.name}:</span> {e.mechanicDesc}
            </div>
          ))}
        </div>
      )}

      <div style={{ ...S.panel, width: "100%", maxWidth: "560px", zIndex: 1, padding: "0.45rem 0.8rem" }}>
        {log.slice(0, 4).map((l, i) => (
          <div key={i} style={{ fontSize: "0.65rem", color: i === 0 ? "#c9b99a" : `rgba(90,74,58,${1 - i * 0.22})`, lineHeight: 1.45 }}>{l}</div>
        ))}
      </div>

      {selectedCard && (
        <div style={{ zIndex: 1, display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <button style={S.btn("#8b0000")} onClick={() => playCard(selectedCard)}>Play Card</button>
          <button style={S.btn("#3a2f25")} onClick={() => setSelectedCard(null)}>Cancel</button>
          {liveEnems.length > 1 && <div style={{ fontSize: "0.68rem", color: "#5a4a3a" }}>{"\u2192"} <span style={{ color: "#c9b99a" }}>{enemies[targetIdx]?.name}</span></div>}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", justifyContent: "center", zIndex: 1, padding: "0 0.4rem" }}>
        {p.hand.map(card => (
          <CardUI key={card.uid} card={card} selected={selectedCard === card.uid} affordable={card.cost <= p.energy}
            onClick={() => { if (card.cost <= p.energy) setSelectedCard(selectedCard === card.uid ? null : card.uid); }} />
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem", zIndex: 1, alignItems: "center", flexWrap: "wrap", justifyContent: "center", paddingBottom: "0.8rem" }}>
        <div style={{ fontSize: "0.6rem", color: "#3a2f25" }}>Draw:{p.drawPile.length} Discard:{p.discard.length}</div>
        <button style={S.btn("#5a3a1a", animating)} onClick={endTurn} disabled={animating}>End Turn {"\u2192"}</button>
      </div>
    </div>
  );
}
