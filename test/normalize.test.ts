/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { join, type Normalize } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

test("join resolves parent segments", () => {
	const result = join("a", "..", "b")

	expect(result).toBe("b")

	expectTypeOf(result).toEqualTypeOf<"b">()
})

test("join drops current-directory segments", () => {
	const result = join("a", ".", "b")

	expect(result).toBe("a/b")

	expectTypeOf(result).toEqualTypeOf<"a/b">()
})

test("join collapses empty segments", () => {
	const result = join("a", "", "b")

	expect(result).toBe("a/b")

	expectTypeOf(result).toEqualTypeOf<"a/b">()
})

test("join resolves parent segments against an absolute root", () => {
	const result = join("/root", "..", "sub")

	expect(result).toBe("/sub")

	expectTypeOf(result).toEqualTypeOf<"/sub">()
})

test("join keeps leading parent segments on relative paths", () => {
	const result = join("a/b", "../../..")

	expect(result).toBe("..")

	expectTypeOf(result).toEqualTypeOf<"..">()
})

test("join preserves a trailing slash, like node:path", () => {
	const result = join("foo", "bar/")

	expect(result).toBe("foo/bar/")

	expectTypeOf(result).toEqualTypeOf<"foo/bar/">()
})

test("Normalize type mirrors POSIX normalization", () => {
	expectTypeOf<Normalize<"a/../b">>().toEqualTypeOf<"b">()
	expectTypeOf<Normalize<"a/./b">>().toEqualTypeOf<"a/b">()
	expectTypeOf<Normalize<"a//b">>().toEqualTypeOf<"a/b">()
	expectTypeOf<Normalize<"/a/../..">>().toEqualTypeOf<"/">()
	expectTypeOf<Normalize<"a/..">>().toEqualTypeOf<".">()
	expectTypeOf<Normalize<"/">>().toEqualTypeOf<"/">()
	expectTypeOf<Normalize<"a/b/c">>().toEqualTypeOf<"a/b/c">()
})
