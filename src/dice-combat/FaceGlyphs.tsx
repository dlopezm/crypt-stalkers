import {
  IconArea,
  IconArmorBreak,
  IconBind,
  IconBleedBurst,
  IconBolt,
  IconBurrowSpawn,
  IconCleanse,
  IconCrystal,
  IconDodge,
  IconDrag,
  IconDrop,
  IconFlame,
  IconFocus,
  IconHeart,
  IconHide,
  IconHoly,
  IconHymnHum,
  IconIntangible,
  IconInvert,
  IconMark,
  IconPierce,
  IconPoison,
  IconPower,
  IconPush,
  IconRanged,
  IconReform,
  IconReproduce,
  IconResonance,
  IconRiposte,
  IconShield,
  IconSkull,
  IconSneakAttack,
  IconSpark,
  IconSteal,
  IconSummon,
  IconSun,
  IconSword,
  IconTaunt,
  IconUnblockable,
  IconUndodgeable,
} from "../icons";
import type { IconProps } from "../icons";
import { COLORS } from "./dice-defs";
import type { FaceColor, FaceDef, SymbolKey } from "./types";

export const FACE_COLOR_CSS: Record<FaceColor, string> = Object.fromEntries(
  Object.values(COLORS).map((c) => [c.id, c.hex]),
) as Record<FaceColor, string>;

const SYMBOL_ICON: Record<SymbolKey, React.FC<IconProps>> = {
  sword: IconSword,
  shield: IconShield,
  heart: IconHeart,
  flame: IconFlame,
  drop: IconDrop,
  spark: IconSpark,
  crystal: IconCrystal,
  bolt: IconBolt,
  sun: IconSun,
  riposte: IconRiposte,
  cleanse: IconCleanse,
  mark: IconMark,
  power: IconPower,
  dodge: IconDodge,
  reproduce: IconReproduce,
  steal: IconSteal,
  push: IconPush,
  reform: IconReform,
  intangible: IconIntangible,
  hide: IconHide,
  summon: IconSummon,
  invert: IconInvert,
  bind: IconBind,
  burrow_spawn: IconBurrowSpawn,
  ranged: IconRanged,
  area: IconArea,
  holy: IconHoly,
  pierce: IconPierce,
  unblockable: IconUnblockable,
  undodgeable: IconUndodgeable,
  resonance: IconResonance,
  hymn_hum: IconHymnHum,
  armor_break: IconArmorBreak,
  bleed_burst: IconBleedBurst,
  drag: IconDrag,
  sneak_attack: IconSneakAttack,
  taunt: IconTaunt,
  self_damage: IconSkull,
  poison: IconPoison,
  focus: IconFocus,
};

export const SYMBOL_LABEL: Record<SymbolKey, string> = {
  sword: "1 damage",
  shield: "1 block",
  heart: "1 heal",
  flame: "1 fire",
  drop: "+1 Bleed",
  spark: "+1 Stun",
  crystal: "+1 Salt",
  bolt: "+1 Weaken",
  sun: "+1 Bolster",
  riposte: "Riposte",
  cleanse: "Cleanse",
  mark: "Mark",
  power: "+1 Power",
  dodge: "Dodge",
  reproduce: "Reproduce",
  steal: "Steal salt",
  push: "Push row",
  reform: "Reform",
  intangible: "Phase",
  hide: "Hide",
  summon: "Raise Dead",
  invert: "Invert",
  bind: "Bind die",
  burrow_spawn: "Surface + Zombie",
  ranged: "Ranged",
  area: "Area",
  holy: "Holy",
  pierce: "Pierce",
  unblockable: "Unblockable",
  undodgeable: "Undodgeable",
  resonance: "+1 Resonance",
  hymn_hum: "Hymn-Hum",
  armor_break: "Armor Break",
  bleed_burst: "Bleed Burst",
  drag: "Drag",
  sneak_attack: "Sneak Attack",
  taunt: "Taunt",
  self_damage: "Self-damage",
  poison: "+1 Poison",
  focus: "+1 Focus",
};

export function FaceGlyphs({
  face,
  size = "0.95rem",
  color,
}: {
  face: FaceDef;
  size?: string;
  color?: string;
}) {
  const symbols = face.symbols ?? [];
  const iconStyle: React.CSSProperties = {
    width: size,
    height: size,
    color: color ?? "var(--bone)",
    flexShrink: 0,
  };
  return (
    <span
      style={{
        display: "inline-flex",
        gap: "0.15rem",
        alignItems: "center",
        lineHeight: 1,
        flexWrap: "wrap",
      }}
      title={symbols.map((s) => SYMBOL_LABEL[s]).join(", ")}
    >
      {symbols.map((s, i) => {
        const Icon = SYMBOL_ICON[s];
        const style =
          s === "self_damage"
            ? {
                ...iconStyle,
                color: "var(--poison)",
                filter: "drop-shadow(0px 0px 1px #000) drop-shadow(0px 0px 1px #000)",
              }
            : iconStyle;
        return <Icon key={i} style={style} />;
      })}
    </span>
  );
}
