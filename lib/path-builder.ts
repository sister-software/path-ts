/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

/* eslint-disable @typescript-eslint/no-wrapper-object-types */
/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */

import { posix } from "node:path"

import type { PluckBasename } from "./basename.js"
import type { PluckDirname } from "./dirname.js"
import type { Join, Resolve } from "./type-utils.js"

/**
 * Type-safe path builder.
 *
 * @template S - The type of the path string.
 */
export interface PathBuilder<S extends string> extends String {
	/**
	 * Append additional path segments to the current path.
	 */
	// Note: We shadow PathBuilder to allow instances of PathBuilder to be used as a function.
	<T extends Array<string | number>>(...additionalPathSegments: T): PathBuilder<Resolve<Join<[S, ...T], "/">>>
}

/**
 * Runtime class identifier for the PathBuilder class.
 *
 * @internal
 */
export const kPathBuilder = Symbol.for("PathBuilder")

/**
 * Type-safe path builder, backed by a plain string.
 *
 * Unlike a `URL`, a `PathBuilder` never percent-encodes its contents and never truncates at `#` or `?`, so it
 * round-trips arbitrary POSIX paths verbatim. Extending `String` gives instances the full string method surface for
 * free.
 */
export class PathBuilder<S extends string = string> extends String implements PathBuilder<S> {
	/**
	 * Runtime class identifier for the PathBuilder class.
	 *
	 * @internal
	 */
	public [kPathBuilder] = true

	/**
	 * Recognize PathBuilder instances — and their callable proxies — via the {@linkcode kPathBuilder} brand, so
	 * `instanceof` works through the proxy returned by {@linkcode PathBuilder.from}.
	 */
	public static [Symbol.hasInstance](instance: unknown): boolean {
		return instance != null && (instance as any)[kPathBuilder] === true
	}

	protected constructor(path: S) {
		super(path)
	}

	/**
	 * Get the current path as a string.
	 */
	public override toString(): S {
		return super.toString() as S
	}

	/**
	 * Get the current path as a primitive string.
	 */
	public override valueOf(): S {
		return super.valueOf() as S
	}

	/**
	 * Directory name of a path. Similar to the Unix dirname command.
	 */
	public dirname(): PathBuilder<PluckDirname<S>> {
		return PathBuilder.from(posix.dirname(this.toString())) as any
	}

	/**
	 * Base name of a path. Similar to the Unix basename command.
	 */
	public basename(): PathBuilder<PluckBasename<S>> {
		return PathBuilder.from(posix.basename(this.toString())) as any
	}

	public get [Symbol.toStringTag](): S {
		return this.toString()
	}

	public [Symbol.toPrimitive](): S {
		return this.toString()
	}

	public [Symbol.for("nodejs.util.inspect.custom")](): S {
		return this.toString()
	}

	/**
	 * Normalize a path builder into a type-safe path builder.
	 *
	 * This is typical if your given path is {@linkcode PathBuilderLike}
	 */
	public static from<P1 extends string, Pn extends string[]>(
		pathBuilder: PathBuilder<P1>,
		...pathSegmentN: Pn
	): PathBuilder<Resolve<Join<[P1, ...Pn], "/">>>

	/**
	 * Create a new path builder from a string.
	 */
	public static from<P1 extends string, Pn extends string[]>(
		pathSegment1: P1,
		...pathSegmentN: Pn
	): PathBuilder<Resolve<Join<[P1, ...Pn], "/">>>

	/**
	 * Normalize a path builder or string into a type-safe path builder.
	 *
	 * This is typical if your given path is {@linkcode PathBuilderLike}
	 */
	public static from<P extends PathBuilder | string, Pn extends string[]>(
		pathBuilderLike: P,
		...pathSegmentN: Pn
	): PathBuilder<Resolve<Join<[P extends PathBuilder<infer T> ? T : P, ...Pn], "/">>>

	public static from<P extends PathBuilder | string, Pn extends string[]>(
		pathBuilderLike: P,
		...pathSegmentN: Pn
	): PathBuilder<Resolve<Join<[P extends PathBuilder<infer T> ? T : P, ...Pn], "/">>> {
		if (pathSegmentN.length === 0 && pathBuilderLike instanceof PathBuilder) {
			return pathBuilderLike as any
		}

		const resolvedPath = posix.resolve(
			// ---
			pathBuilderLike.toString(),
			...pathSegmentN.map((pathSegment) => pathSegment.toString())
		)

		const instance = new PathBuilder(resolvedPath)
		const toString = () => instance.toString()

		const pathBuilderProxy = new Proxy(PathBuilder.from, {
			apply(target, _thisArg, args) {
				return target(resolvedPath, ...args)
			},

			get(target, prop) {
				switch (prop) {
					case Symbol.toPrimitive:
					case Symbol.for("nodejs.util.inspect.custom"):
					case "toString":
					case "valueOf":
						return toString
					case "name":
						return "PathBuilderProxy"
				}

				if (prop === Symbol.toStringTag) return toString()

				if (prop in instance) {
					return (instance as any)[prop]
				}

				return (target as any)[prop]
			},

			getPrototypeOf() {
				return PathBuilder.prototype
			},
		})

		return pathBuilderProxy as any
	}
}

/**
 * Type-safe path builder or string.
 */
export type PathBuilderLike = string | PathBuilder

/**
 * Unwraps a path builder or string to its core string type.
 */
export type UnwrapPathBuilder<T extends string | PathBuilder> =
	T extends PathBuilder<infer U> ? U : T extends string ? T : never

export default PathBuilder
