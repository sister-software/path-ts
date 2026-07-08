# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`resolvePath(...)` and `createPathResolver(root)`** — string-returning siblings of `resolvePathBuilder` / `createPathBuilderResolver`. They resolve to a primitive `string` (branded with the resolved literal type) rather than a `PathBuilder`, so the result drops straight into `node:fs` and other path-string APIs without an explicit `.toString()`. Reach for `PathBuilder` / `resolvePathBuilder` when you need to keep appending across steps; use these at leaf and `fs` boundaries. (A `PathBuilder` is a `String` object, which `node:fs` rejects at runtime, so builders always needed conversion there.)

## [2.0.1]

### Changed

- **Relicensed from AGPL-3.0 to MIT.** `path-ts` is now permissively licensed.
- **POSIX path semantics on every platform.** The runtime now uses `node:path`'s `posix` namespace, so results always use the `/` separator on Windows and in the browser, matching the always-`/` literal types. Windows callers that relied on `\` separators should use `node:path.win32` directly.
- **`PathBuilder` is backed by a plain string instead of `URL`.** It no longer percent-encodes its contents (`/foo bar` stays `/foo bar`, not `/foo%20bar`) or truncates at `#`/`?` (`/a/b#c` stays `/a/b#c`). It extends `String`, so it keeps the full string method surface and `instanceof` support.

### Fixed

- `join` types now normalize: `join("a", "..", "b")` types as `"b"` instead of `"a/../b"`, with `.`, `..`, repeated slashes, and trailing slashes handled exactly as `node:path` does.
- `dirname` types are sound for roots and top-level paths: `dirname("/foo")` → `"/"`, `dirname("/")` → `"/"`, `dirname("foo")` → `"."` (previously all `""`).
- `extname` types are sound for dotfiles: `.gitignore` and `path/to/.env` type as `""` (previously `".gitignore"` / `".env"`), and the type now reduces to the basename first.
- `PathBuilder` and `resolve` result types are normalized: `PathBuilder.from("/foo/bar")("..")` types as `PathBuilder<"/foo">`.
- Build emits runnable JavaScript again under `@sister.software/tsconfig` 8.x (which defaults to declaration-only output).

### Added

- `Normalize<S>` and `Resolve<S>` type utilities (the type-level analogs of `node:path.normalize` and `node:path.resolve`), plus `IsAbsolute<S>`.

### Tooling

- Modernized dev dependencies (TypeScript 6, ESLint 10, Vitest 4, `@sister.software/*` 8.x).
- Added `check-types` and `clean` scripts; excluded the compiled `out/` copies from the Vitest run.
- Bumped the minimum supported Node.js to 18.
