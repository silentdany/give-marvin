import { createFileRoute } from "@tanstack/react-router";
import { recordVisit } from "@/lib/marvin/store";

export const Route = createFileRoute("/api/visit")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const visits = await recordVisit();
          return Response.json({ ok: true, visits });
        } catch (err) {
          console.error("[marvin] visit", err);
          // A miscount is not worth an error page. Nothing here is.
          return Response.json({ ok: false, visits: 0 }, { status: 200 });
        }
      },
    },
  },
});
