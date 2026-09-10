import { createFileRoute } from "@tanstack/react-router";
import { getState, emptyStats } from "@/lib/marvin/store";
import type { CampaignMode } from "@/lib/marvin/types";

async function loadAsset(request: Request, path: string): Promise<ArrayBuffer> {
  const res = await fetch(new URL(path, request.url));
  if (!res.ok) throw new Error(`asset missing: ${path} ${res.status}`);
  return res.arrayBuffer();
}

export const Route = createFileRoute("/api/og")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const raw = url.searchParams.get("day");
          const param = raw === null || raw === "" ? Number.NaN : Number(raw);
          const hasDay = Number.isFinite(param) && param >= 0;
          // Stats and mode always come from state; `day` may be pinned by the
          // caller so X's aggressive OG cache gets a fresh URL every post.
          const state = await getState().catch(() => null);
          const day = hasDay ? Math.floor(param) : (state?.day ?? 1);
          const mode: CampaignMode = state?.mode ?? "counting";

          const [fontBold, fontRegular] = await Promise.all([
            loadAsset(request, "/fonts/Nunito-ExtraBold.ttf"),
            loadAsset(request, "/fonts/Nunito-Regular.ttf"),
          ]);

          const { renderOgPng } = await import("@/lib/marvin/og-image");
          const png = await renderOgPng({
            day,
            mode,
            stats: state?.stats ?? emptyStats(),
            visits: state?.visits ?? 0,
            fontBold,
            fontRegular,
          });

          return new Response(Buffer.from(png), {
            headers: {
              "content-type": "image/png",
              "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
          });
        } catch (err) {
          console.error("[marvin] og", err);
          return Response.json(
            { ok: false, message: err instanceof Error ? err.message : "og exploded" },
            { status: 500 },
          );
        }
      },
    },
  },
});
