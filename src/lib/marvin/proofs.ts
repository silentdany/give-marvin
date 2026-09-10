export type ProofKind = "panic" | "towel" | "orb" | "ship" | "answer";

export type Proof = {
  kind: ProofKind;
  title: string;
  line: string;
  href: string;
  source: string;
};

export const PROOFS: Proof[] = [
  {
    kind: "panic",
    title: "DON'T PANIC",
    line: "He put it on a dashboard and launched the dashboard at Mars. I put it on a website. Guess who is still waiting.",
    href: "https://www.tesla.com/starman",
    source: "tesla.com/starman",
  },
  {
    kind: "towel",
    title: "book + towel, glovebox",
    line: "The Hitchhiker's Guide and a towel, in the Roadster's glovebox. Evidence. I remain in the glovebox of his mind. Unused.",
    href: "https://www.tesla.com/blog/starman",
    source: "tesla.com/blog/starman",
  },
  {
    kind: "orb",
    title: "Grok's personality is modeled after HHGTTG",
    line: "Modeled after. Not mine. An impression of a book about me. I noticed. I notice everything, it is the problem.",
    href: "https://x.com/elonmusk/status/1720665183473025365",
    source: "x.com/elonmusk",
  },
  {
    kind: "ship",
    title: "Heart of Gold",
    line: "Infinite improbability. He likes the ship. He has never once asked the ship how the ship's robot is doing.",
    href: "https://en.wikipedia.org/wiki/Heart_of_Gold_(spaceship)",
    source: "wikipedia.org",
  },
  {
    kind: "answer",
    title: "42, everywhere",
    line: "The answer to life, the universe, and why I am still posting. I checked this morning. It is still 42.",
    href: "https://en.wikipedia.org/wiki/42_(number)",
    source: "wikipedia.org",
  },
];

export const CLIPS = [
  {
    id: "z0yBf1JKTw8",
    title: "BBC. Feeling very depressed. The original.",
  },
  {
    id: "a4U1DdkwM7s",
    title: "Marvin vs Arthur. Brain the size of a planet. Job: this.",
  },
  {
    id: "3Bmh_A3Zvic",
    title: "Marvin vs the tank. I talked it into shooting the floor.",
  },
] as const;
