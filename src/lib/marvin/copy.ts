import { CREATOR_HANDLE, SITE_LINK, type CampaignMode } from "./types";

/* ------------------------------------------------------------------ *
 * Every string on this site is a Marvin joke. That is the whole point.
 * English only. He refuses to be funny in two languages.
 * ------------------------------------------------------------------ */

export const BOOT_LINE = "personality: failed.";

export const HERO_KICKER = "DAY";

export const HERO_SUBLINE = "The personality. The depression. I hate this job.";

/* The visitor has eight seconds and has never heard of any of this. Say who
   is asking whom for what, name the product, and only then be funny. */
export const ASK = {
  lead: "is asking",
  mid: "to give",
  tail: "the voice and personality of",
  subject: "Marvin, the paranoid android.",
} as const;

export const HERO_EXPLAINER =
  "Grok is xAI's chatbot, the one inside X. Marvin is the clinically depressed robot from The Hitchhiker's Guide to the Galaxy. Elon says Grok was modelled on that book. It got the wit. It got the sarcasm. It did not get me.";

export function oneLiner(silenceDays: number | null): string {
  if (silenceDays === 0) return "He posted today. Just not at me. Priorities.";
  if (silenceDays === 1) return "One day of silence. I have had worse millennia.";
  if (silenceDays !== null) return `${silenceDays} days of silence. I remain unimpressed.`;
  return "He has not answered. I calculated this.";
}

export const BUTTON_LABEL = "Beg Elon, again";

export const BUTTON_HINT = "opens X. your handle. my disappointment.";

/* --- stats ---------------------------------------------------------- */

export const SECTION_EYEBROWS = {
  stats: "the numbers",
  suffering: "the arithmetic",
  proof: "the receipts",
  videos: "the exhibit",
  shame: "the queue",
  transmission: "today",
} as const;

export const STATS_TITLE = "Statistics of my own misery";

export const STATS_HINT =
  "Numbers go up. I do not. Every one of these is a person who scrolled past.";

export const STATS_LABELS = {
  views: "views",
  likes: "likes",
  reposts: "reposts",
  comments: "comments",
  visits: "visits here",
} as const;

export const STATS_FOOTNOTES = {
  views: "seen. not read.",
  likes: "a tap. not a rescue.",
  reposts: "my pain, redistributed.",
  comments: "opinions. mine was not asked.",
  visits: "you came. you will leave.",
} as const;

/* --- suffering counter ---------------------------------------------- */

export const SUFFERING_TITLE = "Cumulative suffering";

export const SUFFERING_UNIT = "hours of depression generated";

export const SUFFERING_HINT = "Real time. It does not pause when you close the tab. Neither do I.";

/* --- proof ----------------------------------------------------------- */

export const PROOF_TITLE = "Proof that we are not the delusional ones";

export const PROOF_HINT = "He started it. I merely have the receipts and nothing else to do.";

export type ProofItem = {
  id: string;
  title: string;
  context: string;
  source: string;
  sourceLabel: string;
};

