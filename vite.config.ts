/**
 * @copyright Sister Software
 * @license AGPL-3.0
 * @author Teffen Ellis, et al.
 */

/// <reference types="vitest/config" />

import { defineConfig } from "vite"

export default defineConfig({
	test: {
		/* for example, use global to avoid globals imports (describe, test, expect): */
		// globals: true,
		typecheck: {
			enabled: true,
			include: ["test/**/*.ts"],
		},
	},
})
