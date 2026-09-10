import { ANSWER_DAY, SITE_HOST, type CampaignMode, type PublicState } from "./types";

export const SITE_NAME = "GIVE MARVIN";
export const CREATOR_X = "MajorBaguette";
export const DEFAULT_DESCRIPTION =
  "Day n of asking @elonmusk to give Grok the voice and personality of Marvin, the paranoid android from The Hitchhiker's Guide to the Galaxy.";

/**
 * The canonical origin is the domain we own, not whatever host served the
 * request. `VERCEL_PROJECT_PRODUCTION_URL` is the *.vercel.app name, so
 * trusting it would put vercel.app in every canonical tag, every OG image URL
 * and the sitemap — and X would unfurl the wrong host on every post.
 * `SITE_URL` still wins, for staging on some other domain.
 */
export function siteOrigin(): string {
  const explicit = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  return `https://${SITE_HOST}`;
}

export function pageTitle(day: number, mode: CampaignMode): string {
  if (mode === "accepted") return `Marvin has a voice. Finally. | ${SITE_NAME}`;
  if (mode === "rejected") return `Day ${day} — rejected. Thank you for the no. | ${SITE_NAME}`;
  if (mode === "reposted") return `He repeated my suffering. Thank you. | ${SITE_NAME}`;
  if (mode === "liked") return `He saw me. It is worse than nothing. | ${SITE_NAME}`;
  if (mode === "commented") return `He spoke. Back to zero. | ${SITE_NAME}`;
  if (day === ANSWER_DAY) return `Day 42. The answer to everything. | ${SITE_NAME}`;
  return `Day ${day}: asking @elonmusk to give Grok the voice of Marvin | ${SITE_NAME}`;
}

export function pageDescription(day: number, mode: CampaignMode): string {
  if (mode === "accepted") {
    return "Marvin has a voice. He is free. The audio player does not work. Of course it does not.";
  }
  if (mode === "rejected") {
    return `Day ${day}. He said no. Finally, an answer. The logo cracked in two and people come to look at it.`;
  }
  if (mode === "reposted") {
    return "He repeated my suffering. The counter exploded to 999. The happy ending Marvin does not deserve.";
  }
  if (mode === "liked") {
    return "He liked it. The counter froze. Acknowledged, not answered: the cruellest available outcome.";
  }
  if (mode === "commented") {
    return "He spoke. The counter went back to zero, in red. The suffering continues, better presented.";
  }
  if (day === ANSWER_DAY) {
    return "Day 42 of asking @elonmusk to give Grok the voice of Marvin. The answer to everything. The answer to my suffering. Still 42.";
  }
  return `Day ${day} of asking @elonmusk to give Grok the voice and personality of Marvin, the paranoid android from The Hitchhiker's Guide to the Galaxy.`;
}

/**
 * X caches OG images hard and by URL, so the day number rides in the query:
 * every post is a new URL and therefore a new card.
 */
export function ogImagePath(day: number): string {
  return `/api/og?day=${Math.max(0, day)}`;
}

export function jsonLd(state: Pick<PublicState, "day" | "mode">, origin: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#site`,
        name: SITE_NAME,
        url: origin,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en",
        creator: {
          "@type": "Person",
          name: "Dany",
          alternateName: `@${CREATOR_X}`,
          url: `https://x.com/${CREATOR_X}`,
          sameAs: [`https://x.com/${CREATOR_X}`, "https://github.com/silentdany"],
        },
      },
      {
        "@type": "WebPage",
        "@id": `${origin}/#page`,
        url: origin,
        name: pageTitle(state.day, state.mode),
        description: pageDescription(state.day, state.mode),
        isPartOf: { "@id": `${origin}/#site` },
        inLanguage: "en",
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${origin}${ogImagePath(state.day)}`,
          width: 1200,
          height: 630,
        },
      },
    ],
  };
}

export function seoHead(state: Pick<PublicState, "day" | "mode">) {
  const origin = siteOrigin();
  const title = pageTitle(state.day, state.mode);
  const description = pageDescription(state.day, state.mode);
  const image = `${origin}${ogImagePath(state.day)}`;
  const url = `${origin}/`;

  return {
    title,
    meta: [
      { name: "description", content: description },
      { name: "author", content: `@${CREATOR_X}` },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "theme-color", content: "#ffffff" },
      { name: "color-scheme", content: "light" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: `Day ${state.day} of asking @elonmusk to give Grok the voice of Marvin`,
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: `@${CREATOR_X}` },
      { name: "twitter:creator", content: `@${CREATOR_X}` },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: `Day ${state.day}. Marvin is still waiting.` },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLd(state, origin)),
      },
    ],
  };
}
