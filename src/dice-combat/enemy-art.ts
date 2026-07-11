/* Maps enemy id → portrait art in public/stalkers */
const ENEMY_ART: Record<string, string> = {
  rat: "01_Ravage_Rat.png",
  banshee: "02_Wailing_Banshee.png",
  vampire: "03_vampire.png",
  boss_vampire_lord: "03_vampire.png",
  ghost: "04_Ghost.png",
  ghoul: "05_Ghoul.png",
  shadow: "06_Shadow.png",
  necromancer: "07_Necromancer.png",
  grave_robber: "08_Grave_Robber.png",
  zombie: "10_Zombie.png",
  salt_revenant: "11_Withc.png",
  heap_of_bones: "12_Skullflower.png",
  test_poisoner: "13_Cultist.png",
  skeleton: "14_Skeleton.png",
  boss_skeleton_lord: "14_Skeleton.png",
  gutborn_larva: "16_Gutborn.png",
  gutborn: "16_Gutborn.png",
  false_sacrarium: "17_False_Sacrarium.png",
  forsworn: "18_Forsworn.png",
  boss_lich: "20_Lich.png",
};

export function artFor(enemyId: string): string | undefined {
  const file = ENEMY_ART[enemyId];
  return file ? `${import.meta.env.BASE_URL}stalkers/${file}` : undefined;
}
