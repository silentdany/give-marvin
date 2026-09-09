import type { ErrorComponentProps } from "@tanstack/react-router";

const FALLBACK_MESSAGE = "something broke. I predicted this. I take no pleasure in being right.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
      <p className="text-xs tracking-widest text-fg-dim uppercase">panic.dump</p>
      <h1 className="text-lg font-medium text-fg-bright">it went wrong. of course it did.</h1>
      <p className="max-w-md text-sm break-words text-fg-dim">{errorMessage(error)}</p>
    </main>
  );
}
