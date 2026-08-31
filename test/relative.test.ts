/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { PathBuilder, relative } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

test("sibling directories", () => {
	const result = relative("/a/b", "/a/c/d")

	expect(result).toBe("../c/d")

	expectTypeOf(result).toEqualTypeOf<"../c/d">()
})

test("descendant", () => {
	const result = relative("/a", "/a/b/c")

	expect(result).toBe("b/c")

	expectTypeOf(result).toEqualTypeOf<"b/c">()
})

test("ancestor", () => {
	const result = relative("/a/b/c", "/a")

	expect(result).toBe("../..")

	expectTypeOf(result).toEqualTypeOf<"../..">()
})

test("the same location is the empty string", () => {
	const result = relative("/a/b", "/a/b")

	expect(result).toBe("")

	expectTypeOf(result).toEqualTypeOf<"">()
})

test("unnormalized inputs are folded first", () => {
	const result = relative("/a/b/../b/", "/a/./c")

	expect(result).toBe("../c")

	expectTypeOf(result).toEqualTypeOf<"../c">()
})

test("a path builder is read like its string", () => {
	const result = relative(PathBuilder.from("/a/b"), "/a/c")

	expect(result).toBe("../c")

	expectTypeOf(result).toEqualTypeOf<"../c">()
})

test("a relative input has no literal answer", () => {
	const from: string = "a"
	const result = relative(from, "/a/b")

	expectTypeOf(result).toEqualTypeOf<string>()

	expectTypeOf(relative("a", "/a/b")).toEqualTypeOf<string>()
})
