/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { createPathResolver, resolvePath } from "path-ts"
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
