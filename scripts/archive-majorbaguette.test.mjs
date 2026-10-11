import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyMetrics } from "./snapshot-archive.mjs";

const archive = JSON.parse(
  readFileSync(new URL("../src/data/archive-majorbaguette.json", import.meta.url), "utf8"),
);

test("archive holds days 1-32 from @MajorBaguette, in order, with metrics", () => {
  assert.equal(archive.account, "MajorBaguette");
  assert.deepEqual(
    archive.tweets.map((t) => t.day),
    Array.from({ length: 32 }, (_, i) => i + 1),
  );
  for (const t of archive.tweets) {
    assert.match(t.id, /^\d+$/);
    assert.equal(t.url, `https://x.com/MajorBaguette/status/${t.id}`);
    assert.ok(t.text.startsWith(`Day ${t.day} of asking @elonmusk`));
    assert.equal(typeof t.views, "number");
  }
  assert.equal(new Set(archive.tweets.map((t) => t.id)).size, 32);
});

test("applyMetrics only touches metrics", () => {
  const t = archive.tweets[0];
  const next = applyMetrics(
    archive,
    [
      {
        id: t.id,
        public_metrics: {
          impression_count: 999,
          like_count: 2,
          retweet_count: 1,
          quote_count: 1,
          reply_count: 3,
        },
      },
    ],
    new Date("2030-01-01T00:00:00Z"),
  );
  assert.deepEqual(next.tweets[0], { ...t, views: 999, likes: 2, reposts: 2, replies: 3 });
  assert.deepEqual(next.tweets[1], archive.tweets[1]);
  assert.equal(next.snapshotAt, "2030-01-01T00:00:00.000Z");
});
