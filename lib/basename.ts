/**
 * @copyright Sister Software
 * @license AGPL-3.0
 * @author Teffen Ellis, et al.
 */

import { basename as _basename } from "node:path"
import { PathBuilder } from "./path-builder.js"
import type { PathDelimiter, Split, WithoutTrailingDelimiter } from "./type-utils.js"

/**
 * Pluck the base name from a path.
 */
export type PluckBasename<T extends string, D extends PathDelimiter = "/"> =
	Split<WithoutTrailingDelimiter<T, D>, D> extends [...infer _Head, infer Tail]
		? Tail extends string
			? Tail
			: never
		: never

/**
 * Return the last portion of a path. Similar to the Unix basename command. Often used to extract
 * the file name from a fully qualified path.
 *
 * @param path The path to evaluate.
 *
 * @returns The base name of the path.
 * @throws {TypeError} If path is not a string or {@linkcode PathBuilder}.
 */
export function basename<T extends PathBuilder | string>(
	path: T
): T extends PathBuilder<infer U> ? PathBuilder<PluckBasename<U>> : T extends string ? PluckBasename<T> : never {
	return _basename(path.toString()) as any
}

export default basename
