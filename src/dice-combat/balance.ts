export const DICE_BALANCE = {
  /** How many dice the player rolls per turn (Body, Main, Offhand, Armor, Soul). */
  DICE_POOL_SIZE: 5,
  /** Re-roll budget per turn. */
  REROLLS_PER_TURN: 2,
  /** Salt awarded on victory in addition to per-enemy loot. */
  VICTORY_SALT_BONUS: 5,
  /** Default armor when player has none equipped. */
  DEFAULT_ARMOR_ID: "mail_hauberk",
} as const;
