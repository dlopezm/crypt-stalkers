import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { btnStyle, FONT } from "../styles";
import type {
  GridCombatState,
  GridPlayerState,
  GridEnemyState,
  GridPos,
  TimelineEntry,
  GridAbility,
  GridPlayer,
  RoomTerrainLayout,
  TelegraphType,
} from "../grid-combat/types";
import { posEqual } from "../grid-combat/types";
import { generateGrid, posKey } from "../grid-combat/grid";
import {
  initGridCombatState,
  advanceToPlanning,
  advanceToExecution,
  buildExecutionTimeline,
  executeSingleEntry,
  checkVictoryDefeat,
  endOfTurnCleanup,
  insertPlayerAction,
  removePlayerInsertion,
} from "../grid-combat/timeline-engine";
import {
  getPlayerAbilities,
  GRID_WEAPON_MAP,
  GRID_OFFHAND_MAP,
  GRID_ARMOR_MAP,
} from "../grid-combat/equipment";
import { GRID_ENEMY_TYPE_MAP } from "../grid-combat/enemy-defs";
import { useAppDispatch } from "../store";
import { syncGridCombatState } from "../store/combatSlice";
import { GridRenderer } from "./grid-combat/GridRenderer";
import { TimelineSidebar, type MergedTimelineItem } from "./grid-combat/TimelineSidebar";
import { PhaseHeader } from "./grid-combat/PhaseHeader";
import { PlayerStats } from "./grid-combat/PlayerStats";
import { AbilityBar } from "./grid-combat/AbilityBar";
import { CombatLog } from "./grid-combat/CombatLog";

interface GridCombatScreenProps {
  readonly gridPlayer: GridPlayer;
  readonly initialEnemies: readonly {
    readonly id: string;
    readonly uid: string;
    readonly pos: GridPos;
  }[];
  readonly terrainLayout: RoomTerrainLayout;
  readonly restoredState: GridCombatState | null;
  readonly onVictory: (player: GridPlayerState, lootSalt: number) => void;
  readonly onDefeat: () => void;
}

const STEP_DELAY_MS = 600;

