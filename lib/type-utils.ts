/**
 * @copyright Sister Software
 * @license MIT
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

/**
 * Whether a POSIX path string is absolute, i.e. begins with `/`.
 */
export type IsAbsolute<S extends string> = S extends `/${string}` ? true : false

/**
 * Fold path segments POSIX-style: drop empty and current-directory (`.`) segments, and resolve
 * parent (`..`) segments against the accumulated output. Leading `..` segments are preserved on
 * relative paths but cannot escape an absolute root.
 */
type NormalizeSegments<
	Segments extends readonly string[],
	Absolute extends boolean,
	Acc extends readonly string[] = [],
> = Segments extends readonly [infer Head extends string, ...infer Tail extends readonly string[]]
	? Head extends "" | "."
		? NormalizeSegments<Tail, Absolute, Acc>
		: Head extends ".."
			? Acc extends readonly [...infer Init extends readonly string[], infer Last extends string]
				? Last extends ".."
					? NormalizeSegments<Tail, Absolute, [...Acc, ".."]>
					: NormalizeSegments<Tail, Absolute, Init>
				: Absolute extends true
					? NormalizeSegments<Tail, Absolute, Acc>
					: NormalizeSegments<Tail, Absolute, [".."]>
			: NormalizeSegments<Tail, Absolute, [...Acc, Head]>
	: Acc

/**
 * Canonicalize a POSIX path: collapse repeated slashes, drop `.` segments, and resolve `..`
 * segments, always dropping any trailing slash. This is the type-level analog of how
 * `node:path.resolve` canonicalizes a path. An absolute path that resolves away all of its segments
 * becomes `/`; a relative path that resolves to nothing becomes `.`. See {@linkcode Normalize} for
 * the trailing-slash-preserving variant that mirrors `node:path.normalize`.
 */
export type Resolve<S extends string> =
	NormalizeSegments<Split<S, "/">, IsAbsolute<S>> extends infer Segments extends readonly string[]
		? IsAbsolute<S> extends true
			? `/${Join<Segments, "/">}`
			: Segments extends readonly []
				? "."
				: Join<Segments, "/">
		: never

/**
 * Whether a path string carries a trailing slash. The root `/` is not considered to have one.
 */
type HasTrailingSlash<S extends string> = S extends "/" ? false : S extends `${string}/` ? true : false

/**
 * Normalize a POSIX path string the way `node:path` does: collapse repeated slashes, drop `.`
 * segments, and resolve `..` segments. A trailing slash is preserved (`foo/bar/` → `foo/bar/`,
 * `a/../` → `./`) exactly as `node:path.normalize` does, except on the root. An absolute path that
 * resolves away all of its segments becomes `/`; a relative path that resolves to nothing becomes
 * `.`.
 */
export type Normalize<S extends string> =
	Resolve<S> extends infer Core extends string
		? HasTrailingSlash<S> extends true
			? Core extends "/"
				? "/"
				: `${Core}/`
			: Core
		: never
