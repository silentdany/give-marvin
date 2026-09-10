import { ogJoke } from "./copy.ts";

/**
 * The share card, served from two paths: `/og` (the short one, on every tweet)
 * and `/api/og` (what the Vercel share-meta middleware stamps into <head>).
 * One renderer, so the two can never drift.
 *
 * X caches share images hard — it keeps the first PNG it sees for a URL for a
 * long time. Both the meta tag and the cron-posted link carry a changing query
 * (`?day=n`), which is what actually forces a re-fetch; `s-maxage` only governs
 * our own edge.
 */
async function loadAsset(request: Request, path: string): Promise<ArrayBuffer> {
  const res = await fetch(new URL(path, request.url));
  if (!res.ok) throw new Error(`asset missing: ${path} ${res.status}`);
  return res.arrayBuffer();
}

export async function ogResponse(request: Request): Promise<Response> {
  try {
    const { getState } = await import("./store.ts");
    const url = new URL(request.url);
    const raw = url.searchParams.get("day");
    const param = raw === null || raw === "" ? Number.NaN : Number(raw);
    const hasDay = Number.isFinite(param) && param >= 0;
    const state = await getState();
    const day = hasDay ? Math.floor(param) : (state.day ?? 1);
    const dayZero = day === 0 || state.mode === "day0";

    const [fontBold, fontRegular] = await Promise.all([
      loadAsset(request, "/fonts/Nunito-ExtraBold.ttf"),
      loadAsset(request, "/fonts/Nunito-Regular.ttf"),
    ]);

    const { renderOgPng } = await import("./og-image.ts");
    const png = await renderOgPng({
      day,
      dayZero,
      fontBold,
      fontRegular,
      stats: state.stats,
      joke: ogJoke(day),
    });

    return new Response(Buffer.from(png), {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[marvin] og", err);
    return Response.json(
      { ok: false, message: err instanceof Error ? err.message : "og exploded" },
      { status: 500 },
    );
  }
}
