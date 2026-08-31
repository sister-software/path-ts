/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import { posix } from "node:path"

import type { PathBuilder, UnwrapPathBuilder } from "./path-builder.js"
import type { IsAbsolute, Join, Resolve, Split } from "./type-utils.js"

/**
 * Drop the segments two absolute paths share, from the left.
 */
type StripCommonPrefix<A extends string[], B extends string[]> = A extends [infer AH, ...infer AT extends string[]]
	? B extends [infer BH, ...infer BT extends string[]]
		? [AH, BH] extends [BH, AH]
			? StripCommonPrefix<AT, BT>
			: [A, B]
		: [A, B]
	: [A, B]

/**
 * One `..` per segment.
 */
type ParentSteps<Segments extends string[], Steps extends string[] = []> = Segments extends [
	infer _,
	...infer Rest extends string[],
]
	? ParentSteps<Rest, [...Steps, ".."]>
	: Steps

/**
 * The relative path from `From` to `To`, e.g. `Relative<"/a/b", "/a/c/d">` is `"../c/d"`. Only two absolute paths have
 * a literal answer — a relative input is resolved against the current working directory at runtime, which the type
 * cannot know — so anything else is `string`.
 */
export type Relative<From extends string, To extends string> = string extends From | To
	? string
	: [IsAbsolute<From>, IsAbsolute<To>] extends [true, true]
		? StripCommonPrefix<Split<Resolve<From>, "/">, Split<Resolve<To>, "/">> extends [
				infer F extends string[],
				infer T extends string[],
			]
			? Join<[...ParentSteps<F>, ...T], "/">
			: never
		: string

/**
 * The relative path from `from` to `to`. Similar to `node:path`'s `relative`: an empty string when both name the same
 * location, and `..` steps up out of `from` as far as the paths diverge.
 *
 * @returns The relative path, typed as its literal when both inputs are absolute literals.
 * @throws {TypeError} If either path is not a string or {@linkcode PathBuilder}.
 */
export function relative<From extends PathBuilder | string, To extends PathBuilder | string>(
	from: From,
	to: To
): Relative<UnwrapPathBuilder<From>, UnwrapPathBuilder<To>> {
	return posix.relative(from.toString(), to.toString()) as any
}

export default relative
