/**
 * @copyright Sister Software
 * @license AGPL-3.0
 * @author Teffen Ellis, et al.
 */

import { PathBuilder } from "path-ts"
import { expect, expectTypeOf, test } from "vitest"

test("Path builder can build children", () => {
	const resultBuilder = PathBuilder.from("/foo")
	expectTypeOf(resultBuilder).toEqualTypeOf<PathBuilder<"/foo">>()

	const resultBuilderChild = resultBuilder("bar", "baz")

	expect(resultBuilderChild.toString(), "Builder child matches").toBe("/foo/bar/baz")
	expectTypeOf(resultBuilderChild).toEqualTypeOf<PathBuilder<"/foo/bar/baz">>()

	const resuiltBuilderGrandchild = resultBuilderChild("qux")

	expect(resuiltBuilderGrandchild.toString(), "Builder child creates grandchild").toBe("/foo/bar/baz/qux")

	expectTypeOf(resuiltBuilderGrandchild).toEqualTypeOf<PathBuilder<"/foo/bar/baz/qux">>()
})

test("Path builder can proxy string methods", () => {
	const args = ["/foo", "bar", "baz"] as const
	const result = PathBuilder.from(...args)

	expect(result.length, "Path builder length matches").toBe(
		args.reduce((acc, _segment, i) => acc + args[i]!.length, 0) + args.length - 1
	)
	expect(result[Symbol.toPrimitive](), "Path builder `Symbol.toPrimitive` proxies").toBe("/foo/bar/baz")
	expect(result.toString(), "Path builder `toString()` proxies").toBe("/foo/bar/baz")
	expect(result[Symbol.toStringTag], "Path builder `Symbol.toStringTag` proxies").toBe("/foo/bar/baz")
})
