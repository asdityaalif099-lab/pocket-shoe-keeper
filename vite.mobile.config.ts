import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

// Separate, client-only build used to package the app with Capacitor for Android.
// Output goes to dist-mobile/ which is the Capacitor webDir.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsConfigPaths({ projects: ["./tsconfig.json"] })],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  base: "./",
  publicDir: "public",
  build: {
    outDir: "dist-mobile",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "index.mobile.html"),
    },
  },
});
