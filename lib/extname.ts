/**
 * @copyright Sister Software
 * @license AGPL-3.0
 * @author Teffen Ellis, et al.
 */

import { extname as _extname } from "node:path"
import { PluckBasename } from "./basename.js"
import { PathBuilder } from "./path-builder.js"
import { PathDelimiter } from "./type-utils.js"

/**
 * Recursively plucks the file extension from a path.
 *
 * Note that this type deliberately does not handle paths with multiple extensions, matching the
 * behavior of the Node.js path module.
 */
export type PluckFileExtension<T extends string> = T extends `${string}.${infer FileExtensions}`
	? FileExtensions extends `${string}.${infer SubFileExtensions}`
		? PluckFileExtension<`.${SubFileExtensions}`>
		: `.${FileExtensions}`
	: ""

export type FileExtensionTest1 = PluckFileExtension<"file.txt"> // ".txt"
export type FileExtensionTest2 = PluckFileExtension<"file.bar.min.js"> // ".js"

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
 *
 * @returns The extension of the path.
 * @throws {TypeError} If path is not a string or {@linkcode PathBuilder}.
 */
export function extname<T extends PathBuilder | string>(
	path: T
): T extends PathBuilder<infer U> ? PluckFileExtension<U> : T extends string ? PluckFileExtension<T> : never {
	return _extname(path.toString()) as any
}

export default extname