export function GridCombatScreen({
  gridPlayer,
  initialEnemies,
  terrainLayout,
  restoredState,
  onVictory,
  onDefeat,
}: GridCombatScreenProps) {
  const dispatch = useAppDispatch();

  const [state, setState] = useState<GridCombatState>(() => {
    if (restoredState) {
      return restoredState;
    }

    const grid = generateGrid(terrainLayout);

    const armorDef = GRID_ARMOR_MAP.get(gridPlayer.armorId);
    const maxAp = 3 + (armorDef?.maxApModifier ?? 0);

    const player: GridPlayerState = {
      hp: gridPlayer.hp,
      maxHp: gridPlayer.maxHp + (armorDef?.maxHpBonus ?? 0),
      salt: gridPlayer.salt,
      pos: terrainLayout.playerStart,
      ap: maxAp,
      maxAp,
      conditions: {},
      armor: armorDef?.armor ?? 0,
      thorns: armorDef?.thorns ?? 0,
      mainWeaponId: gridPlayer.mainWeaponId,
      offhandId: gridPlayer.offhandId,
      armorId: gridPlayer.armorId,
      consumables: gridPlayer.consumables,
      abilityCooldowns: {},
      boneResonanceStacks: 0,
      overwatchTile: null,
      overwatchDamage: 0,
      riposteActive: false,
      guardDamageReduction: 0,
      braceNegateActive: false,
      blockFirstHitReduction: 0,
    };

    if (terrainLayout.enemySpawns.length < initialEnemies.length) {
      console.warn(
        `Spawn count mismatch: layout has ${terrainLayout.enemySpawns.length} spawns but ${initialEnemies.length} enemies. Extra enemies will stack at {0,0}.`,
      );
    }

    const enemies: GridEnemyState[] = initialEnemies.map((e, i) => {
      const def = GRID_ENEMY_TYPE_MAP.get(e.id);
      return {
        id: e.id,
        uid: e.uid,
        hp: def?.maxHp ?? 10,
        maxHp: def?.maxHp ?? 10,
        pos: terrainLayout.enemySpawns[i] ?? e.pos,
        facing: "south" as const,
        conditions: {},
        armor: def?.defaultArmor ?? 0,
        thorns: def?.defaultThorns ?? 0,
        isBoss: def?.isBoss ?? false,
        incorporeal: def?.incorporeal ?? false,
        shieldWallActive: false,
        reformTimer: e.id === "heap_of_bones" ? 2 : null,
        metamorphosisTimer: e.id === "gutborn_larva" ? 3 : null,
        metamorphosisTarget: e.id === "gutborn_larva" ? "ghoul" : null,
        resistances: def?.resistances ?? {},
        vulnerabilities: def?.vulnerabilities ?? {},
      };
    });

    const initial = initGridCombatState(grid, player, enemies, "kill_all", null);
    return advanceToPlanning(initial, GRID_ENEMY_TYPE_MAP);
  });

  useEffect(() => {
    if (state.phase === "planning") {
      dispatch(syncGridCombatState(state));
    }
  }, [state, dispatch]);

  const [selectedAbility, setSelectedAbility] = useState<GridAbility | null>(null);
  const [hoveredTile, setHoveredTile] = useState<GridPos | null>(null);
  const [insertionSlot, setInsertionSlot] = useState<number>(-1);
  const [hoveredEnemyUid, setHoveredEnemyUid] = useState<string | null>(null);
  const [sidestepTarget, setSidestepTarget] = useState<{ uid: string; pos: GridPos } | null>(null);
  const [executingEntryId, setExecutingEntryId] = useState<string | null>(null);
  const executionRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      executionRef.current = false;
    };
  }, []);

  const playerAbilities = useMemo(
    () =>
      getPlayerAbilities(state.player.mainWeaponId, state.player.offhandId, state.player.armorId),
    [state.player.mainWeaponId, state.player.offhandId, state.player.armorId],
  );

  const activeAbilities = useMemo(
    () => [...playerAbilities.values()].filter((a) => a.targetType !== "passive"),
    [playerAbilities],
  );

  const abilitySourceMap = useMemo(() => {
    const map = new Map<string, string>();

    map.set("move", "Movement");

    const weapon = GRID_WEAPON_MAP.get(state.player.mainWeaponId);
    if (weapon) {
      for (const a of weapon.abilities) {
        map.set(a.id, weapon.name);
      }
    }

    if (state.player.offhandId) {
      const offhand = GRID_OFFHAND_MAP.get(state.player.offhandId);
      if (offhand) {
        for (const a of offhand.abilities) {
          map.set(a.id, offhand.name);
        }
      }
    }

    const armor = GRID_ARMOR_MAP.get(state.player.armorId);
    if (armor) {
      map.set(armor.activeAbility.id, armor.name);
    }

    return map;
  }, [state.player.mainWeaponId, state.player.offhandId, state.player.armorId]);

  const tileOverlays = useMemo(() => {
    const overlays = new Map<string, TelegraphType>();

    for (const entry of state.timeline) {
      if (entry.owner.type !== "enemy") {
        continue;
      }
      for (const t of entry.affectedTiles) {
        const key = posKey(t);
        const existing = overlays.get(key);
        if (!existing || entry.telegraphType === "attack") {
          overlays.set(key, entry.telegraphType);
        }
      }
    }

    return overlays;
  }, [state.timeline]);

  const enemyTurnOrder = useMemo(() => {
    const order = new Map<string, number>();
    let orderNum = 1;
    let lastUid: string | null = null;

    for (const entry of state.timeline) {
      if (entry.owner.type !== "enemy") {
        continue;
      }
      if (entry.owner.uid !== lastUid) {
        order.set(entry.owner.uid, orderNum++);
        lastUid = entry.owner.uid;
      }
    }

    return order;
  }, [state.timeline]);

  const enemyAffectedTiles = useMemo(() => {
    const map = new Map<string, Set<string>>();

    for (const entry of state.timeline) {
      if (entry.owner.type !== "enemy") {
        continue;
      }

      const uid = entry.owner.uid;
      let tileSet = map.get(uid);
      if (!tileSet) {
        tileSet = new Set();
        map.set(uid, tileSet);
      }

      for (const t of entry.affectedTiles) {
        tileSet.add(posKey(t));
      }
    }

    return map;
  }, [state.timeline]);

  const mergedTimeline = useMemo(() => {
    const items: MergedTimelineItem[] = [];

    items.push({ _kind: "insertion_slot", index: -1 });

    const insertionsBySlot = new Map<number, readonly TimelineEntry[]>();
    for (const pi of state.playerInsertions) {
      const existing = insertionsBySlot.get(pi.insertionIndex) ?? [];
      insertionsBySlot.set(pi.insertionIndex, [...existing, pi]);
    }

    const beforeAll = insertionsBySlot.get(-1) ?? [];
    for (const pi of beforeAll) {
      items.push(pi);
    }

    for (let i = 0; i < state.timeline.length; i++) {
      items.push(state.timeline[i]);

      const playerActionsHere = insertionsBySlot.get(i) ?? [];
      for (const pi of playerActionsHere) {
        items.push(pi);
      }

      items.push({ _kind: "insertion_slot", index: i });
    }

    return items;
  }, [state.timeline, state.playerInsertions]);

  const isSidestepAbility = useCallback(
    (ab: GridAbility) => ab.special.some((s) => s.type === "sidestep_strike"),
    [],
  );

  const isSlipThroughAbility = useCallback(
    (ab: GridAbility) => ab.special.some((s) => s.type === "slip_through_strike"),
    [],
  );

  const handleTileClick = useCallback(
    (pos: GridPos) => {
      if (state.phase !== "planning") {
        return;
      }

      if (sidestepTarget && selectedAbility && isSidestepAbility(selectedAbility)) {
        const enemyOnTarget = state.enemies.find(
          (e) => e.hp > 0 && posEqual(e.pos, sidestepTarget.pos),
        );
        const newState = insertPlayerAction(
          state,
          selectedAbility,
          pos,
          enemyOnTarget?.uid ?? null,
          [pos, sidestepTarget.pos],
          insertionSlot,
        );
        setState(newState);
        setSelectedAbility(null);
        setSidestepTarget(null);
        return;
      }

      if (!selectedAbility) {
        return;
      }

      const targetEnemy = state.enemies.find((e) => e.hp > 0 && posEqual(e.pos, pos));

      if (isSidestepAbility(selectedAbility)) {
        setSidestepTarget({ uid: targetEnemy?.uid ?? "__tile__", pos });
        return;
      }

      if (isSlipThroughAbility(selectedAbility) && targetEnemy) {
        const newState = insertPlayerAction(
          state,
          selectedAbility,
          targetEnemy.pos,
          targetEnemy.uid,
          [targetEnemy.pos],
          insertionSlot,
        );
        setState(newState);
        setSelectedAbility(null);
        return;
      }

      const affectedTiles = [pos];
      const newState = insertPlayerAction(
        state,
        selectedAbility,
        pos,
        targetEnemy?.uid ?? null,
        affectedTiles,
        insertionSlot,
      );

      setState(newState);
      setSelectedAbility(null);
    },
    [
      state,
      selectedAbility,
      insertionSlot,
      sidestepTarget,
      isSidestepAbility,
      isSlipThroughAbility,
    ],
  );

  const handleExecute = useCallback(() => {
    if (state.phase !== "planning" || executionRef.current) {
      return;
    }

    executionRef.current = true;
    const execState = advanceToExecution(state);
    const timeline = buildExecutionTimeline(execState.timeline, execState.playerInsertions);

    setState(execState);

    let stepIndex = 0;
    let current = execState;

    const runStep = () => {
      timerRef.current = null;

      if (
        stepIndex >= timeline.length ||
        current.phase === "victory" ||
        current.phase === "defeat"
      ) {
        setExecutingEntryId(null);

        const cleaned = endOfTurnCleanup(current, GRID_ENEMY_TYPE_MAP);
        const checked = checkVictoryDefeat(cleaned);

        if (checked.phase === "victory") {
          const totalLoot = checked.enemies.reduce((sum, e) => {
            const def = GRID_ENEMY_TYPE_MAP.get(e.id);
            return sum + (def?.loot ?? 0);
          }, 0);
          setState(checked);
          executionRef.current = false;
          onVictory(checked.player, totalLoot);
          return;
        }

        if (checked.phase === "defeat") {
          setState(checked);
          executionRef.current = false;
          onDefeat();
          return;
        }

        const next = advanceToPlanning(checked, GRID_ENEMY_TYPE_MAP);
        setState(next);
        setInsertionSlot(-1);
        executionRef.current = false;
        return;
      }

      const entry = timeline[stepIndex];
      setExecutingEntryId(entry.id);

      const result = executeSingleEntry(current, entry, GRID_ENEMY_TYPE_MAP, playerAbilities);
      current = {
        ...checkVictoryDefeat(result.state),
        combatLog: [...result.state.combatLog, ...result.log],
      };
      setState(current);

      stepIndex++;
      timerRef.current = setTimeout(runStep, STEP_DELAY_MS);
    };

    timerRef.current = setTimeout(runStep, STEP_DELAY_MS / 2);
  }, [state, playerAbilities, onVictory, onDefeat]);

  const handleAbilityClick = useCallback(
    (ability: GridAbility) => {
      if (state.phase !== "planning") {
        return;
      }

      if (state.player.ap < ability.apCost) {
        return;
      }

      const cd = state.player.abilityCooldowns[ability.id] ?? 0;
      if (cd > 0) {
        return;
      }

      setSelectedAbility((prev) => (prev?.id === ability.id ? null : ability));
      setSidestepTarget(null);
    },
    [state],
  );

  const handleRemoveAction = useCallback(
    (entryId: string) => {
      const entry = state.playerInsertions.find((e) => e.id === entryId);
      if (!entry) {
        return;
      }

      const ability = playerAbilities.get(entry.abilityId);
      if (!ability) {
        return;
      }

      setState(removePlayerInsertion(state, entryId, ability));
    },
    [state, playerAbilities],
  );

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "#0c0a08", fontFamily: FONT, color: "#ece0c8" }}
    >
      <TimelineSidebar
        mergedTimeline={mergedTimeline}
        phase={state.phase}
        insertionSlot={insertionSlot}
        onSlotChange={setInsertionSlot}
        onRemovePlayerAction={handleRemoveAction}
        turn={state.turn}
        enemyTurnOrder={enemyTurnOrder}
        hoveredEnemyUid={hoveredEnemyUid}
        onHoverEnemy={setHoveredEnemyUid}
        executingEntryId={executingEntryId}
      />

      <div className="flex flex-1 flex-col items-center min-w-0">
        <PhaseHeader phase={state.phase} turn={state.turn} />

        {selectedAbility && isSidestepAbility(selectedAbility) && !sidestepTarget && (
          <div className="px-4 py-2 text-sm text-center" style={{ color: "#f0c040" }}>
            <span className="font-bold">Sidestep 1/2:</span> Click the tile to strike
          </div>
        )}

        {sidestepTarget && (
          <div className="px-4 py-2 text-sm text-center" style={{ color: "#5dade2" }}>
            <span className="font-bold">Sidestep 2/2:</span> Click the tile to move to
            <button
              className="ml-3 text-xs px-2 py-0.5 rounded"
              style={{ background: "#2a2018", color: "#a89878", border: "1px solid #3a3020" }}
              onClick={() => setSidestepTarget(null)}
            >
              ↩ Re-pick target
            </button>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center overflow-hidden p-2 min-h-0 w-full">
          <GridRenderer
            grid={state.grid}
            player={state.player}
            enemies={state.enemies}
            tileOverlays={tileOverlays}
            selectedAbility={selectedAbility}
            hoveredTile={hoveredTile}
            playerInsertions={state.playerInsertions}
            onTileClick={handleTileClick}
            onTileHover={setHoveredTile}
            enemyTurnOrder={enemyTurnOrder}
            hoveredEnemyUid={hoveredEnemyUid}
            onHoverEnemy={setHoveredEnemyUid}
            enemyAffectedTiles={enemyAffectedTiles}
          />
        </div>

        <PlayerStats player={state.player} />

        <AbilityBar
          abilities={activeAbilities}
          player={state.player}
          selectedAbility={selectedAbility}
          onAbilityClick={handleAbilityClick}
          abilitySourceMap={abilitySourceMap}
        />

        {state.phase === "planning" && (
          <div className="flex gap-3 pb-4">
            <button
              className="text-base px-6 py-2.5 font-bold tracking-wide"
              style={btnStyle("#8b0000")}
              onClick={handleExecute}
            >
              EXECUTE TURN
            </button>
          </div>
        )}
      </div>

      <CombatLog entries={state.combatLog} />
    </div>
  );
}
