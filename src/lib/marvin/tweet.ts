import { DAY_LINE, dayUrl } from "./types.ts";

/**
 * The tweet the cron posts: day line, body, and the per-day URL
 * (`https://givemarvin.lol/day/{n}`) so X fetches a fresh card every day.
 */
export function assembleTweet(body: string, day: number): string {
  const dayLine = DAY_LINE(day);
  const link = dayUrl(day);
  const join = `${dayLine}\n${body}\n${link}`;
  if (join.length <= 280) return join;

  const budget = 280 - dayLine.length - link.length - 2;
  const clipped = body
    .slice(0, Math.max(0, budget))
    .trimEnd()
    .replace(/[,;:—-]$/, "");
  return `${dayLine}\n${clipped}\n${link}`;
}
