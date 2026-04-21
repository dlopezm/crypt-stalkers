/** Maps enemy IDs to their tarot card image filenames in /tarot/ */
export const TAROT_MAP: Record<string, string> = {
  rat: "Pents11.jpg",
  skeleton: "13_Death.jpg",
  zombie: "12_Hanged_Man.jpg",
  ghost: "18_Moon.jpg",
  vampire: "15_Devil.jpg",
  banshee: "Swords13.jpg",
  necromancer: "01_Magician.jpg",
  ghoul: "Swords12.jpg",
  shadow: "02_High_Priestess.jpg",
  heap_of_bones: "Pents01.jpg",
  grave_robber: "Swords07.jpg",
  gutborn_larva: "Swords03.jpg",
  boss_skeleton_lord: "Swords14.jpg",
  boss_vampire_lord: "04_Emperor.jpg",
  boss_lich: "20_Judgement.jpg",
};

const BASE = import.meta.env.BASE_URL;

export const TAROT_BACK = `${BASE}tarot/Cover.jpg`;

export function getTarotSrc(enemyId: string): string | null {
  const file = TAROT_MAP[enemyId];
  return file ? `${BASE}tarot/${file}` : null;
}

/** Preload all tarot images so they display instantly in combat */
export function preloadTarotImages(): void {
  for (const file of Object.values(TAROT_MAP)) {
    const img = new Image();
    img.src = `${BASE}tarot/${file}`;
  }
  const back = new Image();
  back.src = TAROT_BACK;
}
