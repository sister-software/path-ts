/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { format, parse } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

test("parse uses POSIX fields for paths without a directory or root", () => {
	const bare = parse("file.txt")
	const driveLike = parse("C:/file.txt")

	expect(bare).toMatchObject({ root: "", dir: "", base: "file.txt", name: "file", ext: ".txt" })
	expect(driveLike.root).toBe("")
	expectTypeOf(bare.dir).toEqualTypeOf<"">()
	expectTypeOf(driveLike.root).toEqualTypeOf<"">()
})

test("parse preserves a dotfile name", () => {
	const result = parse(".gitignore")

	expect(result).toMatchObject({ name: ".gitignore", ext: "" })
	expectTypeOf(result.name).toEqualTypeOf<".gitignore">()
})

test("format reconstructs parsed absolute and relative paths", () => {
	const absolute = format(parse("/foo"))
	const relative = format(parse("foo"))

	expect(absolute).toBe("/foo")
	expect(relative).toBe("foo")
	expectTypeOf(absolute).toEqualTypeOf<"/foo">()
	expectTypeOf(relative).toEqualTypeOf<"foo">()
})
