#!/usr/bin/env node
/**
 * Refresh the frozen @MajorBaguette archive (Days 1-32) in
 * src/data/archive-majorbaguette.json with current public metrics.
 *
 * Reads by tweet id only (GET /2/tweets), so it works with an app bearer
 * token regardless of which account the cron now posts from.
 *
 *   X_BEARER_TOKEN=... node scripts/snapshot-archive.mjs [--dry-run]
 *
 * Texts, ids, dates and urls are kept; only views/likes/reposts/replies
 * and snapshotAt change. Commit the result.
 */
import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const FILE = fileURLToPath(new URL("../src/data/archive-majorbaguette.json", import.meta.url));

export function applyMetrics(archive, rows, now = new Date()) {
  const byId = new Map(rows.map((r) => [r.id, r.public_metrics]));
  const tweets = archive.tweets.map((t) => {
    const m = byId.get(t.id);
    if (!m) return t;
    return {
      ...t,
      views: m.impression_count ?? t.views,
      likes: m.like_count ?? t.likes,
      reposts: (m.retweet_count ?? 0) + (m.quote_count ?? 0),
      replies: m.reply_count ?? t.replies,
    };
  });
  return { ...archive, snapshotAt: now.toISOString(), tweets };
}

async function main() {
  const bearer = (process.env.X_BEARER_TOKEN ?? process.env.TWITTER_BEARER_TOKEN)?.trim();
  if (!bearer) throw new Error("X_BEARER_TOKEN is required");
  const archive = JSON.parse(await readFile(FILE, "utf8"));
  const ids = archive.tweets.map((t) => t.id);
  const rows = [];
  for (let i = 0; i < ids.length; i += 100) {
    const url = new URL("https://api.x.com/2/tweets");
    url.searchParams.set("ids", ids.slice(i, i + 100).join(","));
    url.searchParams.set("tweet.fields", "public_metrics");
    const res = await fetch(url, { headers: { authorization: `Bearer ${bearer}` } });
    if (!res.ok) throw new Error(`X ${res.status}: ${await res.text()}`);
    rows.push(...((await res.json()).data ?? []));
  }
  const next = applyMetrics(archive, rows);
  const json = `${JSON.stringify(next, null, 2)}\n`;
  if (process.argv.includes("--dry-run")) {
    process.stdout.write(json);
    return;
  }
  await writeFile(`${FILE}.tmp`, json, "utf8");
  await rename(`${FILE}.tmp`, FILE);
  console.log(`updated ${rows.length}/${ids.length} tweets`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
