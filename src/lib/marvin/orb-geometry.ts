/**
 * One source of truth for the split orb, in a 200x200 box.
 *
 * The orb is cut down the middle at x=100. The left half keeps the normal Grok
 * bot eye — a white oval. The right half gets Marvin's — a red triangle,
 * pointing down, outer corner lower than the inner one so it droops. Two eyes,
 * one per half, so the finished face has one of each. Almost no difference
 * except the eyes. That is the entire joke, so it has to survive being 32px.
 *
 * Imported by the component and by the OG renderer. `public/favicon.svg` is a
 * static file and repeats these numbers by hand — keep it in step.
 */
export const ORB_CENTER = 100;
export const ORB_RADIUS = 94;

/** Eye centres: one per half, well clear of the seam. */
export const EYE_Y = 94;
export const EYE_X = { left: 62, right: 138 } as const;
export const EYE_RX = 24;
export const EYE_RY = 14;

export const GROK_EYES = [
  { cx: EYE_X.left, cy: EYE_Y },
  { cx: EYE_X.right, cy: EYE_Y },
] as const;

/** Droop: the corner nearest the edge of the face sits lower. */
export const MARVIN_EYES = ["38,86 86,76 62,128", "114,76 162,86 138,128"] as const;

/** The mouth he does not have, drawn as the line he would use. */
export const DROOP_MOUTH = "M70 152 Q100 136 130 152";

export const ORB_INK = {
  shellTop: "#ffffff",
  shellMid: "#fafaf8",
  shellEdge: "#e6e6e2",
  shellLine: "#e2e2de",
  grokFill: "#ffffff",
  grokStroke: "#2c2c2a",
  marvin: "#c23b3b",
} as const;
