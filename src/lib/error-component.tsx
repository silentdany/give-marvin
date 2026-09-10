import type { ErrorComponentProps } from "@tanstack/react-router";
import { MarvinOrb } from "@/components/marvin/MarvinOrb";
import { NOT_FOUND_LINE } from "@/lib/marvin/copy";

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
      <h1 className="text-lg font-medium text-fg-bright">{NOT_FOUND_LINE}</h1>
      <p className="max-w-md text-sm break-words text-fg-dim">{errorMessage(error)}</p>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <MarvinOrb size={96} />
      <p className="max-w-md text-lg text-fg-bright">{NOT_FOUND_LINE}</p>
      <a href="/" className="text-sm text-fg-dim underline decoration-border-strong underline-offset-4 hover:text-fg-bright">
        go back. I will still be here.
      </a>
    </main>
  );
}
