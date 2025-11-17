import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.mjs", "**/*.{spec,test}.mjs"],
    // Ensure ESM .mjs files are handled consistently
    globals: true,
    watch: false,
    reporters: ["default"],
    coverage: {
      provider: "c8",
      reporter: ["text", "lcov"],
      all: true,
      exclude: ["node_modules/", "dist/"],
    },
  },
});
