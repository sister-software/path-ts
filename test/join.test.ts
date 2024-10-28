/**
 * @copyright Sister Software
 * @license AGPL-3.0
 * @author Teffen Ellis, et al.
 */

import { join, PathBuilder } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

test("Join paths", () => {
	const result = join("path", "to", "file")

	expect(result).toBe("path/to/file")

	const resultBuilder = PathBuilder.from(result)

	expect(resultBuilder).toBeInstanceOf(PathBuilder)
	expectTypeOf(resultBuilder).toEqualTypeOf<PathBuilder<"path/to/file">>()
})

test("Join paths with leading slash", () => {
	const result = join("/root", "to", "file")

	expect(result.toString()).toBe("/root/to/file")

	const resultBuilder = PathBuilder.from(result)

	expect(resultBuilder).toBeInstanceOf(PathBuilder)
	expectTypeOf(resultBuilder).toEqualTypeOf<PathBuilder<"/root/to/file">>()
})
