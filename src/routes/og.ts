import { createFileRoute } from "@tanstack/react-router";
import { ogResponse } from "@/lib/marvin/og-request";

/** The short path. Same card as /api/og — it is the same renderer. */
export const Route = createFileRoute("/og")({
  server: {
    handlers: {
      GET: async ({ request }) => ogResponse(request),
    },
  },
});
