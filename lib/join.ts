/**
 * @copyright Sister Software
 * @license AGPL-3.0
 * @author Teffen Ellis, et al.
 */

import { join as _join } from "node:path"
import type { PathBuilder } from "./path-builder.js"
import type { Join } from "./type-utils.js"

/**
 * Normalize a path builder into a type-safe path builder.
 *
 * This is typical if your given path is {@linkcode PathBuilderLike}
 */
export function join<P1 extends string, Pn extends string[]>(
	pathBuilder: PathBuilder<P1>,
	...pathSegmentN: Pn
): Join<[P1, ...Pn], "/">

/**
 * Create a new path builder from a string.
 */
export function join<P1 extends string, Pn extends string[]>(
	pathSegment1: P1,
	...pathSegmentN: Pn
): Join<[P1, ...Pn], "/">

/**
 * Normalize a path builder or string into a type-safe path builder.
 *
 * This is typical if your given path is {@linkcode PathBuilderLike}
 */
export function join<P extends PathBuilder | string, Pn extends string[]>(
	pathBuilderLike: P,
	...pathSegmentN: Pn
): Join<[P extends PathBuilder<infer T> ? T : P, ...Pn], "/">

/**
 * Join all arguments together and normalize the resulting path.
 *
 * @throws {TypeError} If path is not a string or {@linkcode PathBuilder}.
 */
export function join<P extends PathBuilder | string, Pn extends string[]>(
	pathBuilderLike: P,
	...pathSegmentN: Pn
): Join<[P extends PathBuilder<infer T> ? T : P, ...Pn], "/"> {
	const joinedPath = _join(
		// ---
		pathBuilderLike.toString(),
		...pathSegmentN.map((pathSegment) => pathSegment.toString())
	)

	return joinedPath as any
}

export default join
