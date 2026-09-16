/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { posix } from "node:path"

import type { ParsedPath } from "./parse.js"
export type FormatParsedPath<T extends ParsedPath<string>> = T["dir"] extends ""
	? T["root"] extends "/"
		? `/${T["base"]}`
		: T["base"]
	: T["dir"] extends "/"
		? `/${T["base"]}`
		: `${T["dir"]}/${T["base"]}`

/**
 * Format a parsed POSIX path.
 *
 * @param parsedPath The parsed path object to format.
 *
 * @returns The formatted path.
 * @throws {TypeError} If input is not a {@linkcode ParsedPath}
 */
export function format<T extends ParsedPath<string>>(parsedPath: T): FormatParsedPath<T> {
	return posix.format(parsedPath) as any
}

export default format
