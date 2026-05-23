# env-doctor Roadmap

Last updated: May 23, 2026

## Current Baseline

env-doctor is a TypeScript CLI that compares `.env.example` with a local `.env`, prompts for missing or empty values, and appends replacements without rewriting unrelated keys.

Recent repository fixes:

- PR #1 fixed the out-of-sync `package-lock.json` and cleared the high-severity `picomatch` audit finding.
- PR #2 added core tests and fixed `.env` writes so values containing `#`, leading or trailing spaces, multiline content, or embedded double quotes round-trip through `dotenv`.
- PR #3 added package publish controls so `npm pack` builds first and ships only runtime files.
- PR #4 added GitHub Actions CI for clean install, tests, typecheck, build, audit, and package dry-run.
- PR #6 updated the CI workflow to current `actions/checkout` and `actions/setup-node` major versions after GitHub reported a Node.js 20 action-runtime deprecation warning.

The current verification set is:

- `npm ci`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `npm audit --audit-level=moderate`
- `npm pack --dry-run`

## Roadmap

### 1. Make CLI Behavior Scriptable

Problem: env-doctor is interactive only. That is useful for local onboarding, but it cannot be used as a CI guard or preflight check without hanging on prompts.

Proposed work:

- Add `--check` to report missing or empty variables and exit non-zero without modifying files.
- Add `--json` for machine-readable output containing `missingKeys`, `emptyValues`, `envPath`, and `examplePath`.
- Add `--no-create` so callers can fail when the target `.env` file is absent instead of creating it.

Primary files:

- `src/index.ts`
- `src/core.ts`
- `src/ui.ts`
- `test/core.test.cjs`
- Add CLI integration tests under `test/cli.test.cjs`

Acceptance criteria:

- `env-doctor --check` exits `0` when the env file is healthy.
- `env-doctor --check` exits non-zero and prints missing or empty keys when the env file is unhealthy.
- `env-doctor --check --json` emits parseable JSON and does not print interactive UI.
- Existing interactive behavior remains unchanged when these flags are not passed.

### 2. Improve Error Handling and Validation

Problem: file read and write failures currently fall into a generic unexpected-error path, and unsafe values containing both single and double quotes are rejected by core logic without a user-facing explanation.

Proposed work:

- Return typed file results from `parseEnvFile` instead of `EnvVariables | null`.
- Distinguish missing file, unreadable file, parse failure, and unsafe write failure in CLI output.
- Validate option paths before creating or reading files.
- Add tests for directories, permission failures where feasible, malformed paths, and unsafe quote combinations.

Primary files:

- `src/core.ts`
- `src/index.ts`
- `src/ui.ts`
- `test/core.test.cjs`
- `test/cli.test.cjs`

Acceptance criteria:

- Each known failure mode produces a concise actionable message.
- The process exits with stable status codes for healthy, unhealthy, user-cancelled, and internal-error outcomes.
- Tests cover both core behavior and CLI-level messages.

### 3. Add Release Automation

Problem: the package is publishable, but releases are still manual and the CLI version is hard-coded in `src/index.ts`.

Proposed work:

- Read the CLI version from `package.json` at runtime or inject it at build time.
- Add a release workflow that runs CI, creates provenance-ready package output, and publishes only from tags.
- Add a changelog or release notes workflow so shipped fixes and features are discoverable.
- Fill in package metadata such as `author`, `repository`, `bugs`, `homepage`, and `engines`.

Primary files:

- `package.json`
- `src/index.ts`
- `.github/workflows/ci.yml`
- Add `.github/workflows/release.yml`
- Add `CHANGELOG.md`

Acceptance criteria:

- `env-doctor --version` matches `package.json`.
- Publishing is gated by CI and cannot run from arbitrary branches.
- `npm pack --dry-run` remains clean with only runtime package contents.

### 4. Support Real-World Env Templates

Problem: `.env.example` files often include comments, grouping, optional variables, placeholders, and validation hints. env-doctor currently treats every parsed key as required.

Proposed work:

- Preserve template order when prompting and appending values.
- Support optional keys with a documented convention, such as `# optional`.
- Display example placeholder values without accidentally treating them as valid local secrets.
- Add basic value validators for common shapes, such as URL, boolean, number, and non-empty string.

Primary files:

- `src/core.ts`
- `src/ui.ts`
- `README.md`
- `test/core.test.cjs`

Acceptance criteria:

- Required and optional variables are distinguished deterministically.
- Prompt order matches `.env.example` order.
- Validation failures are explainable and do not write partial invalid output.

### 5. Tighten Developer Experience

Problem: the repo now has tests and CI, but contributor workflows can still drift because formatting and linting conventions are implicit.

Proposed work:

- Add a formatter and lint command.
- Remove unused imports in `src/ui.ts`.
- Document contributor commands in `README.md`.
- Add examples for common flows: `.env.local`, CI check mode, and package publish dry-run.

Primary files:

- `package.json`
- `src/ui.ts`
- `README.md`
- `.github/workflows/ci.yml`

Acceptance criteria:

- CI runs formatting or lint checks.
- The README lists the same verification commands as CI.
- New contributors can run one command sequence to install, test, build, and package-check the project.

## Suggested Sequencing

1. Ship scriptable CLI mode first because it unlocks CI and pre-commit usage for consumers.
2. Follow with error handling because non-interactive usage needs stable messages and exit codes.
3. Add release automation once package metadata and version handling are reliable.
4. Expand template intelligence after the CLI contract is stable.
5. Keep developer-experience cleanup continuous and low-risk.
