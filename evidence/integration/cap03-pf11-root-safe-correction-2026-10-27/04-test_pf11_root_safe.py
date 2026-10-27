#!/usr/bin/env python3
"""Portable runtime fixtures and source-integrity checks for the PF-11 correction.

The Windows PowerShell harness (03-test_pf11_root_safe.ps1) is the native target
runtime test. This Python suite runs the same lexical parent-walk contract in the
available Linux sandbox and makes no claim to replace Windows PowerShell testing.
"""
from __future__ import annotations

import hashlib
import os
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BUNDLE = Path(__file__).resolve().parent
ORIGINAL = ROOT / "evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1"
CORRECTED = BUNDLE / "02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1"
HELPER = BUNDLE / "01-Find-GitWorktreeAncestor.ps1"
F4 = r"C:\iips-data\iips\user-portfolio.sqlite"


def find_git_worktree_ancestor(start: Path) -> Path | None:
    """Faithful lexical-parent model: probe .git then move to parent until root."""
    current: Path | None = start
    while current is not None:
        marker = current / ".git"
        if marker.exists():  # true for either a regular file or directory
            return current
        parent = current.parent
        if parent == current:
            break
        current = parent
    return None


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class PF11AncestorWalkTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="pf11-root-safe-")
        self.base = Path(self.temp.name)

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_ordinary_existing_parent(self) -> None:
        parent = self.base / "ordinary-parent"
        parent.mkdir()
        self.assertIsNone(find_git_worktree_ancestor(parent))

    def test_missing_intermediate_directory(self) -> None:
        missing = self.base / "ordinary-parent" / "absent" / "intermediate" / "leaf"
        self.assertFalse(missing.exists())
        self.assertIsNone(find_git_worktree_ancestor(missing))

    def test_filesystem_root_termination(self) -> None:
        root = Path(self.base.anchor)
        expected = root if (root / ".git").exists() else None
        self.assertEqual(expected, find_git_worktree_ancestor(root))

    def test_git_directory_in_ancestor_chain(self) -> None:
        repo = self.base / "repo-dir"
        nested = repo / "a" / "b"
        nested.mkdir(parents=True)
        (repo / ".git").mkdir()
        self.assertEqual(repo, find_git_worktree_ancestor(nested))

    def test_git_file_in_ancestor_chain(self) -> None:
        repo = self.base / "repo-file"
        nested = repo / "a" / "b"
        nested.mkdir(parents=True)
        (repo / ".git").write_text("gitdir: metadata/worktree\n", encoding="utf-8")
        self.assertEqual(repo, find_git_worktree_ancestor(nested))

    def test_outside_any_git_worktree(self) -> None:
        outside = self.base / "outside" / "branch" / "leaf"
        outside.mkdir(parents=True)
        self.assertIsNone(find_git_worktree_ancestor(outside))

    def test_source_identity_and_no_store_mutation_behavior_added(self) -> None:
        original = ORIGINAL.read_bytes()
        corrected = CORRECTED.read_bytes()
        helper = HELPER.read_bytes()
        self.assertEqual("85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b", hashlib.sha256(original).hexdigest())
        self.assertIn(F4.encode(), original)
        self.assertIn(F4.encode(), corrected)
        self.assertEqual(original.count(F4.encode()), corrected.count(F4.encode()))
        self.assertIn(helper.rstrip(b"\n"), corrected)
        anchor = b"# ---------------------------------------------------------------- PF-11 / PF-12 / PF-13 (DISP-01)\n"
        old_loop = (b"    # -- PF-11: outside every Git worktree (walk for .git, ancestors only) ------\n"
                    b"    $g = $null; $w = Split-Path -Parent $StorePath\n"
                    b"    while ($true) {\n"
                    b"        if (Test-Path -LiteralPath (Join-Path $w '.git')) { $g = $w; break }\n"
                    b"        $n = Split-Path -Parent $w\n"
                    b"        if ($n -eq $w) { break }\n"
                    b"        $w = $n\n"
                    b"    }\n")
        new_loop = (b"    # -- PF-11: outside every Git worktree (walk for .git, ancestors only) ------\n"
                    b"    $w = Split-Path -Parent $StorePath\n"
                    b"    $g = Find-GitWorktreeAncestor -StartPath $w\n")
        expected = original.replace(anchor, helper + b"\n" + anchor, 1).replace(old_loop, new_loop, 1)
        self.assertEqual(expected, corrected, "correction must be limited to helper addition and PF-11 loop replacement")
        helper_lower = helper.lower()
        for prohibited in (b"new-item", b"set-content", b"remove-item", b"set-acl", b"environment]::setenvironmentvariable", b"--mode=execute"):
            self.assertNotIn(prohibited, helper_lower)
        # The helper receives only the parent string; it has no reference to F4 / StorePath.
        self.assertNotIn(b"storepath", helper_lower)
        self.assertNotIn(F4.encode(), helper)

    def test_fixtures_unchanged_by_walk(self) -> None:
        repo = self.base / "repo"
        nested = repo / "child"
        nested.mkdir(parents=True)
        (repo / ".git").write_text("gitdir: metadata\n", encoding="utf-8")
        before = sorted((p.relative_to(self.base).as_posix(), p.is_dir(), p.read_bytes() if p.is_file() else b"") for p in self.base.rglob("*"))
        for path in (nested, self.base / "missing" / "leaf", Path(self.base.anchor)):
            find_git_worktree_ancestor(path)
        after = sorted((p.relative_to(self.base).as_posix(), p.is_dir(), p.read_bytes() if p.is_file() else b"") for p in self.base.rglob("*"))
        self.assertEqual(before, after)


if __name__ == "__main__":
    unittest.main(verbosity=2)
