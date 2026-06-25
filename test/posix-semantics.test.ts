/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { basename, dirname, extname, join } from "path-ts"
import { expect, test } from "vitest"

// path-ts uses POSIX path semantics on every platform so that the always-"/" types match the
// runtime everywhere (including Windows and the browser). On a POSIX host these assertions also
// hold for the platform default, so they act as a regression guard against reintroducing the
// platform-dependent `node:path` runtime.

test("the forward slash is the only separator", () => {
	expect(join("a", "b", "c")).toBe("a/b/c")
})

test("backslashes are treated as ordinary path characters, not separators", () => {
	expect(basename("a\\b\\c")).toBe("a\\b\\c")
	expect(dirname("a\\b\\c")).toBe(".")
	expect(extname("file\\name.txt")).toBe(".txt")
})

test("a Windows drive-style path is not split on backslashes", () => {
	expect(basename("C:\\Users\\file.txt")).toBe("C:\\Users\\file.txt")
})
