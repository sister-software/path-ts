/**
 * @copyright Sister Software
 * @license AGPL-3.0
 * @author Teffen Ellis, et al.
 *
 *   Portions of this file are derived from the `type-fest` package, which is licensed under the MIT
 *   license.
 *
 *   For more information, visit the `type-fest` repository at
 *   https://github.com/sindresorhus/type-fest
 */

/**
 * Values that can be joined together.
 */
type JoinableItem = string | number | bigint | boolean | undefined | null

/**
 * Coalesce a value to a string, or a fallback if the value is `null` or `undefined`.
 *
 * `null` and `undefined` are treated uniquely in the built-in join method, in a way that differs
 * from the default `toString` that would result in the type `${undefined}`. That's why we need to
 * handle it specifically with this helper.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join#description
 */
type NullishCoalesce<Value extends JoinableItem, Fallback extends string> = Value extends undefined | null
	? NonNullable<Value> | Fallback
	: Value

/**
 * Represents an OS-specific path delimiter.
 */
export type PathDelimiter = "/" | "\\"

/**
 * Join an array of page segments and/or numbers using the given string as a delimiter.
 */
export type Join<Items extends readonly JoinableItem[], Delimiter extends PathDelimiter> = Items extends readonly []
	? ""
	: Items extends readonly [JoinableItem?]
		? `${NullishCoalesce<Items[0], "">}`
		: Items extends readonly [infer First extends JoinableItem, ...infer Tail extends readonly JoinableItem[]]
			? `${NullishCoalesce<First, "">}${Delimiter}${Join<Tail, Delimiter>}`
			: Items extends readonly [...infer Head extends readonly JoinableItem[], infer Last extends JoinableItem]
				? `${Join<Head, Delimiter>}${Delimiter}${NullishCoalesce<Last, "">}`
				: string

/**
 * Split a path by a delimiter.
 */
export type Split<
	S extends string,
	Delimiter extends PathDelimiter,
> = S extends `${infer Head}${Delimiter}${infer Tail}`
	? [Head, ...Split<Tail, Delimiter>]
	: S extends Delimiter
		? []
		: [S]

/**
 * Remove a trailing delimiter from a path.
 */
export type WithoutTrailingDelimiter<T extends string, D extends PathDelimiter = "/"> = T extends `${infer U}${D}`
	? U
	: T
