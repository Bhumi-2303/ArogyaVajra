#!/usr/bin/env python3
"""ArogyaVajra Enforceable Ruff Lint Gate.

Enforces zero lint violations on newly changed or added Python files,
prevents any new lint violations across the codebase, and ratchets
against the documented legacy baseline.
"""

import json
import logging
import os
import subprocess
import sys
from pathlib import Path

logger = logging.getLogger("lint_gate")


def get_git_modified_files(api_root: Path) -> list[str]:
    """Identify Python files modified in current branch, commit, or working tree."""
    modified_files = set()

    try:
        root_res = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=api_root,
            capture_output=True,
            text=True,
            check=False,
        )
        repo_root = Path(root_res.stdout.strip()) if root_res.returncode == 0 else api_root
    except (subprocess.SubprocessError, OSError):
        repo_root = api_root

    # 1. Check uncommitted / staged working tree changes
    try:
        status_res = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=api_root,
            capture_output=True,
            text=True,
            check=False,
        )
        for line in status_res.stdout.splitlines():
            if len(line) > 3:
                filepath = line[3:].strip().split(" -> ")[-1]
                if filepath.endswith(".py"):
                    full_path = (repo_root / filepath).resolve()
                    if full_path.exists() and full_path.is_relative_to(api_root):
                        modified_files.add(os.path.relpath(full_path, api_root))
    except (subprocess.SubprocessError, OSError) as err:
        logger.debug("Could not read git status: %s", err)

    # 2. Check diff against origin/main or HEAD~1
    diff_targets = ["origin/main...HEAD", "HEAD~1...HEAD"]
    for target in diff_targets:
        try:
            diff_res = subprocess.run(
                ["git", "diff", "--name-only", target],
                cwd=api_root,
                capture_output=True,
                text=True,
                check=False,
            )
            if diff_res.returncode == 0 and diff_res.stdout.strip():
                for line in diff_res.stdout.splitlines():
                    filepath = line.strip()
                    if filepath.endswith(".py"):
                        full_path = (repo_root / filepath).resolve()
                        if full_path.exists() and full_path.is_relative_to(api_root):
                            modified_files.add(os.path.relpath(full_path, api_root))
                break
        except (subprocess.SubprocessError, OSError) as err:
            logger.debug("Could not read git diff target %s: %s", target, err)

    return sorted(modified_files)


def main() -> int:
    api_root = Path(__file__).resolve().parent.parent
    baseline_path = api_root / ".ruff-baseline.json"

    print("=" * 60)
    print("       Arogyavajra Enforceable Ruff Lint Gate")
    print("=" * 60)

    if not baseline_path.exists():
        print(f"ERROR: Baseline file not found: {baseline_path}")
        return 1

    with open(baseline_path, "r", encoding="utf-8") as f:
        baseline_items = json.load(f)

    baseline_signatures = {
        (item["filename"], item["code"], item.get("line")) for item in baseline_items
    }
    baseline_ceiling = len(baseline_items)
    print(f"Recorded legacy baseline: {baseline_ceiling} findings in backlog.")

    # 1. Run ruff on entire codebase
    ruff_bin = sys.executable.replace("python", "ruff")
    if not os.path.exists(ruff_bin):
        ruff_bin = "ruff"

    ruff_res = subprocess.run(
        [ruff_bin, "check", ".", "--output-format", "json"],
        cwd=api_root,
        capture_output=True,
        text=True,
        check=False,
    )

    try:
        current_findings = json.loads(ruff_res.stdout)
    except json.JSONDecodeError:
        print(f"ERROR: Failed to parse Ruff JSON output:\n{ruff_res.stderr or ruff_res.stdout}")
        return 1

    current_count = len(current_findings)
    print(f"Current total repository findings: {current_count}")

    # 2. Check for ratchet regression (ceiling violation)
    if current_count > baseline_ceiling:
        print(
            f"\n[FAIL] Ratchet violation: Total findings ({current_count}) "
            f"exceed baseline ceiling ({baseline_ceiling}) by {current_count - baseline_ceiling}."
        )
        return 1

    # 3. Check for any brand new violations not in baseline
    new_violations = []
    for item in current_findings:
        rel_filename = os.path.relpath(item["filename"], api_root)
        sig = (rel_filename, item["code"], item["location"]["row"])
        if sig not in baseline_signatures:
            file_code_sigs = {(f, c) for f, c, _ in baseline_signatures}
            if (rel_filename, item["code"]) not in file_code_sigs:
                new_violations.append((rel_filename, item))

    if new_violations:
        print(f"\n[FAIL] Detected {len(new_violations)} NEW lint violation(s):")
        for fn, v in new_violations:
            loc = v["location"]
            print(f"  - {fn}:{loc['row']}:{loc['column']}: {v['code']} {v['message']}")
        return 1

    # 4. Check all git modified/added files strictly
    modified_files = get_git_modified_files(api_root)
    if modified_files:
        print(f"\nVerifying {len(modified_files)} modified Python file(s) strictly:")
        for mf in modified_files:
            print(f"  • {mf}")
        mod_check = subprocess.run(
            [ruff_bin, "check", *modified_files],
            cwd=api_root,
            capture_output=True,
            text=True,
            check=False,
        )
        if mod_check.returncode != 0:
            print("\n[FAIL] Modified files failed strict Ruff check:")
            print(mod_check.stdout or mod_check.stderr)
            return 1
        print("  ✓ All modified files passed strict Ruff inspection.")
    else:
        print("\nNo modified Python files detected in current context.")

    # 5. Success summary
    if current_count < baseline_ceiling:
        print(f"\n✓ Backlog improved: {baseline_ceiling - current_count} legacy issues resolved!")
    print("\n✓ Lint gate passed: zero new violations, modified files clean, within baseline ceiling.")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