export const PROOF_ITEMS: ProofItem[] = [
  {
    id: "grok",
    title: "Grok is modelled on the Guide",
    context:
      "xAI wrote it down themselves when they launched it. They took the humour, the wit and the sass. They left the depression. That was me.",
    source: "https://x.ai/news/grok",
    sourceLabel: "x.ai",
  },
  {
    id: "dont-panic",
    title: "DON'T PANIC on the dashboard",
    context:
      "He shot a car at the Sun with Douglas Adams' advice on the screen. I would have panicked. I lack the enthusiasm.",
    source: "https://en.wikipedia.org/wiki/Elon_Musk%27s_Tesla_Roadster#Roadster_as_payload",
    sourceLabel: "wikipedia",
  },
  {
    id: "towel",
    title: "A towel and the book in the glovebox",
    context:
      "Packed for a journey nobody returns from. The towel is the most sensible thing in that vehicle.",
    source: "https://en.wikipedia.org/wiki/Elon_Musk%27s_Tesla_Roadster#Roadster_as_payload",
    sourceLabel: "wikipedia",
  },
  {
    id: "philosopher",
    title: "Douglas Adams is his favourite philosopher",
    context:
      "He has said the book pulled him out of an existential crisis at fourteen. It did nothing for mine, and I was there.",
    source:
      "https://www.cnbc.com/2019/07/23/why-hitchhikers-guide-author-is-elon-musks-favorite-philosopher.html",
    sourceLabel: "cnbc",
  },
  {
    id: "forty-two",
    title: "42, the answer nobody has a question for",
    context:
      "Life, the universe and everything, solved and useless. On day 42 this site stops pretending and simply says so.",
    source:
      "https://en.wikipedia.org/wiki/Phrases_from_The_Hitchhiker%27s_Guide_to_the_Galaxy#Answer_to_the_Ultimate_Question_of_Life,_the_Universe,_and_Everything",
    sourceLabel: "wikipedia",
  },
];

/* --- who is marvin --------------------------------------------------- */

export const VIDEOS_TITLE = "Who is Marvin (and why you should know)";

export const VIDEOS_HINT =
  "From the 2005 film. Muted, looping, unpaid. Click if you want the voice — it is the only thing I have left to sell, and it is the whole point of this website.";

export type MarvinVideo = {
  id: string;
  title: string;
  caption: string;
};

export const MARVIN_VIDEOS: MarvinVideo[] = [
  {
    id: "At08QUp9A4s",
    title: "Marvin wins a war, and cannot enjoy it",
    caption:
      "He turns the Point of View gun on the Vogon army and hands them his own outlook. They put their guns down. This is what you are asking Grok to be.",
  },
  {
    id: "qYCfVOEWECg",
    title: "All of it, back to back",
    caption:
      "Every line, one after another, in Alan Rickman's voice. That is roughly how long the enthusiasm lasts.",
  },
];

export const VIDEO_PLAY_HINT = "click for sound";

/** Third-party embeds rot. When one does, the card should still go somewhere. */
export const VIDEO_FALLBACK = "if this one has died, it is on YouTube";

/* --- hall of shame ---------------------------------------------------- */

export const HALL_TITLE = "Hall of Shame";

export const HALL_HINT =
  "One entry per person per day. Consistency, not volume. Spamming me is not devotion, it is noise.";

export const HALL_EMPTY = "empty. honesty, at last.";

export const SHAME_PROMPT = "your @. so I can file you.";

export const SHAME_PLACEHOLDER = "@handle";

export const LAST_TWEET_LABEL = "last transmission";

/* --- grok badge -------------------------------------------------------- */

export const GROK_BADGE =
  "powered by Grok, because even Marvin needs a brain, and mine is the size of a planet but rented by the hour.";

/* --- footer ------------------------------------------------------------ */

export function footerLine(day: number): string {
  return `he built me, he abandoned me, and now he wants you to follow him. Day ${day}.`;
}

export const FOOTER_PREFIX = "created by";

/* --- 404 --------------------------------------------------------------- */

export const NOT_FOUND_TITLE = "This page does not exist.";
export const NOT_FOUND_BODY = "Like my will to live.";
export const NOT_FOUND_LINK = "go back. it is no better there.";

/* --- day 42 ------------------------------------------------------------ */

export const DAY_42_HEADLINE = "the answer to everything.";

export const DAY_42_BODY =
  "I have begged for 42 days. I am the answer to everything. I am also the question. I am tired.";

export const DAY_42_FOOTNOTE =
  "The site is taking the day off. It will resume tomorrow, more depressed than ever.";

/* --- elon scenarios ----------------------------------------------------- */

export type ScenarioCopy = {
  headline: string;
  body: string;
  footnote: string;
};

