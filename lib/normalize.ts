/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { posix } from "node:path"

import { PathBuilder, type UnwrapPathBuilder } from "./path-builder.js"
import type { Normalize } from "./type-utils.js"

/**
 * Fold `.` and `..` segments and collapse repeated separators, keeping a trailing separator. Unlike
 * {@linkcode resolvePath}, a relative path stays relative.
 *
 * @returns The normalized path — a {@linkcode PathBuilder} in, a {@linkcode PathBuilder} out.
 * @throws {TypeError} If path is not a string or {@linkcode PathBuilder}.
 */
export function normalize<T extends PathBuilder | string>(
	path: T
): T extends PathBuilder<infer U> ? PathBuilder<Normalize<U>> : Normalize<UnwrapPathBuilder<T>> {
	const normalized = posix.normalize(path.toString())

	return (path instanceof PathBuilder ? PathBuilder.from(normalized) : normalized) as any
}

export default normalize
