import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { MarvinOrb } from "@/components/MarvinOrb";
import { NOT_FOUND_BODY, NOT_FOUND_LINK, NOT_FOUND_TITLE } from "@/lib/marvin/copy";
import { SITE_NAME } from "@/lib/marvin/seo";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_NAME },
      { name: "theme-color", content: "#ffffff" },
      { name: "color-scheme", content: "light" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Azeret+Mono:ital,wght@0,400;0,500;1,400&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFound,
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg font-sans text-fg">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});

function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-bg px-6 text-center">
      <MarvinOrb size={96} variant="cracked" title="404" />
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-extrabold text-fg-bright sm:text-3xl">{NOT_FOUND_TITLE}</h1>
        <p className="text-lg text-fg">{NOT_FOUND_BODY}</p>
      </div>
      <Link
        to="/"
        className="text-sm text-fg-dim underline decoration-border-strong underline-offset-4 hover:text-fg-bright"
      >
        {NOT_FOUND_LINK}
      </Link>
    </main>
  );
}
