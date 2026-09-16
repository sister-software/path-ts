/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import {
	basename,
	dirname,
	extname,
	format,
	isAbsolute,
	join,
	normalize,
	parse,
	PathBuilder,
	relative,
	resolvePath,
} from "path-ts"

const path = join("assets", "logo.svg")
const builder = PathBuilder.from("/assets")("logo.svg")

console.log(
	basename(builder),
	dirname(builder),
	extname(path),
	format(parse(path)),
	isAbsolute(builder),
	normalize("assets/../assets/logo.svg"),
	relative("/assets", builder),
	resolvePath("/assets", "logo.svg")
)
