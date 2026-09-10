import { createServerFn } from "@tanstack/react-start";
import type { PublicState } from "./types.ts";

export const loadPublicState = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicState> => {
    const { getState, saveState, toPublicState } = await import("./store.ts");
    const state = await getState();
    state.pageVisits = (state.pageVisits ?? 0) + 1;
    await saveState(state);
    return toPublicState(state);
  },
);
