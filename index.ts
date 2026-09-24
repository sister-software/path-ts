/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

// oxlint-disable typescript/triple-slash-reference

/// <reference path="./lib/path-builder.ts" />

import type { PathBuilder } from "./lib/path-builder.js"

// This may look redundant, but it ensures that TypeScript picks up the type definitions for PathBuilder when this module is imported.
export { PathBuilder, type PathBuilderLike, type UnwrapPathBuilder } from "./lib/path-builder.js"

export * from "./lib/basename.js"
export * from "./lib/dirname.js"
export * from "./lib/extname.js"
export * from "./lib/format.js"
export * from "./lib/is-absolute.js"
export * from "./lib/join.js"
export * from "./lib/normalize.js"
export * from "./lib/parse.js"
export * from "./lib/path-builder.js"
export * from "./lib/relative.js"
export * from "./lib/resolve.js"
export * from "./lib/sep.js"
export * from "./lib/type-utils.js"

// oxlint-disable-next-line typescript/no-useless-empty-export -- Enforces ESM module semantics.
export {}

declare global {
	interface StringConstructor {
		/**
		 * @deprecated use {@linkcode PathBuilder#toString}
		 */
		(value: PathBuilder): never
	}
}
