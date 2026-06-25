# What is Path TS?

`path-ts` extends Node's `path` module with type safety.

```ts
import { join, ext, parse, basename, dirname } from "path-ts"

const path = join("foo", "bar", "baz") // 'foo/bar/baz'

const dir = dirname("foo/bar/baz.txt") // 'foo/bar'

const base = basename("foo/bar/baz.txt") // 'baz.txt'

const ext = extname("foo/bar/baz.txt") // '.txt'

const parsed = parse("/foo/bar/baz.txt")

parsed.root // '/'
parsed.dir // '/foo/bar'
parsed.base // 'baz.txt'
parsed.ext // '.txt'
parsed.name // 'baz'
```

[![npm version](https://img.shields.io/npm/v/path-ts.svg)](https://www.npmjs.com/package/path-ts)

# Installation

```bash
yarn add path-ts
# or
npm install path-ts
```

When configuring TypeScript, you'll have better results if you enable `strict` mode in your `tsconfig.json`:

```json
{
	"compilerOptions": {
		"strict": true
	}
}
```

## POSIX semantics everywhere

`path-ts` uses POSIX path semantics (the `/` separator) on every platform, including Windows and the browser. This is what lets the literal types — which are always `/`-based — match the runtime everywhere. If you need Windows (`\`) semantics, use Node's built-in `path.win32` directly.

## Browser Usage

`path-ts` depends on Node's built-in `path` module, however it can be polyfilled in a browser in ESBuild or Webpack allowing you to use the same type-safe path utilities in both the browser and Node.

# Path Builder API

`path-ts` provides a fluent API for building _absolute_ paths. This is useful when you want to build paths dynamically.

```ts
import { PathBuilder } from "path-ts"

const builder = PathBuilder.from("/foo")

// Builders act like immutable strings that can be appended by calling them like functions...
const childBuilder = builder("bar")
console.log(childBuilder.toString()) // '/foo/bar'
```

## Repo relative paths

Path Builders can be used to create type-safe path aliases relative to the root of your project:

```ts
import { PathBuilder, Join } from "path-ts"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"

/**
 * Aliased path to the root of the repository.
 */
export type RepoRootAlias = "@your-namespace/repo-root"

/**
 * Compiled directory name for TS output files.
 */
export const OutDirectoryName = "out"
export type OutDirectoryName = typeof OutDirectoryName

/**
 * The directory path of the current file, post-compilation.
 */
const __dirname = dirname(fileURLToPath(import.meta.url)) as Join<[RepoRootAlias, ...OutDirectoryName], "/">

/**
 * The absolute path to the root of the repository.
 */
const RepoRootAbsolutePath = resolve(__dirname, ...PathReflection.map(() => ".."))
type RepoRootAbsolutePath = RepoRootAlias

/**
 * Path builder relative to the repo root.
 */
export const repoRootPathBuilder = createPathBuilderResolver<RepoRootAlias>(RepoRootAbsolutePath)
```

### Usage

You can then build paths relative to the root of your project in a type-safe way:

```ts
import { repoRootPathBuilder } from "@your-namespace/repo-root"

const path = repoRootPathBuilder("src", "index.ts") // `@your-namespace/repo-root/src/index.ts`
```

## Mono-Repo Path Builders

You can create higher-order path builders that are specific to a certain directory in a monorepo:

```ts
type MonoRepoPackageName = "package-1" | "package-2"

/**
 * Path builder relative to a specific package's output directory.
 */
export function packageOutPathBuilder<P extends MonoRepoPackageName, S extends string[]>(
	packageName: P,
	...pathSegments: S
): PathBuilder<Join<[RepoRootAlias, P, OutDirectoryName, ...S], "/">> & string {
	return packagePathBuilder(packageName, OutDirectoryName, ...pathSegments)
}
```

# Limitations

`path-ts` is honest about where the type-level model and the runtime can drift:

- **POSIX only.** Types and runtime both assume `/`. Windows (`\`) paths are treated as ordinary characters, not separators. Use `node:path.win32` if you need Windows semantics.
- **`PathBuilder.from` does not model the current working directory.** At runtime it resolves relative inputs against `process.cwd()`, but the type cannot know the cwd, so the type of `PathBuilder.from("relative")` stays relative. To get a sound absolute type, start from an absolute path or use `createPathBuilderResolver` with a bound root.
- **Very long paths.** The recursive normalization types are bounded by the TypeScript instantiation-depth limit. Realistic paths are fine; pathological inputs fall back to `string`.
- **`parse().name` for dotfiles.** `extname` correctly returns `""` for dotfiles like `.gitignore`, but the `name` field of `parse()` does not yet special-case the leading dot.

# License

`path-ts` is licensed under the MIT license. See [LICENSE.md](./LICENSE.md) for the full text.
