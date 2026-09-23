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
 * A segment accepted when extending a path builder.
 */
export type PathBuilderSegment = string | number | PathBuilder

type UnwrapPathBuilderSegments<S extends readonly PathBuilderSegment[]> = {
	[K in keyof S]: S[K] extends PathBuilder<infer Path> ? Path : S[K]
} extends infer Segments extends Array<string | number>
	? Segments
	: never

export type ResolvePathBuilderSegments<Segments extends Array<string | number>, Acc extends string> = Segments extends [
	infer Head extends string | number,
	...infer Tail extends Array<string | number>,
]
	? ResolvePathBuilderSegments<Tail, Head extends `/${string}` ? Head : `${Acc}/${Head}`>
	: Resolve<Acc>

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
	<T extends PathBuilderSegment[]>(
		...additionalPathSegments: T
	): PathBuilder<ResolvePathBuilderSegments<UnwrapPathBuilderSegments<T>, S>>
}

/**
 * A path value supplied when the builder is read.
 */
export type PathBuilderSource = () => string

/**
 * Runtime class identifier for the PathBuilder class.
 *
 * @internal
 */
export const kPathBuilder = Symbol.for("path-ts.PathBuilder")

/**
 * Type-safe path builder, backed by a plain string.
 *
 * Unlike a `URL`, a `PathBuilder` never percent-encodes its contents and never truncates at `#` or `?`, so it
 * round-trips arbitrary POSIX paths verbatim. Extending `String` gives instances the full string method surface for
 * free.
 */
export class PathBuilder<S extends string = string> extends String implements PathBuilder<S> {
	/**
	 * Recognize PathBuilder instances — and their callable proxies — via the {@linkcode kPathBuilder} brand, so
	 * `instanceof` works through the proxy returned by {@linkcode PathBuilder.from}.
	 */
	public static [Symbol.hasInstance](instance: unknown): boolean {
		return instance != null && (instance as any)[kPathBuilder] === true
	}

	protected constructor(path: S) {
		super(path)
		// Keep the runtime brand off the public instance type. Consumers may receive builders through two physical copies of
		// path-ts (for example, one direct and one nested below a dependency); a public unique-symbol property would make
		// their otherwise identical builders nominally incompatible to TypeScript.
		Object.defineProperty(this, kPathBuilder, { value: true })
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
	 * Return the primitive path used by JSON serialization.
	 */
	public toJSON(): S {
		return this.toString()
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
	public basename(): PluckBasename<S> {
		return posix.basename(this.toString()) as any
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

		return PathBuilder.fromSource(() =>
			posix.resolve(pathBuilderLike.toString(), ...pathSegmentN.map((pathSegment) => pathSegment.toString()))
		) as any
	}

	/**
	 * Create a builder whose value is read from a source on demand.
	 *
	 * Descendants retain the source, so a value created before the source changes resolves against the current value when
	 * it is read.
	 */
	public static fromSource<S extends string>(source: PathBuilderSource): PathBuilder<S> {
		const resolve = () => posix.resolve(source()) as S
		const instance = new PathBuilder("" as S)
		const toString = () => resolve()

		const pathBuilderProxy = new Proxy(PathBuilder.from, {
			apply(_target, _thisArg, args: PathBuilderSegment[]) {
				return PathBuilder.fromSource(() =>
					posix.resolve(resolve(), ...args.map((pathSegment) => pathSegment.toString()))
				)
			},

			get(target, prop) {
				switch (prop) {
					case Symbol.toPrimitive:
					case Symbol.for("nodejs.util.inspect.custom"):
					case "toJSON":
					case "toString":
					case "valueOf":
						return toString
					case "length":
						return toString().length
					case "name":
						return "PathBuilderProxy"
				}

				if (prop === Symbol.toStringTag) return toString()

				if (typeof prop === "string" && /^(?:0|[1-9]\d*)$/.test(prop)) return toString()[Number(prop)]

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
