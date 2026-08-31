/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { posix } from "node:path"

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
 * Pluck the base name from a path, less a trailing suffix when the name carries one — `PluckBasename<"a/b.txt",
 * ".txt">` is `"b"`. A suffix the name does not end with is left alone, as `node:path` does.
 */
export type PluckBasenameWithoutSuffix<T extends string, Suffix extends string> = string extends Suffix
	? string
	: PluckBasename<T> extends `${infer Name}${Suffix}`
		? Name extends ""
			? PluckBasename<T>
			: Name
		: PluckBasename<T>

/**
 * Return the last portion of a path. Similar to the Unix basename command. Often used to extract the file name from a
 * fully qualified path.
 *
 * @param path The path to evaluate.
 * @param suffix An optional suffix to remove from the name, e.g. `".txt"`.
 *
 * @returns The base name of the path.
 * @throws {TypeError} If path is not a string or {@linkcode PathBuilder}.
 */
export function basename<T extends PathBuilder | string>(
	path: T
): T extends PathBuilder<infer U> ? PathBuilder<PluckBasename<U>> : T extends string ? PluckBasename<T> : never
export function basename<T extends PathBuilder | string, Suffix extends string>(
	path: T,
	suffix: Suffix
): T extends PathBuilder<infer U>
	? PathBuilder<PluckBasenameWithoutSuffix<U, Suffix>>
	: T extends string
		? PluckBasenameWithoutSuffix<T, Suffix>
		: never
export function basename(path: PathBuilder | string, suffix?: string): any {
	return posix.basename(path.toString(), suffix)
}

export default basename
