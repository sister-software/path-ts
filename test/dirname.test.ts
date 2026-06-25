/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { dirname } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

test("Directory path", () => {
	const result = dirname("path/to/file")

	expect(result).toBe("path/to")

	expectTypeOf(result).toEqualTypeOf<"path/to">()
})

test("Directory path with trailing slash", () => {
	const result = dirname("path/to/file/")

	expect(result, "Trailing slash is removed").toBe("path/to")

	expectTypeOf(result).toEqualTypeOf<"path/to">()
})

test("Absolute directory path", () => {
	const result = dirname("/path/to/file")

	expect(result).toBe("/path/to")

	expectTypeOf(result).toEqualTypeOf<"/path/to">()
})

test("Absolute directory path with trailing slash", () => {
	const result = dirname("/path/to/file/")

	expect(result, "Trailing slash is omitted").toBe("/path/to")

	expectTypeOf(result).toEqualTypeOf<"/path/to">()
})

test("Top-level absolute path resolves to root", () => {
	const result = dirname("/foo")

	expect(result, "Parent of a top-level entry is the root").toBe("/")

	expectTypeOf(result).toEqualTypeOf<"/">()
})

test("Root is its own parent", () => {
	const result = dirname("/")

	expect(result).toBe("/")

	expectTypeOf(result).toEqualTypeOf<"/">()
})

test("Single relative segment resolves to current directory", () => {
	const result = dirname("foo")

	expect(result, "Parent of a bare name is the current directory").toBe(".")

	expectTypeOf(result).toEqualTypeOf<".">()
})
