import { btnStyle } from "../../styles";
import { canPerformAction } from "../../utils/props";
import type { RoomProp, PropState, Player } from "../../types";

export function PropDialog({
  prop,
  propState,
  player,
  onAction,
  onClose,
}: {
  prop: RoomProp;
  propState: PropState | undefined;
  player: Player;
  onAction: (actionId: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel relative max-w-lg w-full"
        style={{
          background: "#14110c",
          border: "1px solid #3a2f20",
          borderRadius: "6px",
          padding: "1.25rem 1.5rem",
          boxShadow: "0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(139,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-3 bg-transparent border-none cursor-pointer text-xl"
          style={{ color: "#8a7a5a" }}
        >
          {"\u2715"}
        </button>

        <div className="flex items-center gap-3 mb-3 pr-6">
          <span style={{ fontSize: "1.7rem" }}>{prop.icon}</span>
          <h3
            className="text-lg font-bold tracking-wide"
            style={{ color: "#ece0c0", letterSpacing: "0.05em" }}
          >
            {prop.label}
          </h3>
        </div>

        <p
          className="text-sm leading-relaxed mb-4 whitespace-pre-line"
          style={{ color: "#c4b699" }}
        >
          {prop.desc}
        </p>

        {prop.actions && prop.actions.length > 0 && (
          <div className="flex flex-col gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #2a2015" }}>
            {prop.actions.map((action) => {
              const check = canPerformAction(action, player.flags, player.gold, propState);
              const used = propState?.actionsUsed.includes(action.id) ?? false;
              const disabled = !check.ok || used;
              return (
                <div key={action.id} className="flex flex-col gap-0.5">
                  <button
                    onClick={() => !disabled && onAction(action.id)}
                    disabled={disabled}
                    style={btnStyle(used ? "#3a3020" : "#6a3a1a", disabled)}
                    className="text-left!"
                  >
                    {used && <span className="mr-1">{"\u2713"}</span>}
                    {action.label}
                  </button>
                  {action.desc && !used && (
                    <div className="text-xs italic pl-2" style={{ color: "#8a7a5a" }}>
                      {action.desc}
                    </div>
                  )}
                  {!check.ok && check.reason && !used && (
                    <div className="text-xs italic pl-2" style={{ color: "#6a5a40" }}>
                      {check.reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} style={btnStyle("#3a2f25")} className="text-xs!">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
