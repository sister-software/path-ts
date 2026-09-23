/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { posix } from "node:path"

import { PathBuilder, type PathBuilderLike, type UnwrapPathBuilder } from "./path-builder.js"
import type { Join, Resolve } from "./type-utils.js"

type UnwrapPathBuilderSegments<S extends readonly PathBuilderLike[]> = {
	[K in keyof S]: S[K] extends PathBuilderLike ? UnwrapPathBuilder<S[K]> : never
} extends infer U extends string[]
	? U
	: never

/**
 * Apply `path.resolve`'s left-to-right reset rule: an absolute segment discards everything before it.
 */
type ResolvePathSegments<Segments extends readonly string[], Acc extends string> = Segments extends readonly [
	infer Head extends string,
	...infer Tail extends readonly string[],
]
	? ResolvePathSegments<Tail, Head extends `/${string}` ? Head : `${Acc}/${Head}`>
	: Resolve<Acc>

/**
 * Type-utility for resolving a relative path-like string to an absolute path.
 */
export type ResolvePathString<
	S extends string,
	Root extends string = "/",
	Ss extends PathBuilderLike[] = [],
> = ResolvePathSegments<[S, ...UnwrapPathBuilderSegments<Ss>], Root>

/**
 * Type-utility for resolving a relative path-like string to an absolute path.
 *
 * This is useful for converting relative paths to absolute paths, such as when creating higher-order path builders that
 * are relative to a project root.
 */
export type ResolvePathBuilderLike<
	T extends PathBuilderLike = PathBuilderLike,
	Root extends string = "/",
	Pn extends PathBuilderLike[] = [],
> =
	T extends PathBuilder<infer S>
		? ResolvePathString<S, Root, Pn>
		: T extends string
			? ResolvePathString<T, Root, Pn>
			: never

/**
 * The right-most parameter is considered {to}. Other parameters are considered an array of {from}.
 *
 * Starting from leftmost {from} parameter, resolves {to} to an absolute path.
 *
 * If {to} isn't already absolute, {from} arguments are prepended in right to left order, until an absolute path is
 * found. If after using all {from} paths still no absolute path is found, the current working directory is used as
 * well. The resulting path is normalized, and trailing slashes are removed unless the path gets resolved to the root
 * directory.
 *
 * @param pathSegment1 A sequence of paths or path segments.
 * @param pathSegmentN A sequence of paths or path segments.
 *
 * @returns An absolute path.
 * @throws {TypeError} If any of the arguments is not a string.
 */
export function resolvePathBuilder<T extends PathBuilderLike, Pn extends PathBuilderLike[]>(
	pathSegment1?: T,
	...pathSegmentN: Pn
): PathBuilder<ResolvePathBuilderLike<T, "/{$CWD}", Pn>> {
	const resolved_string = posix.resolve(
		pathSegment1?.toString() || "",
		...pathSegmentN.map((segment) => segment.toString())
	)

	return PathBuilder.from(resolved_string) as any
}

/**
 * Resolve one or more path segments to a single absolute path string.
 *
 * The string-returning sibling of {@linkcode resolvePathBuilder}: the same resolution, but it returns a primitive
 * `string` (branded with the resolved literal type) instead of a {@linkcode PathBuilder}. Prefer this at the boundaries
 * of `node:fs` and other APIs that take a plain path string, where a builder would otherwise require an explicit
 * `.toString()`.
 *
 * @param pathSegment1 A sequence of paths or path segments.
 * @param pathSegmentN A sequence of paths or path segments.
 *
 * @returns An absolute path string.
 * @throws {TypeError} If any of the arguments is not a string.
 */
export function resolvePath<T extends PathBuilderLike, Pn extends PathBuilderLike[]>(
	pathSegment1?: T,
	...pathSegmentN: Pn
): ResolvePathBuilderLike<T, "/{$CWD}", Pn> {
	return posix.resolve(pathSegment1?.toString() || "", ...pathSegmentN.map((segment) => segment.toString())) as any
}

export type PathBuilderRoot = string | (() => string)

/**
 * A path builder whose runtime root has a type-level alias.
 *
 * @deprecated Use `PathBuilder<RuntimeRootAlias>`. This alias remains for source compatibility.
 */
export type PathBuilderResolver<RuntimeRootAlias extends string = "~"> = PathBuilder<RuntimeRootAlias>

/**
 * Create a custom path builder resolver with a bound root.
 *
 * This is useful for creating higher-order path builders that are relative to a project root.
 *
 * @param absoluteRuntimeRoot The absolute path to the root of the project, or a function that supplies it. A supplier
 *   is read whenever the builder or one of its descendants is converted to a primitive path. The supplied path should
 *   be absolute.
 *
 * @returns A custom path builder resolver.
 */
export function createPathBuilderResolver<RuntimeRootAlias extends string = "~">(
	absoluteRuntimeRoot: PathBuilderRoot
): PathBuilder<RuntimeRootAlias> {
	const source = typeof absoluteRuntimeRoot === "function" ? absoluteRuntimeRoot : () => absoluteRuntimeRoot

	return PathBuilder.fromSource(source)
}

export interface PathResolver<RuntimeRootAlias extends string = "~"> {
	(): RuntimeRootAlias

	<T extends PathBuilderLike, Pn extends PathBuilderLike[] = []>(
		pathSegment1?: T,
		...pathSegmentN: Pn
	): ResolvePathBuilderLike<T, RuntimeRootAlias, Pn>
}

/**
 * Create a custom path resolver with a bound root that returns absolute path strings.
 *
 * The string-returning sibling of {@linkcode createPathBuilderResolver}: the returned function resolves segments against
 * `absoluteRuntimeRoot` and returns a primitive `string` (branded with the {@linkcode RuntimeRootAlias}) instead of a
 * {@linkcode PathBuilder}. Because it returns a string, the result is not itself callable — use it for terminal, leaf
 * paths (e.g. handing a path to `node:fs`); reach for {@linkcode createPathBuilderResolver} when you need to keep
 * appending across multiple steps.
 *
 * @param absoluteRuntimeRoot The absolute path to the root of the project. Note that this should be an absolute path,
 *   not a relative path. If you compile your project to a different location, you should use the absolute path to the
 *   root of the compiled project.
 *
 * @returns A custom path resolver.
 */
export function createPathResolver<RuntimeRootAlias extends string = "~">(
	absoluteRuntimeRoot: string
): PathResolver<RuntimeRootAlias> {
	const resolver = (...args: PathBuilderLike[]) => {
		return resolvePath(absoluteRuntimeRoot, ...args.map((arg) => arg.toString()))
	}

	return resolver as any
}

export default resolvePathBuilder
