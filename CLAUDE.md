# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`path-ts` is an isomorphic, type-safe wrapper around Node's `path` module. Each utility computes its result **at the type level** (via template-literal types) in lockstep with the runtime value, so `join("foo", "bar")` is typed as the literal `"foo/bar"`, `basename("/a/b.txt")` as `"b.txt"`, etc. The published package is consumed via subpath exports (`path-ts/join`, `path-ts/basename`, …) that map to compiled files in `out/`.

## Commands

Package manager is **Yarn 4 (Berry)** with the `node-modules` linker — use `yarn`, not `npm`.

- `yarn compile` — build with `tsc -b` (uses raised `--max-old-space-size` because the recursive types are memory-hungry). Build mode (`-b`) is required because the config sets `composite: true`. Emits `.js` + `.d.ts` + source/declaration maps to `out/`.
- `yarn check-types` — type-check the whole project (`tsc --build .`) without the memory bump; use this for a quick correctness pass.
- `yarn clean` — `tsc -b --clean`, removes every emitted artifact from `out/` (leaves the now-empty dirs, which is normal `tsc` behavior).
- `yarn test` — run Vitest. **Defaults to watch mode**; use `yarn test run` for a single pass (what CI does).
- `yarn test run test/join.test.ts` — run one test file once.
- `yarn test join` — filter to tests matching a name pattern.
- `yarn lint` / `yarn lint:fix` — Prettier + ESLint (check / autofix). Prettier owns formatting; ESLint owns correctness.
- `yarn release` — `release-it`, publishes to npm.

Notes:

- Type-level assertions (`expectTypeOf`) are checked by Vitest because `typecheck.enabled` is set in `vite.config.ts` — a test can pass its runtime `expect` but still fail on a type mismatch.
- **Known breakage:** the ESLint step (`lint:eslint:check`) currently crashes under ESLint 10 with `react/no-direct-mutation-state: contextOrFilename.getFilename is not a function`. This is an upstream bug in `@sister.software/eslint-config@8.x` (its bundled `eslint-plugin-react` uses an API removed in ESLint 10) and affects the sister `spliterator` repo identically — the fix belongs in the config package, not here. Prettier (`lint:prettier:*`) and `check-types` are unaffected.
- `tsc -b` compiles the **whole project** (`lib/`, `test/`, and `vite.config.ts`) into `out/`, since `tsconfig.json` only excludes `out/` itself. To stop Vitest from re-running the emitted `out/test/*.test.js` copies alongside the `.ts` sources, `vite.config.ts` sets `test.exclude` (covering `out`, `dist`, `examples`, config files) — mirroring the same fix in the sister `spliterator` repo. Only `out/index.*` and `out/lib/**` are actually published (per the package.json `files` field).

## Architecture

**The core convention — every module is a runtime/type pair.** Each `lib/*.ts` file exports both:

1. a thin runtime function that delegates to `node:path` and casts its return with `as any`, and
2. one or more template-literal **types** that mirror that function's behavior at the type level.

Example: `lib/basename.ts` exports the runtime `basename()` (calls `node:path`'s `basename`) and the type `PluckBasename<T>` (computes the result type). The function's signature wires the type to the value:

```ts
export function basename<T extends PathBuilder | string>(
	path: T
): T extends PathBuilder<infer U> ? PathBuilder<PluckBasename<U>> : T extends string ? PluckBasename<T> : never
```

When adding or changing a path utility, you change **both halves** and keep them in agreement — the type is the product, not an afterthought.

**`lib/type-utils.ts` is the foundation.** It defines the recursive primitives every other module builds on: `Join`, `Split`, `WithoutTrailingDelimiter`, `PathDelimiter`, `NullishCoalesce` (portions derived from `type-fest`). Type changes here ripple everywhere.

**Overload pattern.** Public functions (`join`, `resolvePathBuilder`, `basename`, `dirname`, …) are overloaded to accept _either_ a `PathBuilder<S>` or a plain string, and return the corresponding kind (a `PathBuilder<…>` in, a `PathBuilder<…>` out; a string in, a typed string out). The implementation signature uses conditional types to unify the two.

**`lib/path-builder.ts` — the `PathBuilder` class** is the most intricate piece. It is simultaneously:

- a subclass of `URL`,
- a proxy for `String` methods (copied onto the prototype at module load, bottom of the file),
- **callable as a function** — calling a builder appends segments and returns a new, more-specifically-typed builder. This works through TypeScript declaration merging (an `interface` + a `class` of the same name) plus a runtime `Proxy` in the static `from()` factory.

`kPathBuilder` (a registered symbol) backs a custom `Symbol.hasInstance` so proxied instances still satisfy `instanceof`. `createPathBuilderResolver(absoluteRoot)` / `resolvePathBuilder` (in `lib/resolve.ts`) produce higher-order builders bound to a project/monorepo root alias — see the README for the repo-root and monorepo recipes.

**Entry point.** `index.ts` re-exports every `lib/*` module; the package.json `exports` map also exposes each as a subpath.

## Conventions

- **ESM throughout** (`"type": "module"`). Relative imports in `.ts` source use the **`.js` extension** (e.g. `import type { Join } from "./type-utils.js"`) — required by the `module`/`moduleResolution: "nodenext"` setup; do not drop it. The base config also enables `verbatimModuleSyntax`, so **type-only imports must use `import type`** (or inline `type`) — a plain `import` of something used only as a type fails to compile.
- Compiler options are inherited from `@sister.software/tsconfig` (the local `tsconfig.json` only adds the `out/` exclude). Key inherited flags: `target`/`lib` `ESNext`, `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, `verbatimModuleSyntax`, `composite` + `incremental` + `declarationMap` + `sourceMap`, `outDir: out`. `strict` + `noUncheckedIndexedAccess` mean indexed access is `T | undefined` — note the `!` assertions in tests.
- **Tabs** for indentation (see `.editorconfig`).
- Tests import from the package name `"path-ts"` (a self-reference), not relative paths, and assert both runtime values (`expect`) and types (`expectTypeOf`).
- Every source file carries the Sister Software MIT license header; ESLint enforces it (via the `headers/header-format` rule, driven by `spdxLicenseIdentifier` in `eslint.config.mjs`).
