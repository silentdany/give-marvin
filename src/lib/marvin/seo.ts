import type { PublicState } from "./types";

export const SITE_NAME = "GIVE MARVIN";
export const CREATOR_X = "MajorBaguette";
export const DEFAULT_DESCRIPTION =
  "Day n of asking Elon to give Grok Marvin's voice and personality from The Hitchhiker's Guide to the Galaxy. The personality. The depression.";

export function siteOrigin(): string {
  const explicit = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return prod.startsWith("http") ? prod : `https://${prod}`;
  return "https://give-marvin.vercel.app";
}

export function pageTitle(day: number, dayZero: boolean): string {
  if (dayZero) return `Day 0 — he spoke. | ${SITE_NAME}`;
  return `Day ${day} of asking Elon to give Marvin's voice to Grok | ${SITE_NAME}`;
}

export function pageDescription(day: number, dayZero: boolean): string {
  if (dayZero) {
    return "Day 0. He spoke. The happy ending nobody believes. Give Grok Marvin's voice and personality anyway.";
  }
  return `Day ${day} of asking @elonmusk to give Marvin's voice to Grok. The personality. The depression. I hate this job.`;
}

export function ogImagePath(day: number): string {
  return `/api/og?day=${Math.max(0, day)}`;
}

export function jsonLd(state: Pick<PublicState, "day" | "mode">, origin: string) {
  const dayZero = state.mode === "day0" || state.day === 0;
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
        name: pageTitle(state.day, dayZero),
        description: pageDescription(state.day, dayZero),
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
  const dayZero = state.mode === "day0" || state.day === 0;
  const title = pageTitle(state.day, dayZero);
  const description = pageDescription(state.day, dayZero);
  const image = `${origin}${ogImagePath(state.day)}`;
  const url = `${origin}/`;

  return {
    title,
    meta: [
      { name: "description", content: description },
      { name: "author", content: `@${CREATOR_X}` },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "theme-color", content: "#e8e8e6" },
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
      { property: "og:image:alt", content: `Day ${state.day} of asking Elon to give Marvin's voice to Grok` },
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
