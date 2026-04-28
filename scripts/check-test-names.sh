#!/usr/bin/env bash
set -euo pipefail

# Check that all unit-test it() descriptions follow the 3-part naming convention:
#   When {scenario}, then {expected result}
# Non-compliant patterns: it('should...')  it('returns...')  it('validates...')

ERRORS=0

# Enforce 3-part naming only on files created or significantly modified in this PR.
# Legacy files are grandfathered in to avoid a massive one-time rewrite.
ENFORCED_FILES=(
  "tests/unit/profile-core.test.ts"
  "tests/unit/profile-posts.test.ts"
  "tests/unit/profile-notes.test.ts"
  "tests/unit/post-core.test.ts"
  "tests/unit/post-comments.test.ts"
  "tests/unit/post-reactions.test.ts"
  "tests/unit/post-service.test.ts"
  "tests/unit/comment-service.test.ts"
  "tests/unit/io-ts-validation.test.ts"
  "tests/unit/live-api-validation.test.ts"
  "tests/unit/own-profile-note-with-link.test.ts"
  "tests/unit/entities.test.ts"
)

for file in "${ENFORCED_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    continue
  fi

  # Find lines with it('should...') or it('returns...') or it('validates...')
  # that do NOT contain "When" inside the description.
  matches=$(grep -nE "it\(['\"].*(should|returns|validates)" "$file" | grep -v "When" || true)

  if [[ -n "$matches" ]]; then
    echo "Non-compliant test names in $file:"
    echo "$matches"
    ERRORS=$((ERRORS + 1))
  fi
done

# Also warn about legacy files (non-blocking)
LEGACY_ERRORS=0
while IFS= read -r -d '' file; do
  # Skip already-checked files
  skip=false
  for enforced in "${ENFORCED_FILES[@]}"; do
    if [[ "$file" == "$enforced" ]]; then
      skip=true
      break
    fi
  done
  $skip && continue

  matches=$(grep -nE "it\(['\"].*(should|returns|validates)" "$file" | grep -v "When" || true)
  if [[ -n "$matches" ]]; then
    LEGACY_ERRORS=$((LEGACY_ERRORS + 1))
  fi
done < <(find tests/unit -type f -name '*.test.ts' -print0)

if [[ $ERRORS -gt 0 ]]; then
  echo ""
  echo "Found $ERRORS enforced file(s) with non-compliant test names."
  echo "All it() descriptions must use the format: When {scenario}, then {expected result}"
  exit 1
fi

if [[ $LEGACY_ERRORS -gt 0 ]]; then
  echo "Note: $LEGACY_ERRORS legacy file(s) still use old naming. These are non-blocking."
fi

echo "All enforced unit-test names comply with the 3-part naming convention."
