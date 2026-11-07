import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MessageCircle } from "lucide-react";

import appCss from "../styles.css?url";
import pastryCss from "../pastry.css?url";
import customAccessibilityCss from "../custom-accessibility.css?url";
import shopLuxuryCss from "../shop-luxury.css?url";
import { reportRuntimeError } from "../lib/runtime-error-reporting";
import { CartProvider } from "../lib/store";
import { SiteLayout } from "../components/site";
import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../context/AuthContext";

const WHATSAPP_URL = "https://wa.me/254713808906?text=Hello%20Sweet%20Serenity!%20I%20have%20a%20question%20about%20your%20cakes.";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportRuntimeError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sweet Serenity | Cakes in Yala, Siaya County" },
            { name: "description", content: "Exquisite celebration cakes, custom designs and cupcakes from Sweet Serenity in Yala, Kenya." },
      { name: "author", content: "Sweet Serenity" },
      { property: "og:title", content: "Sweet Serenity | Cakes in Yala, Siaya County" },
      { property: "og:description", content: "Exquisite celebration cakes, custom designs and cupcakes from Sweet Serenity in Yala, Kenya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@sweetserenity" },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: pastryCss,
      },
      {
        rel: "stylesheet",
        href: customAccessibilityCss,
      },
      {
        rel: "stylesheet",
        href: shopLuxuryCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" richColors closeButton />
          <SiteLayout><div key={pathname} className="route-transition"><Outlet /></div></SiteLayout>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with Sweet Serenity on WhatsApp"
            className="fixed bottom-6 right-4 z-50 flex h-14 items-center gap-3 rounded-full bg-[#25D366] pl-4 pr-5 text-white shadow-[0_10px_30px_rgba(37,211,102,.35)] transition duration-300 hover:-translate-y-1 hover:bg-[#20BD5A] hover:shadow-[0_14px_36px_rgba(37,211,102,.42)] sm:right-6"
          >
            <MessageCircle className="h-6 w-6 shrink-0" strokeWidth={2.2} aria-hidden="true" />
            <span className="hidden whitespace-nowrap text-sm font-semibold tracking-wide sm:inline">Chat with us</span>
          </a>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
