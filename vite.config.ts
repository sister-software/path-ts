/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

/// <reference types="vitest/config" />

import { defineConfig } from "vite"

export default defineConfig({
	test: {
		/* for example, use global to avoid globals imports (describe, test, expect): */
		// globals: true,
		// Avoid picking up the compiled `out/test/*.js` copies emitted by `tsc -b`.
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/out/**",
			"**/examples/**",
			"**/cypress/**",
			"**/.{idea,git,cache,output,temp}/**",
			"**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
		],
		typecheck: {
			enabled: true,
			include: ["test/**/*.ts"],
		},
	},
})
