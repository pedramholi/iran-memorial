import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.ts", "__tests__/**/*.test.tsx"],
    exclude: ["node_modules", "tools", ".next", "data"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json", "html"],
      reportsDirectory: "./coverage",
      include: [
        "lib/utils.ts",
        "lib/queries.ts",
        "lib/rate-limit.ts",
        "app/api/search/route.ts",
        "app/api/submit/route.ts",
        "components/VictimCard.tsx",
        "components/SearchBar.tsx",
        "components/LanguageSwitcher.tsx",
        "components/Header.tsx",
        "components/FilterBar.tsx",
      ],
      exclude: ["tools/**", "node_modules/**", "prisma/**", "data/**"],
    },
    testTimeout: 10000,
    reporters: ["default", "json"],
    outputFile: {
      json: "./test-results.json",
    },
  },
});
