/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { basename } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

test("Relative path", () => {
	const result = basename("relative/path/to/file")

	expect(result).toBe("file")

	expectTypeOf(result).toEqualTypeOf<"file">()
})

test("Relative path with trailing slash", () => {
	const result = basename("relative/path/to/file/trailing-slash/")

	expect(result, "Trailing slash is removed").toBe("trailing-slash")

	expectTypeOf(result).toEqualTypeOf<"trailing-slash">()
})

test("Absolute path", () => {
	const result = basename("/absolute/path/to/file")

	expect(result, "File name is plucked out of absolute path").toBe("file")

	expectTypeOf(result).toEqualTypeOf<"file">()
})

test("Absolute path with trailing slash", () => {
	const result = basename("/absolute/path/to/file/trailing-slash/")

	expect(result, "Trailing slash is omitted").toBe("trailing-slash")

	expectTypeOf(result).toEqualTypeOf<"trailing-slash">()
})

test("Empty path", () => {
	const result = basename("")

	expect(result).toBe("")

	expectTypeOf(result).toEqualTypeOf<"">()
})

test("a suffix is removed from the name", () => {
	const result = basename("path/to/file.txt", ".txt")

	expect(result).toBe("file")

	expectTypeOf(result).toEqualTypeOf<"file">()
})

test("a suffix the name does not end with is left alone", () => {
	const result = basename("path/to/file.txt", ".md")

	expect(result).toBe("file.txt")

	expectTypeOf(result).toEqualTypeOf<"file.txt">()
})

test("a plain-string suffix answers string", () => {
	const suffix: string = ".txt"

	expectTypeOf(basename("path/to/file.txt", suffix)).toEqualTypeOf<string>()
})
