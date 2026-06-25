/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { format as _format } from "node:path"
import type { ParsedPath } from "./parse.js"
import type { Join, PathDelimiter } from "./type-utils.js"

export type FormatParsedPath<T extends ParsedPath<string>, D extends PathDelimiter = "/"> = Join<
	[T["dir"], T["base"]],
	D
>

/**
 * Return the directory name of a path. Similar to the Unix dirname command.
 *
 * @param parsedPath The parsed path object to format.
 * @throws {TypeError} If input is not a {@linkcode ParsedPath}
 * @returns The formatted path.
 */
export function format<T extends string>(parsedPath: ParsedPath<T>): FormatParsedPath<ParsedPath<T>> {
	return _format(parsedPath) as any
}

export default format
