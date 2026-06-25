# MIT Relicense Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Relicense `path-ts` from AGPL-3.0 to MIT across every place the license is declared, and align the ESLint header rule so it does not flag a license mismatch.

**Architecture:** The license is declared in five surfaces: `LICENSE.md`, the `package.json` `license` field, the per-file JSDoc header (`@license …`) on 17 source files, the `spdxLicenseIdentifier` option in `eslint.config.mjs` (which drives the `headers/header-format` rule), and the README license section. This plan changes all five consistently. There is no runtime code change.

**Tech Stack:** TypeScript, Yarn 4, ESLint 10 (`@sister.software/eslint-config@8.x`, `eslint-plugin-headers`), Prettier, Vitest.

## Global Constraints

- New license: **MIT** (SPDX identifier `MIT`).
- Copyright line: **`Copyright (c) 2024 Sister Software`** (start year from first commit 2024-10-28; holder matches the existing header `copyrightHolder`). _Confirmed._
- The ESLint header template is fixed by `@sister.software/eslint-config`: `@copyright {copyrightHolder}` / `@license {spdxLicenseIdentifier}` / `@author {author}`. Header lines must read exactly `@license MIT` to match `spdxLicenseIdentifier: "MIT"`.
- `eslint --fix` **cannot** be used to rewrite headers: `lint:eslint:check` currently crashes under ESLint 10 (`react/no-direct-mutation-state: contextOrFilename.getFilename` — upstream bug in the shared config). All header edits are mechanical. The header rule is `warn` severity, so it never fails lint regardless; consistency is the goal.
- Do not work on `main`. Create branch `relicense-mit` first.
- Out of scope (follow-ups, not this plan): publishing a new npm version to make the license visible on the registry, and the eventual package rename.

**The 17 files carrying `@license AGPL-3.0`** (verified via grep):
`eslint.config.mjs`, `index.ts`, `vite.config.ts`, `lib/{basename,dirname,extname,format,join,parse,path-builder,resolve,type-utils}.ts`, `test/{basename,dirname,extname,join,path-builder}.test.ts`

---

### Task 1: Branch + relicense the declared license (LICENSE.md, package.json, .prettierignore)

**Files:**

- Modify: `.prettierignore` (broaden license ignore so Prettier never reformats the license file)
- Replace: `LICENSE.md` (AGPL full text → MIT text)
- Modify: `package.json:19` (`"license"` field)

**Interfaces:**

- Consumes: nothing (first task).
- Produces: a repo whose declared license is MIT; later tasks make the headers/README agree.

- [ ] **Step 1: Create the working branch**

```bash
git checkout -b relicense-mit
```

- [ ] **Step 2: Broaden the Prettier license ignore so the new LICENSE.md is never reformatted**

In `.prettierignore`, change the line `**/LICENSE` to `**/LICENSE*` (under the `## Static Files` heading). This makes the ignore cover `LICENSE.md`, not just a bare `LICENSE` file.

- [ ] **Step 3: Replace `LICENSE.md` with the MIT license**

Overwrite the entire file with exactly:

```text
MIT License

Copyright (c) 2024 Sister Software

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 4: Update the `package.json` license field**

Change `"license": "AGPL-3.0-only",` to `"license": "MIT",`.

- [ ] **Step 5: Verify the declared license is MIT and nothing else broke**

Run:

```bash
grep -n '"license"' package.json
head -3 LICENSE.md
grep -n 'LICENSE' .prettierignore
```

Expected: license field shows `"MIT"`; `LICENSE.md` first line is `MIT License`; `.prettierignore` shows `**/LICENSE*`.

- [ ] **Step 6: Commit**

```bash
git add LICENSE.md package.json .prettierignore
git commit -m "Relicense: swap AGPL-3.0 declaration for MIT (LICENSE, package.json)"
```

---

### Task 2: Align all source-file headers and the ESLint header rule

**Files:**

- Modify: all 17 files listed in Global Constraints (each `@license AGPL-3.0` → `@license MIT`)
- Modify: `eslint.config.mjs` (the `spdxLicenseIdentifier` option)

**Interfaces:**

- Consumes: the MIT decision from Task 1.
- Produces: every JSDoc header reads `@license MIT`, and the header rule's `spdxLicenseIdentifier` is `MIT`, so the two agree.

- [ ] **Step 1: Rewrite the `@license` line in all 17 source files**

Run (matches only the JSDoc header line, not the eslint option):

```bash
grep -rl '@license AGPL-3.0' --include='*.ts' --include='*.mjs' . \
  | grep -v node_modules | grep -v '/out/' \
  | xargs sed -i 's|@license AGPL-3.0|@license MIT|'
