/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

/**
 * @import {Config} from "eslint/config"
 */

import { createESLintPackageConfig } from "@sister.software/eslint-config"

import { defineConfig } from "eslint/config"

// @ts-check

/**
 * ESLint configuration for the Typed Path Builder package.
 *
 * @type {Config[]}
 */
const ESLintConfig = defineConfig(
	createESLintPackageConfig({
		copyrightHolder: "Sister Software",
		spdxLicenseIdentifier: "MIT",
	})
)

export default ESLintConfig
