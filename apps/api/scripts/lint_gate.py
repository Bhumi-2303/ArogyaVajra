#!/usr/bin/env python3
"""Enforce the Arogyavajra Ruff lint baseline.

The gate:
1. Prevents the total number of findings from exceeding the baseline.
2. Prevents findings for any file/rule pair from increasing.
3. Requires changed Python files to pass Ruff without violations.
"""

from __future__ import annotations

import json
import logging
import os
import shutil
import subprocess
import sys
from collections import Counter
from pathlib import Path

logger = logging.getLogger("lint_gate")


def run_command(
    command: list[str],
    cwd: Path,
) -> subprocess.CompletedProcess[str]:
    """Run a command and capture its output."""
    return subprocess.run(
        command,
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )


def get_ruff_command() -> list[str]:
    """Find Ruff without relying on executable-path string replacement."""
    executable = shutil.which("ruff")

    if executable:
        return [executable]

    return [sys.executable, "-m", "ruff"]


def normalize_filename(filename: str, api_root: Path) -> str:
    """Normalize filenames relative to the API directory."""
    path = Path(filename)

    if not path.is_absolute():
        path = api_root / path

    resolved = path.resolve()

    try:
        return resolved.relative_to(api_root.resolve()).as_posix()
    except ValueError:
        raise ValueError(f"File is outside the API directory: {filename}") from None


