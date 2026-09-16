/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { fileURLToPath } from "node:url"

import { defineConfig } from "vite"

export default defineConfig({
	root: fileURLToPath(new URL(".", import.meta.url)),
	resolve: {
		alias: {
			"node:path": "path-browserify",
		},
	},
	build: {
		outDir: fileURLToPath(new URL("../../out/browser-fixture", import.meta.url)),
		emptyOutDir: true,
	},
})
