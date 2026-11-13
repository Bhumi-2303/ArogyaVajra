import subprocess
from pathlib import Path

from scripts.lint_gate import get_modified_python_files


def _git(repo_root: Path, *args: str) -> None:
    subprocess.run(
        ["git", *args],
        cwd=repo_root,
        check=True,
        capture_output=True,
        text=True,
    )


def test_changed_python_files_are_normalized_and_deleted_files_skipped(
    tmp_path: Path,
) -> None:
    repo_root = tmp_path
    api_root = repo_root / "apps" / "api"
    api_root.mkdir(parents=True)

    tracked_files = [
        api_root / "modified.py",
        api_root / "renamed.py",
        api_root / "deleted.py",
        repo_root / "outside.py",
    ]
    for path in tracked_files:
        path.write_text("value = 1\n", encoding="utf-8")

    _git(repo_root, "init", "-q")
    _git(repo_root, "config", "user.email", "test@example.invalid")
    _git(repo_root, "config", "user.name", "Test")
    _git(repo_root, "add", ".")
    _git(repo_root, "commit", "-qm", "Initial")

    (api_root / "modified.py").write_text("value = 2\n", encoding="utf-8")
    _git(repo_root, "mv", "apps/api/renamed.py", "apps/api/renamed file.py")
    _git(repo_root, "rm", "-q", "apps/api/deleted.py")
    (api_root / "staged_added.py").write_text("value = 3\n", encoding="utf-8")
    _git(repo_root, "add", "apps/api/staged_added.py")
    (api_root / "untracked.py").write_text("value = 4\n", encoding="utf-8")
    (repo_root / "outside.py").write_text("value = 5\n", encoding="utf-8")

    assert get_modified_python_files(api_root) == [
        "modified.py",
        "renamed file.py",
        "staged_added.py",
        "untracked.py",
    ]