def load_baseline(path: Path, api_root: Path) -> list[dict[str, str]]:
    """Load and validate the Ruff baseline."""
    if not path.is_file():
        raise FileNotFoundError(f"Baseline file not found: {path}")

    with path.open(encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise TypeError("Ruff baseline must contain a JSON array.")

    validated: list[dict[str, str]] = []

    for index, item in enumerate(data):
        if not isinstance(item, dict):
            raise TypeError(f"Invalid baseline entry at index {index}.")

        filename = item.get("filename")
        code = item.get("code")

        if not isinstance(filename, str):
            raise TypeError(f"Missing filename at baseline entry {index}.")

        if not isinstance(code, str):
            raise TypeError(f"Missing code at baseline entry {index}.")

        validated.append(
            {
                "filename": normalize_filename(filename, api_root),
                "code": code,
            }
        )

    return validated


def get_modified_python_files(api_root: Path) -> list[str]:
    """Collect changed Python files from Git and the working tree."""
    root_result = run_command(
        ["git", "rev-parse", "--show-toplevel"],
        api_root,
    )
    if root_result.returncode != 0:
        raise RuntimeError(
            f"Could not locate Git repository root: {root_result.stderr.strip()}"
        )
    repo_root = Path(root_result.stdout.strip()).resolve()

    base_ref = (
        f"origin/{os.environ['GITHUB_BASE_REF']}"
        if os.environ.get("GITHUB_BASE_REF")
        else "origin/main"
    )

    commands = [
        [
            "git",
            "diff",
            "--name-only",
            "--diff-filter=ACMRTUXB",
            "-z",
            f"{base_ref}...HEAD",
        ],
        [
            "git",
            "diff",
            "--name-only",
            "--diff-filter=ACMRTUXBD",
            "-z",
            "HEAD",
        ],
    ]

    modified: set[str] = set()

    for command in commands:
        result = run_command(command, repo_root)

        if result.returncode != 0:
            logger.debug(
                "Git command unavailable: %s",
                result.stderr.strip(),
            )
            continue

        for filename in result.stdout.split("\0"):
            if not filename.endswith(".py"):
                continue

            try:
                relative = normalize_filename(
                    str(repo_root / filename),
                    api_root,
                )
            except ValueError:
                continue

            if (api_root / relative).is_file():
                modified.add(relative)

    untracked = run_command(
        ["git", "ls-files", "--others", "--exclude-standard", "-z"],
        repo_root,
    )
    if untracked.returncode != 0:
        raise RuntimeError(
            f"Could not list untracked files: {untracked.stderr.strip()}"
        )

    for filename in untracked.stdout.split("\0"):
        if not filename.endswith(".py"):
            continue

        try:
            relative = normalize_filename(str(repo_root / filename), api_root)
        except ValueError:
            continue

        if (api_root / relative).is_file():
            modified.add(relative)

    return sorted(modified)


def get_current_findings(
    ruff_command: list[str],
    api_root: Path,
) -> list[dict]:
    """Run Ruff and return its JSON findings."""
    result = run_command(
        ruff_command + ["check", ".", "--output-format", "json"],
        api_root,
    )

    if result.returncode not in (0, 1):
        raise RuntimeError(
            f"Ruff could not execute correctly.\n{result.stderr or result.stdout}"
        )

    try:
        findings = json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Could not parse Ruff JSON output: {error}") from error

    if not isinstance(findings, list):
        raise TypeError("Ruff JSON output is not an array.")

    return findings


def count_findings(
    findings: list[dict],
    api_root: Path,
) -> Counter[tuple[str, str]]:
    """Count findings by normalized filename and Ruff rule."""
    counts: Counter[tuple[str, str]] = Counter()

    for index, item in enumerate(findings):
        if not isinstance(item, dict):
            raise TypeError(f"Invalid Ruff finding at index {index}.")

        filename = item.get("filename")
        code = item.get("code")

        if not isinstance(filename, str):
            raise TypeError(f"Missing filename in Ruff finding at index {index}.")

        if not isinstance(code, str):
            raise TypeError(f"Missing rule code in Ruff finding at index {index}.")

        normalized = normalize_filename(filename, api_root)
        counts[(normalized, code)] += 1

    return counts


def main() -> int:
    """Run the Ruff baseline and changed-file checks."""
    api_root = Path(__file__).resolve().parent.parent
    baseline_path = api_root / ".ruff-baseline.json"
    ruff_command = get_ruff_command()

    print("=" * 64)
    print("          Arogyavajra Enforceable Ruff Lint Gate")
    print("=" * 64)

    try:
        baseline = load_baseline(baseline_path, api_root)
    except (
        OSError,
        json.JSONDecodeError,
        TypeError,
        ValueError,
    ) as error:
        print(f"[FAIL] Could not load baseline: {error}")
        return 1

    baseline_total = len(baseline)

    baseline_counts = Counter((item["filename"], item["code"]) for item in baseline)

    print(f"Recorded baseline: {baseline_total} findings.")

    try:
        findings = get_current_findings(ruff_command, api_root)
        current_counts = count_findings(findings, api_root)
    except (OSError, RuntimeError, TypeError, ValueError) as error:
        print(f"[FAIL] Could not inspect Ruff findings: {error}")
        return 1

    current_total = len(findings)

    print(f"Current repository findings: {current_total}")

    failures: list[str] = []

    # Check total finding count.
    if current_total > baseline_total:
        failures.append(
            f"Total findings increased from {baseline_total} to {current_total}."
        )

    # Check individual file/rule pairs.
    for key, count in current_counts.items():
        allowed = baseline_counts.get(key, 0)

        if count > allowed:
            filename, code = key

            failures.append(f"{filename}: {code} increased from {allowed} to {count}.")

    if failures:
        print("\n[FAIL] Ruff baseline regression:")

        for failure in failures:
            print(f"  - {failure}")

    # Strictly check changed Python files.
    modified_files = get_modified_python_files(api_root)

    if modified_files:
        print(f"\nStrictly checking {len(modified_files)} changed Python file(s):")

        strict_result = run_command(
            ruff_command + ["check", *modified_files],
            api_root,
        )

        if strict_result.returncode != 0:
            print("[FAIL] Changed Python files failed strict Ruff checking.")
            print(strict_result.stdout or strict_result.stderr)
            return 1

        print("Changed Python files passed strict Ruff checking.")

    else:
        print("\nNo changed Python files detected.")

    if failures:
        return 1

    if current_total < baseline_total:
        print(f"\nBacklog improved by {baseline_total - current_total} finding(s).")

    print("\n[PASS] Ruff lint gate passed.")
    print("=" * 64)

    return 0


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    sys.exit(main())
