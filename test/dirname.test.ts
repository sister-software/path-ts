/**
 * @copyright Sister Software
 * @license AGPL-3.0
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
