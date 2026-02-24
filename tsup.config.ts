import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/pdf/index.ts", "src/video/index.ts"],
	format: ["esm"],
	dts: true,
	sourcemap: true,
	clean: true,
	external: [
		"react",
		"react-dom",
		"react-pdf",
		"react-window",
		"@vidstack/react",
	],
	splitting: false,
	minify: false,
});
