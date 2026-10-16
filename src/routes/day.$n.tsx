import { createFileRoute, notFound } from "@tanstack/react-router";
import { MarvinSite } from "@/components/marvin/site";
import { loadDayPage } from "@/lib/marvin/day";
import { dayHead } from "@/lib/marvin/seo";

/** The URL each daily post links to. One URL per day, one X card per day. */
export const Route = createFileRoute("/day/$n")({
  loader: async ({ params }) => {
    const page = await loadDayPage({ data: params.n });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => (loaderData ? dayHead(loaderData.day) : {}),
  component: DayPage,
});

function DayPage() {
  const { state } = Route.useLoaderData();
  return <MarvinSite initial={state} />;
}
