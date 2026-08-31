/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

/**
 * The path-segment separator. `path-ts` uses POSIX semantics on every platform, so this is always `/` — the value the
 * literal types are written against.
 */
export const sep = "/" as const

export type Separator = typeof sep

export default sep
