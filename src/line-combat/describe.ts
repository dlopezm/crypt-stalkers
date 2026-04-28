/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — Ability Description Generator
   Auto-generates a human-readable description from a LineAbility's
   structured fields. Stays in sync if balance values change.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { LineAbility, LinePattern, LineReposition, LineAbilitySpecial } from "./types";

function describePattern(p: LinePattern): string {
  switch (p.type) {
    case "self":
      return "Self-targeted.";
    case "adjacent":
      return "Hits an adjacent slot (±1).";
    case "adjacent_forward":
      return "Hits the slot directly in front (distance 1).";
    case "reach":
      return p.minDist === p.maxDist
        ? `Reaches distance ${p.minDist}.`
        : `Reaches distances ${p.minDist}–${p.maxDist} (first target).`;
    case "pierce":
      return `Pierces through all targets at distances ${p.minDist}–${p.maxDist}.`;
    case "scatter":
      return `Targets distance ${p.targetMinDist}–${p.targetMaxDist}; also hits ±${p.spread} slots around target.`;
    case "gap":
      return `Hits ONLY at exact distance ${p.exactDist} (skips closer slots).`;
    case "sweep":
      return `Sweeps all slots at distances ${p.minDist}–${p.maxDist}.`;
    case "full_line":
      return "Hits every entity on the line.";
    case "self_burst":
      return `Bursts in radius ${p.radius} around caster.`;
  }
}

function describeReposition(r: LineReposition): string {
  switch (r.type) {
    case "push_target":
      return `Pushes target ${r.distance} slot${r.distance > 1 ? "s" : ""} away.`;
    case "pull_target":
      return `Pulls target ${r.distance} slot${r.distance > 1 ? "s" : ""} closer.`;
    case "push_self":
      return `Caster moves ${r.distance} slot${r.distance > 1 ? "s" : ""} away from target.`;
    case "pull_self":
      return `Caster lunges ${r.distance} slot${r.distance > 1 ? "s" : ""} toward target.`;
    case "switch":
      return "Caster and target swap positions.";
    case "push_all_in_range":
      return `Pushes all entities in range ${r.distance} slot${r.distance > 1 ? "s" : ""} outward.`;
  }
}

function describeSpecial(s: LineAbilitySpecial): string | null {
  switch (s.type) {
    case "lifesteal":
      return `Heals caster for ${Math.round(s.fraction * 100)}% of damage dealt.`;
    case "gain_armor":
      return s.amount > 0
        ? `Grants +${s.amount} armor for ${s.turns} turn${s.turns > 1 ? "s" : ""}.`
        : null;
    case "wall_slam_bonus":
      return `+${s.extraDamage} bonus damage if target is at the wall.`;
    case "drain_ap":
      return `Drains ${s.amount} AP from the player.`;
    case "summon":
      return `Summons a ${s.enemyId.replace(/_/g, " ")}.`;
    case "raise_dead":
      return `Raises a corpse as an undead minion (at ${Math.round(s.hpFraction * 100)}% HP).`;
    case "mass_raise_dead":
      return `Raises ALL corpses as undead minions (at ${Math.round(s.hpFraction * 100)}% HP).`;
    case "create_terrain":
      return `Creates ${s.terrain.type.replace(/_/g, " ")} terrain.`;
    case "create_terrain_aoe":
      return `Creates ${s.terrain.type.replace(/_/g, " ")} terrain in radius ${s.radius}.`;
    case "teleport_self":
      return `Teleports to ${s.targetType.replace(/_/g, " ")}.`;
    case "teleport_to_adjacent_target":
      return "Teleports adjacent to target.";
    case "steal_salt":
      return `Steals ${s.amount} salt from the player.`;
    case "intercept_for_allies":
      return "Moves to block line-of-sight to vulnerable allies.";
    case "command_ally_extra_action":
      return "Grants nearest ally an extra action this turn.";
    case "overwatch_trigger":
      return `Reaction: triggers on enemy entering distance ${s.rangeBand.min}–${s.rangeBand.max}, dealing ${s.damage} damage.`;
    case "riposte_trigger":
      return `Reaction: counter-attacks for ${s.damage} damage when hit.`;
    case "negate_hit":
      return "Negates the next incoming hit.";
    case "metamorphosis":
      return `Transforms into ${s.targetEnemyId.replace(/_/g, " ")} after ${s.turnsLeft} turns.`;
    case "mist_form":
      return `Becomes incorporeal and immune to damage for ${s.turns} turns.`;
    case "blood_puppet_corpse":
      return "Animates a corpse as a blood puppet.";
    case "apply_dark_zone":
      return `Creates a dark zone for ${s.turns} turns.`;
    case "phylactery_shield":
      return `Phylactery: +${s.armor} armor while minions are alive.`;
    case "barrier_breach":
      return "Strips armor buffs from all targets.";
    case "eclipse":
      return `Eclipse: dark zone covers half the line for ${s.turns} turns.`;
    case "dirge_zone":
      return `Creates a dirge zone (${s.damagePerTurn} dmg + ${s.apDrainPerTurn} AP drain per turn) for ${s.turns} turns.`;
    case "immobilize_both":
      return "Immobilizes both caster and target.";
  }
}

export function describeAbility(ability: LineAbility): string {
  const parts: string[] = [];

  // Pattern
  parts.push(describePattern(ability.pattern));

  // Damage
  if (ability.damage > 0) {
    const dt = ability.damageType ? ` ${ability.damageType}` : "";
    parts.push(`Deals ${ability.damage}${dt} damage.`);
  }

  // Conditions
  for (const cond of ability.conditions) {
    parts.push(`Applies ${cond.stacks} stack${cond.stacks > 1 ? "s" : ""} of ${cond.condition}.`);
  }

  // Reposition
  if (ability.reposition) {
    parts.push(describeReposition(ability.reposition));
  }

  // Special
  for (const sp of ability.special) {
    const d = describeSpecial(sp);
    if (d) parts.push(d);
  }

  // Cost / cooldown
  const meta: string[] = [];
  if (ability.apCost > 0) meta.push(`${ability.apCost} AP`);
  if (ability.cooldown > 0) meta.push(`${ability.cooldown}-turn cooldown`);
  if (ability.silenceBlocked) meta.push("blocked by silence");
  if (meta.length > 0) parts.push(`(${meta.join(", ")})`);

  return parts.join(" ");
}
