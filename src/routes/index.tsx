import { createFileRoute } from "@tanstack/react-router";
import { MarvinSite } from "@/components/marvin/site";
import { loadPublicState } from "@/lib/marvin/public";
import { seoHead } from "@/lib/marvin/seo";

export const Route = createFileRoute("/")({
  loader: () => loadPublicState(),
  head: ({ loaderData }) => seoHead(loaderData ?? { day: 1, mode: "counting" }),
  component: Home,
  pendingComponent: Boot,
});

function Home() {
  const data = Route.useLoaderData();
  return <MarvinSite initial={data} />;
}

function Boot() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-6 font-sans text-sm text-fg-dim">
      loading personality module…
    </main>
  );
}
