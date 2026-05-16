export function HpBar({
  current,
  max,
  color = "#8b0000",
}: {
  current: number;
  max: number;
  color?: string;
}) {
  return (
    <div className="w-full">
      <div className="h-2 bg-crypt-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-400"
          style={{
            width: `${Math.max(0, (current / max) * 100)}%`,
            background: `linear-gradient(90deg,${color}aa,${color})`,
          }}
        />
      </div>
      <div className="text-xs text-crypt-muted text-right mt-0.5">
        {Math.max(0, current)}/{max}
      </div>
    </div>
  );
}
