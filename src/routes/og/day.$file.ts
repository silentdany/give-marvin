import { createFileRoute } from "@tanstack/react-router";
import { getState, emptyStats } from "@/lib/marvin/store";
import { parseDayParam } from "@/lib/marvin/types";
import { latestDay } from "@/lib/marvin/cron";

async function loadAsset(request: Request, path: string): Promise<ArrayBuffer> {
  const res = await fetch(new URL(path, request.url));
  if (!res.ok) throw new Error(`asset missing: ${path} ${res.status}`);
  return res.arrayBuffer();
}

/** `/og/day/{n}.png`: the card for one day, pinned to that day forever. */
export const Route = createFileRoute("/og/day/$file")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const match = /^(\d+)\.png$/.exec(params.file);
        const day = parseDayParam(match?.[1]);
        if (day === null) return new Response("Not found", { status: 404 });
        try {
          const state = await getState().catch(() => null);
          if (state && day > latestDay(state)) return new Response("Not found", { status: 404 });

          const [fontBold, fontRegular] = await Promise.all([
            loadAsset(request, "/fonts/Nunito-ExtraBold.ttf"),
            loadAsset(request, "/fonts/Nunito-Regular.ttf"),
          ]);

          const { renderOgPng } = await import("@/lib/marvin/og-image");
          const png = await renderOgPng({
            day,
            mode: "counting",
            stats: state?.stats ?? emptyStats(),
            visits: state?.visits ?? 0,
            fontBold,
            fontRegular,
          });

          return new Response(Buffer.from(png), {
            headers: {
              "content-type": "image/png",
              "cache-control":
                "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
            },
          });
        } catch (err) {
          console.error("[marvin] og day", err);
          return Response.json({ ok: false, message: "og exploded" }, { status: 500 });
        }
      },
    },
  },
});
