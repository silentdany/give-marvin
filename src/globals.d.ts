/**
 * Build-time asset switches, injected by `define` in `vite.config.ts`.
 *
 * Drop a file at `public/marvin-orb.webp` or `public/guide-computer.webp` and
 * it replaces the drawn version on the next build — no code change needed.
 * Null when the file is not there.
 */
declare const __ORB_ASSET__: string | null;
declare const __COMPUTER_ASSET__: string | null;
