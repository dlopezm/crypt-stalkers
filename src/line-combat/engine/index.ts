/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — Engine Entry Point
   Orchestrates the combat state machine.
   ═══════════════════════════════════════════════════════════════════════════ */

import type {
  LineCombatState,
  LineEncounterDef,
  LinePlayerAction,
  LineTerrain,
  LinePlayerState,
} from "../types";
import { LINE_BALANCE } from "../balance";
import { buildTelegraphs } from "./telegraph";
import { executePlayerAbility, collectSalt, resolveSlotsForAbility } from "./execute-player";
import { executeAllTelegraphs } from "./execute-enemy";
import { endOfTurn } from "./end-of-turn";
import { movePlayer } from "./positioning";
import { makeLineEnemy } from "../enemy-defs";
import { getWeaponAbilities } from "../equipment";

// ─── Initialize combat from encounter definition ───

export function initLineCombat(
  encounter: LineEncounterDef,
  playerData: {
    hp: number;
    maxHp: number;
    salt: number;
    mainWeaponId: string;
    offhandId: string | null;
    armorId: string;
    armor: number;
  },
): LineCombatState {
  const slots: LineTerrain[] = Array.from({ length: encounter.lineLength }, (_, i) => {
    return encounter.terrain[i] ?? { type: "empty" };
  });

  const player: LinePlayerState = {
    position: encounter.playerStartSlot,
    hp: playerData.hp,
    maxHp: playerData.maxHp,
    ap: LINE_BALANCE.player.baseAp,
    maxAp: LINE_BALANCE.player.baseAp,
    salt: playerData.salt,
    armor: playerData.armor,
    mainWeaponId: playerData.mainWeaponId,
    offhandId: playerData.offhandId,
    armorId: playerData.armorId,
    conditions: {},
    abilityCooldowns: {},
    ripostePending: false,
    overwatchActive: false,
    negateNextHit: false,
    mistFormTurns: 0,
  };

  const enemies = encounter.enemies.map(([id, slot]) => makeLineEnemy(id, slot));

  const initialState: LineCombatState = {
    lineLength: encounter.lineLength,
    slots,
    player,
    enemies,
    corpses: [],
    phase: "telegraph",
    telegraphs: [],
    turn: 1,
    goal: encounter.goal,
    reinforcements: [...encounter.reinforcements],
    dirgeZones: [],
    log: [`⚔️ Combat begins: ${encounter.name}`],
  };

  // Generate first turn telegraphs
  return buildTelegraphs(initialState);
}

// ─── Player action dispatcher ───

export function applyPlayerAction(
  state: LineCombatState,
  action: LinePlayerAction,
): LineCombatState {
  if (state.phase !== "player_turn") return state;

  switch (action.type) {
    case "move": {
      const { state: newState, success, reason } = movePlayer(state, action.toSlot);
      if (!success) {
        return { ...state, log: [...state.log, `Cannot move: ${reason}`] };
      }
      return newState;
    }

    case "use_ability": {
      // Get abilities from equipped weapon
      const weaponAbilities = getWeaponAbilities(state.player.mainWeaponId);
      const ability = weaponAbilities.find((a) => a.id === action.abilityId);
      if (!ability) {
        return { ...state, log: [...state.log, `Unknown ability: ${action.abilityId}`] };
      }
      return executePlayerAbility(
        state,
        action.abilityId,
        ability,
        action.targetSlot,
        action.direction,
      );
    }

    case "collect_salt": {
      return collectSalt(state, action.fromCorpseUid);
    }

    case "end_turn": {
      return resolveEnemyTurn(state);
    }
  }
}

// ─── Resolve enemy turn (after player ends turn) ───

function resolveEnemyTurn(state: LineCombatState): LineCombatState {
  state = { ...state, phase: "resolving" };
  state = executeAllTelegraphs(state);

  if (state.phase === "defeat" || state.phase === "victory") return state;

  state = endOfTurn(state);

  if (state.phase === "defeat" || state.phase === "victory") return state;

  // Generate new telegraphs for next turn
  return buildTelegraphs(state);
}

// ─── Selectors ───

export function getPlayerAbilities(state: LineCombatState) {
  return getWeaponAbilities(state.player.mainWeaponId).filter((a) => !a.isReaction);
}

export function getPlayerReactions(state: LineCombatState) {
  return getWeaponAbilities(state.player.mainWeaponId).filter((a) => a.isReaction);
}

export function isVictory(state: LineCombatState): boolean {
  return state.phase === "victory";
}

export function isDefeat(state: LineCombatState): boolean {
  return state.phase === "defeat";
}

export function isPlayerTurn(state: LineCombatState): boolean {
  return state.phase === "player_turn";
}

export function getAffectedSlotsForAbility(
  state: LineCombatState,
  abilityId: string,
  targetSlot: number,
  direction: 1 | -1,
): number[] {
  const ability = getWeaponAbilities(state.player.mainWeaponId).find((a) => a.id === abilityId);
  if (!ability) return [];
  return resolveSlotsForAbility(
    ability,
    state.player.position,
    targetSlot,
    direction,
    state.lineLength,
  );
}
