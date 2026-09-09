import { createFileRoute } from "@tanstack/react-router";
import { getState, toPublicState } from "@/lib/marvin/store";

export const Route = createFileRoute("/api/state")({
  server: {
    handlers: {
      GET: async () => {
        const state = toPublicState(await getState());
        return Response.json(state);
      },
    },
  },
});
