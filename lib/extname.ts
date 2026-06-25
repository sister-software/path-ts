/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { posix } from "node:path"
import type { PluckBasename } from "./basename.js"
import { PathBuilder } from "./path-builder.js"
import type { PathDelimiter } from "./type-utils.js"

/**
 * Plucks the substring after the final dot of a single segment that is known to contain a dot.
 */
type AfterLastDot<Segment extends string> = Segment extends `${infer _Head}.${infer Tail}`
	? Tail extends `${string}.${string}`
		? AfterLastDot<Tail>
		: Tail
	: Segment

/**
 * Computes the extension of a single basename, matching Node's `path.extname` rules: the extension
 * runs from the final dot to the end, but a path whose basename has no dot — or whose only dot is
 * the leading character of a dotfile such as `.gitignore` — has no extension.
 */
type ExtnameOfBasename<Basename extends string> = Basename extends `.${infer Rest}`
	? Rest extends `${string}.${string}`
		? `.${AfterLastDot<Rest>}`
		: ""
	: Basename extends `${string}.${string}`
		? `.${AfterLastDot<Basename>}`
		: ""

/**
 * Plucks the file extension from a path, matching the behavior of the Node.js `path` module: it
 * operates on the last path segment, does not handle multiple extensions (`file.tar.gz` → `.gz`),
 * and treats leading-dot dotfiles as having no extension (`.gitignore` → ``).
 */
export type PluckFileExtension<T extends string> = ExtnameOfBasename<PluckBasename<T>>

/**
 * Plucks the file name from a path without the extension.
 *
 * Note that this type retains the full given path. To strip the path and return only the file name,
 * use `PluckBaseFileName`.
 */
export type PluckFileName<T extends string> = T extends `${infer FileName}.${string}` ? FileName : T

/**
 * Plucks the base file name from a path without the extension.
 *
 * Note that this type only retains the file name portion of the path.
 *
 * To retain the full path, use `PluckFileName`.
 */
export type PluckBaseFileName<T extends string, D extends PathDelimiter = "/"> = PluckFileName<PluckBasename<T, D>>

/**
 * Return the extension of the path, from the last '.' to end of string in the last portion of the
 * path. If there is no '.' in the last portion of the path or the first character of it is '.',
 * then it returns an empty string.
 *
 * @param path The Path to evaluate.
 * @throws {TypeError} If path is not a string or {@linkcode PathBuilder}.
 * @returns The extension of the path.
 */
export function extname<T extends PathBuilder | string>(
	path: T
): T extends PathBuilder<infer U> ? PluckFileExtension<U> : T extends string ? PluckFileExtension<T> : never {
	return posix.extname(path.toString()) as any
}

export default extname
