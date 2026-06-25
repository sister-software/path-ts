/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { extname } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

test("File with extension", () => {
	const result = extname("file.txt")

	expectTypeOf(result).toEqualTypeOf<".txt">()
})

test("File without extension", () => {
	const result = extname("file")

	expect(result).toBe("")

	expectTypeOf(result).toEqualTypeOf<"">()
})

test("File with multiple extensions", () => {
	const result = extname("file.tar.gz")

	expect(result).toBe(".gz")

	expectTypeOf(result).toEqualTypeOf<".gz">()
})

test("File with multiple extensions and no base name", () => {
	const result = extname(".tar.gz")

	expect(result).toBe(".gz")

	expectTypeOf(result).toEqualTypeOf<".gz">()
})

test("File with path", () => {
	const result = extname("path/to/file.txt")

	expect(result).toBe(".txt")

	expectTypeOf(result).toEqualTypeOf<".txt">()
})

test("File with path and multiple extensions", () => {
	const result = extname("path/to/file.tar.gz")

	expect(result).toBe(".gz")

	expectTypeOf(result).toEqualTypeOf<".gz">()
})

test("Dotfile has no extension", () => {
	const result = extname(".gitignore")

	expect(result, "A leading-dot dotfile has no extension").toBe("")

	expectTypeOf(result).toEqualTypeOf<"">()
})

test("Dotfile within a directory has no extension", () => {
	const result = extname("path/to/.env")

	expect(result).toBe("")

	expectTypeOf(result).toEqualTypeOf<"">()
})

test("Trailing dot yields a single-dot extension", () => {
	const result = extname("file.")

	expect(result).toBe(".")

	expectTypeOf(result).toEqualTypeOf<".">()
})
