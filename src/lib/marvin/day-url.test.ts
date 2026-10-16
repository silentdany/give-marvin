import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dayHead } from "./seo.ts";
import { assembleTweet } from "./tweet.ts";
import { DAY_42_TWEET, parseDayParam } from "./types.ts";

const origin = "https://givemarvin.lol";
const meta = (head: ReturnType<typeof dayHead>, key: string) =>
  head.meta.find((m) => ("property" in m ? m.property : m.name) === key)?.content;

describe("/day/{n} metadata", () => {
  it("points Day 38 at its own card and canonical", () => {
    const head = dayHead(38, origin);
    assert.equal(meta(head, "og:image"), "https://givemarvin.lol/og/day/38.png");
    assert.equal(meta(head, "twitter:image"), "https://givemarvin.lol/og/day/38.png");
    assert.equal(meta(head, "og:url"), "https://givemarvin.lol/day/38");
    assert.equal(meta(head, "twitter:card"), "summary_large_image");
    assert.deepEqual(head.links, [{ rel: "canonical", href: "https://givemarvin.lol/day/38" }]);
    assert.match(head.title, /Day 38/);
  });
});

describe("cron tweet link", () => {
  it("links each post to /day/{n}", () => {
    const text = assembleTweet("Still nothing.", 38);
    assert.ok(text.endsWith("\nhttps://givemarvin.lol/day/38"));
    assert.ok(DAY_42_TWEET.endsWith("\nhttps://givemarvin.lol/day/42"));
  });

  it("keeps the link intact when the body is too long", () => {
    const text = assembleTweet("a".repeat(400), 137);
    assert.ok(text.length <= 280);
    assert.ok(text.endsWith("\nhttps://givemarvin.lol/day/137"));
  });
});

describe("parseDayParam", () => {
  it("accepts positive integers only", () => {
    assert.equal(parseDayParam("38"), 38);
    for (const bad of ["0", "-1", "1.5", "01", "abc", "", "38.png", "1e3", undefined]) {
      assert.equal(parseDayParam(bad), null, String(bad));
    }
  });
});
