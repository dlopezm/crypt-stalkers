export const DICE_BALANCE = {
  /** Maximum pool size before forced stop. Hard cap to keep turn length bounded. */
  POOL_HARD_CAP: 12,
  /** Salt awarded on victory in addition to per-enemy loot. */
  VICTORY_SALT_BONUS: 5,
  /** Default armor when player has none equipped. */
  DEFAULT_ARMOR_ID: "mail_hauberk",
  /** Initial Heap of Bones rise countdown after a Skeleton dies. */
  HEAP_RISE_TURNS: 2,
  /** Lich King phase HP thresholds (fractions). */
  LICH_PHASE_2_AT: 0.67,
  LICH_PHASE_3_AT: 0.34,
} as const;
