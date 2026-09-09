import { createServerFn } from "@tanstack/react-start";
import type { PublicState } from "./types";

export const loadPublicState = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicState> => {
    const { getState, toPublicState } = await import("./store");
    return toPublicState(await getState());
  },
);
