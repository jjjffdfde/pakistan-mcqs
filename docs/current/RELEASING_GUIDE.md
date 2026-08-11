# Releasing Guide — Pakistan MCQS Hub (Phase 26)

Deterministic, offline-friendly release automation.

## Version resolution (`scripts/release.cjs`)

Priority:

1. `--tag vX.Y.Z` argument — explicit override
2. First `vX.Y.Z` semver string in `CHANGELOG.md`
3. Deterministic fallback: `0.YYYY.MMDD` (date-based)

## What it produces

```sh
node scripts/release.cjs [--tag v1.4.0]
```

- `release/SHA256SUMS.txt` — SHA-256 over the deployable surface
  (static site: `assets/`, `subjects/`, `chapters/`, `data/`,
  `scripts/`, `db/`, `tests/` + root files)
- `release/version.json` — resolved version + manifest stats
- `docs/phase26_release.json` — full report

Excluded from the manifest: `backup/`, `database/`, `docs/`,
`.claude/`, `kg/`, `pipeline/`, `desktop/`, `android/`, `ai/`,
`release/` itself, and binary file extensions.

## GitHub Release (CI)

`.github/workflows/release.yml`:

- trigger: `workflow_dispatch` (with optional `version` input) or push of a `v*` tag
- computes checksums, writes `release/SHA256SUMS.txt`
- creates a GitHub Release via `softprops/action-gh-release@v2`
  with `files: release/SHA256SUMS.txt`

## Manual checklist

1. `node scripts/fix-format.cjs` && `node scripts/lint.cjs` (0 errors)
2. `node scripts/test.cjs` (34/34)
3. `node scripts/security-audit.cjs` (PASS)
4. `node backup/verify-backup.js` (ok)
5. `node scripts/benchmark.cjs` (no regression)
6. Update `CHANGELOG.md`
7. `node scripts/release.cjs --tag vX.Y.Z`
8. Push tag `vX.Y.Z` (or run workflow_dispatch)

## Checksum use

```sh
sha256sum -c release/SHA256SUMS.txt   # POSIX
Get-FileHash -Algorithm SHA256 <file>  # PowerShell, compare manually
```