```

- [ ] **Step 2: Verify every header now says MIT and none say AGPL**

Run:

```bash
grep -rn '@license' --include='*.ts' --include='*.mjs' . | grep -v node_modules | grep -v '/out/' | grep -vc 'MIT'   # expect: 0
grep -rcn '@license MIT' --include='*.ts' --include='*.mjs' . | grep -v node_modules | grep -v '/out/' | grep -v ':0' | wc -l   # expect: 17
```

Expected: first command prints `0` (no non-MIT headers); second prints `17`.

- [ ] **Step 3: Update `spdxLicenseIdentifier` in `eslint.config.mjs`**

In the `createESLintPackageConfig({ ... })` call, change `spdxLicenseIdentifier: "AGPL-3.0",` to `spdxLicenseIdentifier: "MIT",`. (The file's own `@license` header was already fixed by Step 1.)

- [ ] **Step 4: Verify the config and headers agree, and the build/tests are still green**

Run:

```bash
grep -n 'spdxLicenseIdentifier' eslint.config.mjs   # expect: "MIT"
yarn check-types                                     # expect: exit 0
yarn test run                                        # expect: 38 passed, no type errors
yarn lint:prettier:check                             # expect: "All matched files use Prettier code style!"
```

Expected: spdx is `MIT`; type-check passes; 38 tests pass; Prettier clean. (Do not run `yarn lint` — the ESLint step still crashes upstream.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Relicense: update file headers and ESLint header rule to MIT"
```

---

### Task 3: Update the README license section and sweep for stragglers

**Files:**

- Modify: `README.md` (the `# License` section, currently the last section)

**Interfaces:**

- Consumes: the MIT decision from Task 1.
- Produces: user-facing docs that state MIT; a repo with zero remaining AGPL references.

- [ ] **Step 1: Replace the README license section**

Replace the entire existing `# License` section (the AGPL paragraph plus the "commercial usage licensing" paragraph and `hello@sister.software` line) with exactly:

```markdown
# License

`path-ts` is licensed under the MIT license. See [LICENSE.md](./LICENSE.md) for the full text.
```

- [ ] **Step 2: Repo-wide sweep — confirm no AGPL reference survives anywhere**

Run:

```bash
grep -rniE 'agpl|affero' . --include='*.ts' --include='*.mjs' --include='*.json' --include='*.md' \
  | grep -v node_modules | grep -v '/out/' | grep -v 'docs/superpowers/plans'
```

Expected: **no output** (the plan file itself is excluded; everything else is clean).

- [ ] **Step 3: Final verification — full toolchain (minus the known-broken ESLint step)**

Run:

```bash
yarn clean && yarn compile        # expect: exit 0
yarn test run                     # expect: 38 passed, no type errors
yarn lint:prettier:check          # expect: "All matched files use Prettier code style!"
```

Expected: clean build, tests green, Prettier clean.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "Relicense: update README license section to MIT"
```

---

## Definition of Done

- `package.json` `license` = `MIT`; `LICENSE.md` is the MIT text with the agreed copyright line.
- All 17 source headers read `@license MIT`; `eslint.config.mjs` `spdxLicenseIdentifier` = `MIT`.
- README license section points at MIT / `LICENSE.md`.
- Repo-wide `grep -niE 'agpl|affero'` (excluding `node_modules`, `out/`, this plan) returns nothing.
- `yarn compile`, `yarn check-types`, `yarn test run`, and `yarn lint:prettier:check` all pass.
- Three commits on branch `relicense-mit`.

## Known Limitations / Follow-ups (not in this plan)

- The relicense is not visible on npm until a new version is published (`yarn release`). Defer until the rename decision is made, so we don't burn a version on the old name.
- `yarn lint` (the ESLint step) remains broken upstream (`@sister.software/eslint-config@8.x` + ESLint 10). Tracked separately; not a blocker since the header rule is `warn`.
- Package rename is a separate effort to scope after this lands.
