import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter, createHashHistory } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import "./styles.css";

// Standalone client-only entry used for the Capacitor / Android build.
// Hash history keeps routing working inside the native WebView.

// The root route ships an SSR document shell (<html>/<head>/<body>). Rendering
// that shell inside #root nests a whole document in the page and breaks the DOM
// (the app freezes on first input). Replace it with a pass-through for mobile.
(routeTree as unknown as {
  options: { shellComponent?: unknown };
  update: (o: Record<string, unknown>) => void;
}).update({
  shellComponent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
});

const router = createRouter({
  routeTree,
  context: { queryClient: new QueryClient() },
  history: createHashHistory(),
  scrollRestoration: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
