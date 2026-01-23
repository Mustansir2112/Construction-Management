# Merge Conflict Resolution Guide

## Current Status
Git shows merge conflicts for files that were moved from `components/worker/` to `components/workers/` (plural).

## Files in Conflict
- `components/engineer/attendance-marker.tsx` (conflicted - should not exist)
- `components/engineer/online-status-warning.tsx` (conflicted - should not exist)

## Actual File Locations (Correct)
- `components/workers/attendance-marker.tsx` ✅ (exists and is used)
- `components/workers/online-status-warning.tsx` ✅ (exists and is used)

## Resolution Steps

### Option 1: Manual Git Resolution (Recommended)
```bash
# Remove conflicted files from git index
git rm --cached components/engineer/attendance-marker.tsx
git rm --cached components/engineer/online-status-warning.tsx

# Ensure workers directory files are tracked
git add components/workers/attendance-marker.tsx
git add components/workers/online-status-warning.tsx

# Mark conflicts as resolved
git add components/engineer/attendance-marker.tsx components/engineer/online-status-warning.tsx

# Complete the merge
git commit -m "Resolve merge conflicts: attendance components in workers/ directory"
```

### Option 2: Accept Current State
```bash
# Accept that files are in workers/ directory
git add components/workers/
git rm components/engineer/attendance-marker.tsx components/engineer/online-status-warning.tsx
git commit -m "Resolve merge: use workers/ directory for attendance components"
```

## Current Import Status
All imports in `app/construction-worker/worker.tsx` are correct:
- `@/components/workers/attendance-marker` ✅
- `@/components/workers/online-status-warning` ✅

## No Code Changes Needed
The code is already correct. Only git index needs to be updated.
