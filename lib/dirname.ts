/**
 * @copyright Sister Software
 * @license AGPL-3.0
 * @author Teffen Ellis, et al.
 */

import { dirname as _dirname } from "node:path"
import { PathBuilder } from "./path-builder.js"
import type { Join, PathDelimiter, Split, WithoutTrailingDelimiter } from "./type-utils.js"

/**
 * Pluck the directory name from a path, e.g., the parent directory.
 *
 * ```ts
 * type Test1 = PluckDirname<"path/to/file"> // "path/to"
 * type Test2 = PluckDirname<"path/to"> // "path"
 * type Test3 = PluckDirname<"path"> // ""
 * ```
 */
export type PluckDirname<T extends string, D extends PathDelimiter = "/"> =
	Split<WithoutTrailingDelimiter<T, D>, D> extends [...infer Head, infer _Tail]
		? Head extends string[]
			? Join<Head, "/">
			: Head extends string
				? Head
				: never
		: never

/**
 * Return the directory name of a path. Similar to the Unix dirname command.
 *
 * @returns The directory name of the path.
 * @throws {TypeError} If path is not a string or {@linkcode PathBuilder}.
 */
export function dirname<T extends PathBuilder | string>(
	path: T
): T extends PathBuilder<infer U> ? PathBuilder<PluckDirname<U>> : T extends string ? PluckDirname<T> : never {
	return _dirname(path.toString()) as any
}

export default dirname
