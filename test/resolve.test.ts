/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { createPathBuilderResolver, createPathResolver, PathBuilder, resolvePath } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

test("resolvePath returns a primitive string, not a builder", () => {
	const result = resolvePath("/foo", "bar")

	expect(typeof result, "usable directly by node:fs").toBe("string")
	expect(result).toBe("/foo/bar")

	expectTypeOf(result).toEqualTypeOf<"/foo/bar">()
})

test("resolvePath normalizes parent segments", () => {
	const result = resolvePath("/foo/bar", "..")

	expect(result).toBe("/foo")

	expectTypeOf(result).toEqualTypeOf<"/foo">()
})

test("resolvePath accepts a PathBuilder segment", () => {
	const segment = PathBuilder.from("/data")("public")
	const result = resolvePath("/ignored", segment)

	expect(result).toBe("/data/public")
	expectTypeOf(result).toEqualTypeOf<"/data/public">()
})

test("createPathResolver yields strings from a bound root", () => {
	const dataRoot = createPathResolver<"/data">("/data")
	const shard = dataRoot("wof", "postalcode-us.db")

	expect(typeof shard).toBe("string")
	expect(shard).toBe("/data/wof/postalcode-us.db")

	expectTypeOf(shard).toEqualTypeOf<"/data/wof/postalcode-us.db">()
})

test("createPathResolver with no segments returns the root", () => {
	const dataRoot = createPathResolver<"/data">("/data")

	expect(dataRoot()).toBe("/data")

	expectTypeOf(dataRoot()).toEqualTypeOf<"/data">()
})

test("createPathBuilderResolver returns a PathBuilder", () => {
	const dataRoot = createPathBuilderResolver<"~data">("/data")
	const shard = dataRoot("wof", "postalcode-us.db")

	expect(dataRoot).toBeInstanceOf(PathBuilder)
	expect(dataRoot.toString()).toBe("/data")
	expect(shard.toString()).toBe("/data/wof/postalcode-us.db")
	expectTypeOf(dataRoot).toEqualTypeOf<PathBuilder<"~data">>()
	expectTypeOf(shard).toEqualTypeOf<PathBuilder<"~data/wof/postalcode-us.db">>()
})

test("a bound builder accepts another PathBuilder as a segment", () => {
	const dataRoot = createPathBuilderResolver<"~data">("/data")
	const absolute = PathBuilder.from("/other/file.txt")
	const result = dataRoot("ignored", absolute)

	expect(result.toString()).toBe("/other/file.txt")
	expectTypeOf(result).toEqualTypeOf<PathBuilder<"/other/file.txt">>()
})

test("createPathBuilderResolver reads a supplied root when a descendant is read", () => {
	let root = "/first"
	let reads = 0
	const dataRoot = createPathBuilderResolver<"~data">(() => {
		reads++

		return root
	})
	const shard = dataRoot("wof", "postalcode-us.db")

	expect(reads).toBe(0)
	expect(shard.toString()).toBe("/first/wof/postalcode-us.db")

	root = "/second"

	expect(dataRoot.toString()).toBe("/second")
	expect(shard.toString()).toBe("/second/wof/postalcode-us.db")
	expect(shard.startsWith("/second")).toBe(true)
	expect(shard[1]).toBe("s")
	expect(JSON.stringify(shard)).toBe('"/second/wof/postalcode-us.db"')
})
