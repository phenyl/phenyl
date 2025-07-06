import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/explorer/",
  server: {
    port: 3000,
  },
  build: {
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      external: [],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@phenyl/http-client": resolve(__dirname, "../http-client/lib/index.js"),
    },
  },
  optimizeDeps: {
    include: ["@phenyl/http-client"],
  },
});
