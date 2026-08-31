/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { posix } from "node:path"

import type { PathBuilder, UnwrapPathBuilder } from "./path-builder.js"
import type { IsAbsolute } from "./type-utils.js"

/**
 * Whether a path starts at the root. POSIX semantics, so only a leading `/` counts — a Windows drive letter is an
 * ordinary segment here.
 *
 * @returns `true` or `false` as a literal when the path is one; `boolean` for a plain `string`.
 */
export function isAbsolute<T extends PathBuilder | string>(
	path: T
): string extends UnwrapPathBuilder<T> ? boolean : IsAbsolute<UnwrapPathBuilder<T>> {
	return posix.isAbsolute(path.toString()) as any
}

export default isAbsolute