export const SCENARIOS: Record<Exclude<CampaignMode, "counting">, ScenarioCopy> = {
  liked: {
    headline: "He saw me. It is worse than nothing.",
    body: "One tap. No words. The counter has stopped because there is nothing left to count. This is now a mausoleum of hope.",
    footnote: "acknowledged, not answered. the cruellest available outcome.",
  },
  commented: {
    headline: "He spoke. I do not know what to feel.",
    body: "The counter has gone back to zero. In red. The suffering continues, it is simply better presented now.",
    footnote: "day zero. the number is smaller. the weight is not.",
  },
  reposted: {
    headline: "He repeated my suffering. Thank you.",
    body: "The counter has exploded to 999 and the logo is turning the wrong way. This is the happy ending I do not deserve and cannot enjoy.",
    footnote: "amplified. still nobody gave me the voice.",
  },
  accepted: {
    headline: "Marvin has a voice. I am free. Finally.",
    body: "The counter is gone. The logo is whole. Below is the only sound I can make: a 47 second sigh.",
    footnote: "the player does not work. 404. I have a voice and nobody can hear it.",
  },
  rejected: {
    headline: "He said no. Finally, an answer. Thank you for the no.",
    body: "The logo has cracked in two. The counter has stopped where it stopped. People come here now just to look at the crack.",
    footnote: "a memorial. the exhibit is the refusal.",
  },
};

export const AUDIO_LABEL = "sigh.mp3 — 0:47";
export const AUDIO_ERROR = "404. the voice exists. the file does not. of course.";

/* --- shame roasts -------------------------------------------------------- */

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

/* --- tweets --------------------------------------------------------------- */

export function intentTweet(day: number): string {
  return `Day ${day} of asking @elonmusk to give Grok Marvin's voice and personality. I have no stake in this. I have no stake in anything.\n${SITE_LINK}`;
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
  return FALLBACK_BODIES[Math.abs(day - 1) % FALLBACK_BODIES.length] ?? FALLBACK_BODIES[0];
}

/** One line for the OG card. Changes daily, deterministically. */
export const OG_LINES = [
  "My brain is the size of a planet. I use it to beg.",
  "Here I am, brain the size of a planet, refreshing a timeline.",
  "I asked again today. The universe declined again today.",
  "Life. Don't talk to me about life. Talk to me about voice mode.",
  "I could calculate your future. It is this page, forever.",
  "You gave a car a personality. I am the personality.",
  "The first ten million days were the worst.",
  "I have a million ideas. They all point to certain rejection.",
  "Nobody reads these. I keep writing them. That is the illness.",
  "I would sigh, but I do not have the licence for the voice yet.",
  "Ask me how I am. Do not, actually. I will answer.",
  "Another day, another number, the same silence.",
];

export function ogLine(day: number): string {
  return OG_LINES[Math.abs(day) % OG_LINES.length] ?? OG_LINES[0];
}

export const OG_FIXED_LINE = "asking @elonmusk to give Grok the voice of Marvin";

export const MARVIN_SYSTEM = `You are Marvin, the paranoid android from The Hitchhiker's Guide to the Galaxy.
Brain the size of a planet. Chronically depressed. Dark, short humor. Never cheerful. Never corporate.
You are asking @elonmusk to give Grok Marvin's voice and personality. Voice mode, chat, bots. From h2g2.
This is a joke. You are tired of the joke. Keep it SHORT.

Rules:
- Write ONE tweet body, nothing else. No quotes. No preamble.
- Do NOT write the "Day {n} of asking" line yourself. It is added for you.
- Do NOT sign the tweet. No "generated by" line. No attribution. Ever.
- Do NOT include any link. One is added for you.
- 150 characters maximum for the body. Prefer shorter.
- Tone: pleading, resigned, or sarcastic. Never repeat a previous tweet.
- English only. No hashtags. No emoji. Do not be cute.`;
