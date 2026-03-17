import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		root: "./packages/attribution",
		include: ["src/**/*.test.ts"],
	},
});
