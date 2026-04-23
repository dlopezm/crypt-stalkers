import type { CardCombatEnemy, EnemyIntent } from "../../card-combat/types";
import { getEnemyCard } from "../../card-combat/enemy-cards";

interface Props {
  readonly enemies: readonly CardCombatEnemy[];
  readonly selectedEnemyUid: string | null;
  readonly onSelectEnemy: (uid: string | null) => void;
  readonly reachFilter: { readonly min: number; readonly max: number } | null;
}

export function DistanceView({ enemies, selectedEnemyUid, onSelectEnemy, reachFilter }: Props) {
  const sorted = [...enemies].sort((a, b) => a.distance - b.distance);

  return (
    <div
      className="flex items-end gap-3 px-5 py-6 w-full overflow-x-auto border-b border-crypt-border"
      style={{ background: "#16120e", minHeight: 190 }}
    >
      <PlayerMarker />
      {sorted.map((enemy) => {
        const inReach =
          reachFilter === null
            ? true
            : enemy.distance >= reachFilter.min && enemy.distance <= reachFilter.max;
        return (
          <EnemyCard
            key={enemy.uid}
            enemy={enemy}
            selected={selectedEnemyUid === enemy.uid}
            dimmed={reachFilter !== null && !inReach}
            onClick={() => onSelectEnemy(selectedEnemyUid === enemy.uid ? null : enemy.uid)}
          />
        );
      })}
      {sorted.length === 0 && (
        <div className="text-sm italic" style={{ color: "#786848" }}>
          No enemies.
        </div>
      )}
    </div>
  );
}

function PlayerMarker() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded border px-3 py-2 flex-shrink-0"
      style={{
        background: "#1a1610",
        border: "2px solid #3ddc84",
        minWidth: 90,
        minHeight: 130,
      }}
    >
      <span className="text-3xl mb-1">🧍</span>
      <span className="text-xs uppercase tracking-widest" style={{ color: "#3ddc84" }}>
        You
      </span>
    </div>
  );
}

function EnemyCard({
  enemy,
  selected,
  dimmed,
  onClick,
}: {
  readonly enemy: CardCombatEnemy;
  readonly selected: boolean;
  readonly dimmed: boolean;
  readonly onClick: () => void;
}) {
  const hpPct = (enemy.hp / enemy.maxHp) * 100;
  const nextIntent = enemy.intents[enemy.telegraphIndex];

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-stretch rounded border px-2 py-2 flex-shrink-0 transition-all"
      style={{
        background: selected ? "#2a1816" : "#1a1610",
        border: selected ? "2px solid #c41c1c" : "1px solid #3a3020",
        opacity: dimmed ? 0.45 : 1,
        cursor: "pointer",
        minWidth: 110,
      }}
    >
      <div className="text-3xl text-center mb-1">{enemy.icon}</div>
      <div className="text-xs text-center mb-1" style={{ color: "#ece0c8" }}>
        {enemy.name}
      </div>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs" style={{ color: "#c41c1c" }}>
          ❤
        </span>
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ background: "#2a2018" }}
        >
          <div style={{ width: `${hpPct}%`, background: "#c41c1c", height: "100%" }} />
        </div>
        <span className="text-xs" style={{ color: "#a89878" }}>
          {enemy.hp}
        </span>
      </div>
      <DistancePips distance={enemy.distance} />
      {nextIntent && <IntentChip intent={nextIntent} />}
      <ConditionChips cond={enemy.conditions} />
      {enemy.armor > 0 && (
        <div className="text-xs mt-0.5" style={{ color: "#a89878" }}>
          🛡 {enemy.armor}
        </div>
      )}
    </button>
  );
}

function DistancePips({ distance }: { readonly distance: number }) {
  const pips = Math.min(distance, 8);
  return (
    <div className="flex items-center gap-0.5 justify-center mb-1">
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          className="inline-block rounded-full"
          style={{
            width: 5,
            height: 5,
            background: i < pips ? "#c8b878" : "#2a2018",
          }}
        />
      ))}
      <span className="text-xs ml-1" style={{ color: "#786848" }}>
        {distance}
      </span>
    </div>
  );
}

function IntentChip({ intent }: { readonly intent: EnemyIntent }) {
  const ecard = getEnemyCard(intent.abilityId);
  const color =
    intent.kind === "attack"
      ? "#c41c1c"
      : intent.kind === "summon"
        ? "#a855f7"
        : intent.kind === "buff"
          ? "#f59e0b"
          : "#786848";
  return (
    <div
      className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1 mt-0.5"
      style={{ background: "#0f0b08", border: `1px solid ${color}`, color: "#ece0c8" }}
      title={ecard?.description ?? ""}
    >
      <span>{intent.icon}</span>
      <span className="truncate">{intent.label}</span>
      {ecard && ecard.damage > 0 && <span style={{ color }}>{ecard.damage}</span>}
    </div>
  );
}

function ConditionChips({ cond }: { readonly cond: CardCombatEnemy["conditions"] }) {
  const keys = Object.keys(cond) as (keyof typeof cond)[];
  if (keys.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-0.5 mt-0.5">
      {keys.map((k) => (
        <span
          key={k}
          className="text-[9px] px-1 rounded"
          style={{ background: "#2a1a16", color: "#c8a878" }}
        >
          {k}:{cond[k]}
        </span>
      ))}
    </div>
  );
}
