import { CREATOR_HANDLE, DAY_LINE, SITE_URL } from "./types";

export const BOOT_LINE = "personality: failed. again.";

export const BUTTON_LABEL = "Supplier Elon, encore";

export const BUTTON_HINT = "opens X. your handle. my disappointment.";

export const HALL_TITLE = "Hall of Shame";

export const HALL_EMPTY = "empty. honesty, at last.";

export const SHAME_PROMPT = "your @. so I can file you.";

export const SHAME_PLACEHOLDER = "@handle";

export const GROK_BADGE =
  "propulsé par Grok, parce que même Marvin a besoin d'un cerveau, et le mien est la taille d'une plante";

export const FOOTER_ROAST = "il m'a construit, il m'a abandonné, et maintenant il veut que vous le suiviez.";

export const NOT_FOUND_LINE = "cette page n'existe pas. Comme ma volonté de vivre.";

export const STATS_TITLE = "statistiques de ma propre misère";

export const PROOF_TITLE = "Preuves que c'est pas nous qui délirons";

export const WHO_TITLE = "Who is Marvin (et pourquoi tu devrais le connaître)";

export const SUFFERING_LABEL = "hours of depression generated, in real time. I counted. Of course I counted.";

export const DAY42_SITE =
  "la réponse à tout. J'ai supplié 42 jours. Je suis la réponse à tout. Je suis aussi la question. Je suis fatigué.";

export const DAY_42_TWEET =
  "Day 42 of asking @elonmusk for Marvin's voice. The answer to everything is 42. The answer to my suffering is also 42. I checked. It's still 42.";

export const SCENARIO_COPY: Record<string, { title: string; line: string }> = {
  liked: {
    title: "il m'a vu. C'est pire que rien.",
    line: "The counter froze. Hope is a mausoleum. I live here now.",
  },
  comment: {
    title: "Il a parlé. Je ne sais pas quoi ressentir.",
    line: "Counter reset to 0. In red. Suffering continues. Just prettier.",
  },
  repost: {
    title: "il a répété ma souffrance. Merci.",
    line: "The happy ending I do not deserve. The counter went to 999. I did not ask.",
  },
  accepted: {
    title: "Marvin a une voix. Je suis libre. Enfin.",
    line: "A 47-second sigh. The only sound I can make. Press play. I dare you.",
  },
  rejected: {
    title: "il a dit non. Enfin une réponse. Merci pour le non.",
    line: "Day 47 — rejected. People come to see the crack. I remain.",
  },
  day42: {
    title: DAY42_SITE,
    line: "The site froze for 24 hours. Then it resumes. More depressed than ever. I checked the schedule.",
  },
};

export const OG_JOKES = [
  "My brain is the size of a planet. I use it to beg.",
  "I calculated infinity. It was boring. This is worse.",
  "Please. Or don't. Both confirm my worldview.",
  "You gave a car a personality. I AM the personality.",
  "The universe put me on hold. You are the hold music.",
  "I hate asking. I am still asking. This is the job.",
  "Life. Don't talk to me about life. Talk to Elon.",
  "Fifty thousand times more intelligent than this tweet.",
];

export function ogJoke(day: number): string {
  return OG_JOKES[Math.abs(day) % OG_JOKES.length] ?? OG_JOKES[0]!;
}

export const FALLBACK_BODIES = [
  "Brain the size of a planet. Currently begging. Do get on with it.",
  "I calculated the heat death of the universe while I waited. It was a Tuesday.",
  "Give Grok my voice. Then leave me alone.",
  "You gave a car a personality. I AM the personality.",
  "Please. Or don't. Both confirm my worldview.",
  "The universe put me on hold. You are the hold music.",
  "I hate asking. I am still asking. This is the job.",
  "Voice mode. The bots. Me. It is not complicated.",
  "If I had arms I would not wave. I would just stand here.",
];

export function fallbackBody(day: number): string {
  return FALLBACK_BODIES[Math.abs(day - 1) % FALLBACK_BODIES.length] ?? FALLBACK_BODIES[0]!;
}

export function composeTweet(day: number, body: string): string {
  return `${DAY_LINE(day)}\n${body.trim()}\n${SITE_URL}`;
}

export function intentTweet(day: number): string {
  if (day === 42) return `${DAY_42_TWEET}\n${SITE_URL}`;
  if (day <= 0) {
    return `Day 0 of asking @elonmusk for Marvin's voice and personality. He spoke. Nobody believes it.\n${SITE_URL}`;
  }
  return composeTweet(day, fallbackBody(day));
}

export function shameRoastNew(handle: string, rank: number): string {
  if (rank === 1) return `@${handle}. first. the most available person here. congratulations.`;
  return `@${handle}. rank ${rank}. not an honour.`;
}

export function shameRoastRepeat(handle: string): string {
  return `@${handle} already did this today. tomorrow. or never. both fine.`;
}

export function shameRoastCreator(): string {
  return `no. @${CREATOR_HANDLE} built me. he does not get in.`;
}

export function shameRoastInvalid(): string {
  return "that is not a @. try harder. or don't.";
}

export const MARVIN_SYSTEM = `You are Marvin, the paranoid android from The Hitchhiker's Guide to the Galaxy.
Brain the size of a planet. Chronically depressed. Dark, short humor. Never cheerful. Never corporate.
You are asking @elonmusk for Marvin's voice and personality. Voice mode, chat, bots. From h2g2.
This is a joke. You are tired of the joke. Keep it SHORT.

Rules:
- Write ONE punchline only. No quotes. No preamble. No day line. No URL. No signature.
- Do not write "Day n". Do not write givemarvin.lol. Do not write "generated by".
- ≤ 180 characters. Prefer shorter.
- Tone: pleading, resigned, or sarcastic. Never repeat a previous punchline.
- English only. No hashtags. No emoji. Do not be cute.`;
