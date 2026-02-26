import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/pdf/index.ts", "src/video/index.ts"],
	format: ["esm"],
	dts: false,
	sourcemap: true,
	clean: true,
	external: ["react", "react-dom", "react-pdf", "react-window"],
	splitting: false,
	minify: false,
});
