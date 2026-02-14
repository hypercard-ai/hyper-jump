import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	sourcemap: true,
	clean: true,
	external: ["react", "react-dom"],
	splitting: false,
	minify: false,
	banner: {
		js: 'import "./index.css";',
	},
});
