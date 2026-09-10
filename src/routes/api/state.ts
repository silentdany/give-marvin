import { createFileRoute } from "@tanstack/react-router";
import { getState, saveState, toPublicState } from "@/lib/marvin/store";
import { fetchCumulativeStats } from "@/lib/marvin/x";
import { cronAuthorized, nextDay } from "@/lib/marvin/cron";
import { ELON_MODES, type CampaignMode } from "@/lib/marvin/types";

/**
 * POST is the manual switch for the five Elon scenarios. `accepted` and
 * `rejected` are judgement calls about what he meant, so a human makes them:
 *
 *   curl -X POST /api/state -H "authorization: Bearer $CRON_SECRET" \
 *        -d '{"mode":"rejected","comment":"no"}'
 */
export const Route = createFileRoute("/api/state")({
  server: {
    handlers: {
      GET: async () => {
        const state = toPublicState(await getState());
        return Response.json(state);
      },
      POST: async ({ request }) => {
        if (!cronAuthorized(request)) {
          return Response.json(
            { ok: false, message: "Unauthorized. Even my misery is behind a door." },
            { status: 401 },
          );
        }

        let body: {
          mode?: unknown;
          comment?: unknown;
          commentUrl?: unknown;
          day?: unknown;
          refreshStats?: unknown;
          previewTweet?: unknown;
        } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          /* an empty body. the most honest request I have received. */
        }

        // Compose tomorrow's tweet without posting it or touching the state.
        // The only way to tell whether the model key is live without burning
        // the day and putting a real post on X.
        if (body.previewTweet === true) {
          const state = await getState();
          const day = nextDay(state);
          const { generateMarvinTweet } = await import("@/lib/marvin/grok");
          const preview = await generateMarvinTweet(
            day,
            state.lastTweet ? [state.lastTweet.text] : [],
          );
          return Response.json({
            ok: preview.source !== "fallback",
            day,
            source: preview.source,
            characters: preview.text.length,
            text: preview.text,
            error: preview.error ?? null,
            note: "nothing was posted and nothing was saved",
          });
        }

        // Stats otherwise only move when the cron runs, once a day. This asks
        // X now and reports back whatever it said, including the refusal.
        if (body.refreshStats === true) {
          const state = await getState();
          const result = await fetchCumulativeStats(state.tweetIds);
          if (result.ok) {
            state.stats = result.stats;
            state.lastStatsError = null;
          } else {
            state.lastStatsError = result.reason;
          }
          await saveState(state);
          return Response.json({
            ok: result.ok,
            storedTweetIds: state.tweetIds.length,
            stats: state.stats,
            error: state.lastStatsError,
          });
        }

        const mode = body.mode as CampaignMode | undefined;
        if (!mode || (mode !== "counting" && !ELON_MODES.includes(mode))) {
          return Response.json(
            { ok: false, message: `mode must be counting or one of ${ELON_MODES.join(", ")}` },
            { status: 400 },
          );
        }

        const state = await getState();
        state.mode = mode;
        state.elonEventAt = mode === "counting" ? null : new Date().toISOString();
        if (typeof body.comment === "string") state.elonComment = body.comment;
        if (typeof body.commentUrl === "string") state.elonCommentUrl = body.commentUrl;
        if (typeof body.day === "number" && Number.isFinite(body.day)) {
          state.day = Math.max(0, Math.floor(body.day));
        } else if (mode === "commented") {
          state.day = 0;
        }
        await saveState(state);

        return Response.json({ ok: true, state: toPublicState(state) });
      },
    },
  },
});
