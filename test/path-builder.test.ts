/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { kPathBuilder, PathBuilder, type PathBuilderSegment, type ResolvePathBuilderSegments } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

declare const foreignPathBuilderBrand: unique symbol

/** Models the public shape emitted by another physical installation of path-ts. */
type ForeignPathBuilder<S extends string> = Omit<PathBuilder<S>, typeof kPathBuilder> & {
	<T extends PathBuilderSegment[]>(
		...additionalPathSegments: T
	): PathBuilder<
		ResolvePathBuilderSegments<
			{ [K in keyof T]: T[K] extends PathBuilder<infer Path> ? Path : T[K] } extends infer Segments extends Array<
				string | number
			>
				? Segments
				: never,
			S
		>
	>
	readonly [foreignPathBuilderBrand]: true
}

test("Path builder can build children", () => {
	const resultBuilder = PathBuilder.from("/foo")
	expectTypeOf(resultBuilder).toEqualTypeOf<PathBuilder<"/foo">>()

	const resultBuilderChild = resultBuilder("bar", "baz")

	expect(resultBuilderChild.toString(), "Builder child matches").toBe("/foo/bar/baz")
	expectTypeOf(resultBuilderChild).toEqualTypeOf<PathBuilder<"/foo/bar/baz">>()

	const resuiltBuilderGrandchild = resultBuilderChild("qux")

	expect(resuiltBuilderGrandchild.toString(), "Builder child creates grandchild").toBe("/foo/bar/baz/qux")

	expectTypeOf(resuiltBuilderGrandchild).toEqualTypeOf<PathBuilder<"/foo/bar/baz/qux">>()
})

test("Path builder brands remain runtime-only across package copies", () => {
	const builder = PathBuilder.from("/foo")

	// `from` recognizes builders from a different physical copy through the shared runtime symbol.
	expect(PathBuilder.from(builder)).toBe(builder)

	// A distinct `unique symbol` from another declaration file must not make its public builder type incompatible.
	expectTypeOf<ForeignPathBuilder<"/foo"> extends PathBuilder<"/foo"> ? true : false>().toEqualTypeOf<true>()
})

test("Path builder normalizes parent segments in both value and type", () => {
	const parent = PathBuilder.from("/foo/bar")("..")

	expect(parent.toString()).toBe("/foo")

	expectTypeOf(parent).toEqualTypeOf<PathBuilder<"/foo">>()
})

test("Path builder preserves spaces without URL-encoding them", () => {
	const result = PathBuilder.from("/foo bar")

	expect(result.toString(), "Spaces are not percent-encoded").toBe("/foo bar")
})

test("Path builder preserves spaces in appended segments", () => {
	const result = PathBuilder.from("/foo")("bar baz")

	expect(result.toString()).toBe("/foo/bar baz")
})

test("Path builder does not truncate at # or ?", () => {
	expect(PathBuilder.from("/a/b#c").toString(), "Fragment marker is a literal character").toBe("/a/b#c")
	expect(PathBuilder.from("/a/b?c").toString(), "Query marker is a literal character").toBe("/a/b?c")
})

test("Path builder can proxy string methods", () => {
	const args = ["/foo", "bar", "baz"] as const
	const result = PathBuilder.from(...args)

	expect(result.length, "Path builder length matches").toBe(
		args.reduce((acc, _segment, i) => acc + args[i]!.length, 0) + args.length - 1
	)
	expect(result[Symbol.toPrimitive](), "Path builder `Symbol.toPrimitive` proxies").toBe("/foo/bar/baz")
	expect(result.toString(), "Path builder `toString()` proxies").toBe("/foo/bar/baz")
	expect(result[Symbol.toStringTag], "Path builder `Symbol.toStringTag` proxies").toBe("/foo/bar/baz")
})

test("Path builder serializes as its primitive path", () => {
	const result = PathBuilder.from("/foo")("bar")

	expect(JSON.stringify(result)).toBe('"/foo/bar"')
	expect(JSON.stringify({ path: result })).toBe('{"path":"/foo/bar"}')
	expectTypeOf(result.toJSON()).toEqualTypeOf<"/foo/bar">()
})
