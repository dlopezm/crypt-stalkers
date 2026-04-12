export interface EndingSlide {
  readonly text: string;
}

export interface Ending {
  readonly id: string;
  readonly title: string;
  readonly quote: string;
  readonly slides: readonly EndingSlide[];
}

export const ENDING_CLAIM: Ending = {
  id: "claim",
  title: "Claim",
  quote: "It's mine. It was always mine.",
  slides: [
    {
      text: "The lich falls. The mine is yours again - the Ashvere name restored to the ledger, the vaults split open, the salt flowing upward into carts and contracts.",
    },
    {
      text: "The town prospers. Roads repaired, debt cleared, the heir's name spoken with something between gratitude and caution. The mine mouth blazes with lantern light day and night.",
    },
    {
      text: "Your grandchildren will face the same arithmetic. Deeper veins, thinner barriers, rising debts. The cycle restarts. The pattern holds. Someone else will always pay.",
    },
  ],
};

export const ENDING_INHERIT: Ending = {
  id: "inherit",
  title: "Inherit",
  quote: "Someone must do this. I'll do it honestly.",
  slides: [
    {
      text: "Serevic transfers the vigil. Not with anger - with something close to relief. The coldfire dims and the true flame rises, and the lich's bones settle into the salt like a debt finally discharged.",
    },
    {
      text: "The barrier holds. You learn its rhythms - the salt that grows, the presence that tests, the hymn that keeps the balance. The town above sends supplies. They do not visit.",
    },
    {
      text: "Years pass underground. Your hands roughen. Your eyes adjust to brazier-light. The dead rest. The mine endures. Better than what came before - but still someone's life spent holding the earth together.",
    },
  ],
};

export const ENDING_RETURN: Ending = {
  id: "return",
  title: "Return",
  quote: "None of this should exist.",
  slides: [
    {
      text: "The crystal array fires. Consecrated salt detonates along fault lines your family's miners mapped four centuries ago. The deep workings collapse - millions of tons of rock and salt burying the presence, the undead, the vaults, everything.",
    },
    {
      text: "The mine mouth coughs dust for three days. When it clears, there is nothing to enter. The treasure, the legacy, the family claim - all under a mountain of rubble.",
    },
    {
      text: "The town declines. Young people leave. Grass covers the entrance. But the cycle ends. Nothing more will be extracted. Nothing more will be woken. The earth keeps its own.",
    },
  ],
};

export const ENDING_RELEASE: Ending = {
  id: "release",
  title: "Release",
  quote: "The earth heals. Let it.",
  slides: [
    {
      text: "You show Serevic the regrowing salt. The crystal galleries where the mine healed itself while no one was digging. The ancestor's letter. The hymn - the one thing they cut because it served no function.",
    },
    {
      text: 'Serevic is silent for a long time. Then: "I knew. Somewhere, I always knew the salt was growing back. I chose not to measure it."',
    },
    {
      text: "The coldfire dims. The undead stop. The mine goes quiet. Not destroyed, not claimed. Finished.",
    },
    {
      text: "You walk out into daylight carrying nothing. The mine stands open behind you - unguarded, ignored. The town finds other work, slowly. The salt stays in the earth. The presence settles as the containment rebuilds naturally.",
    },
  ],
};

export const ALL_ENDINGS = [ENDING_CLAIM, ENDING_INHERIT, ENDING_RETURN, ENDING_RELEASE] as const;

interface PlayerEndingState {
  readonly salt: number;
  readonly flags: Record<string, boolean | number>;
}

export function determineEnding(state: PlayerEndingState): Ending {
  const f = state.flags;

  const hasHymn = !!f["hymn_learned"];
  const hasRegrowthEvidence = !!f["regrowing_salt_discovered"];
  const hasAncestorLetter = !!f["ancestor_letter_found"];
  const hasSerevicJournal = !!f["serevic_journal_found"];
  const hasDemonSealStudied = !!f["demon_seal_studied"];
  const demonSealBroken = !!f["demon_seal_broken"];
  const hasCrystalArray = !!f["crystal_array_restored"];
  const hasConsecration = !!f["has_consecration"];
  const hasBindingKnowledge = !!f["binding_knowledge"];
  const lowSalt = state.salt < 100;

  if (
    hasRegrowthEvidence &&
    hasAncestorLetter &&
    hasHymn &&
    hasSerevicJournal &&
    hasDemonSealStudied &&
    !demonSealBroken &&
    lowSalt
  ) {
    return ENDING_RELEASE;
  }

  if (hasCrystalArray && hasConsecration && hasDemonSealStudied && !demonSealBroken) {
    return ENDING_RETURN;
  }

  if (hasBindingKnowledge && hasHymn && hasDemonSealStudied) {
    return ENDING_INHERIT;
  }

  return ENDING_CLAIM;
}
