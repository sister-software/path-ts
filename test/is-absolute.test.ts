/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { isAbsolute, PathBuilder } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

test("a leading slash is absolute", () => {
	const result = isAbsolute("/a/b")

	expect(result).toBe(true)

	expectTypeOf(result).toEqualTypeOf<true>()
})

test("a bare name is relative", () => {
	const result = isAbsolute("a/b")

	expect(result).toBe(false)

	expectTypeOf(result).toEqualTypeOf<false>()
})

test("a path builder is read like its string", () => {
	expect(isAbsolute(PathBuilder.from("/a"))).toBe(true)
})

test("a plain string answers boolean", () => {
	const path: string = "/a"

	expectTypeOf(isAbsolute(path)).toEqualTypeOf<boolean>()
})

test("a Windows drive letter is not a root here", () => {
	expect(isAbsolute("C:\\a")).toBe(false)
})
