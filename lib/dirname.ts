/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { posix } from "node:path"
import { PathBuilder } from "./path-builder.js"
import type { Join, PathDelimiter, Split, WithoutTrailingDelimiter } from "./type-utils.js"

/**
 * Pluck the directory name from a path, e.g., the parent directory. Matches Node's `path.dirname`:
 * a top-level entry resolves to the root, a bare name resolves to the current directory, and the
 * root is its own parent.
 *
 * ```ts
 * type Test1 = PluckDirname<"path/to/file"> // "path/to"
 * type Test2 = PluckDirname<"/foo"> // "/"
 * type Test3 = PluckDirname<"path"> // "."
 * type Test4 = PluckDirname<"/"> // "/"
 * ```
 */
export type PluckDirname<T extends string, D extends PathDelimiter = "/"> =
	Split<WithoutTrailingDelimiter<T, D>, D> extends [...infer Head extends string[], infer _Last]
		? Head extends []
			? T extends `${D}${string}`
				? "/"
				: "."
			: Head extends [""]
				? "/"
				: Join<Head, "/">
		: never

/**
 * Return the directory name of a path. Similar to the Unix dirname command.
 *
 * @throws {TypeError} If path is not a string or {@linkcode PathBuilder}.
 * @returns The directory name of the path.
 */
export function dirname<T extends PathBuilder | string>(
	path: T
): T extends PathBuilder<infer U> ? PathBuilder<PluckDirname<U>> : T extends string ? PluckDirname<T> : never {
	return posix.dirname(path.toString()) as any
}

export default dirname
