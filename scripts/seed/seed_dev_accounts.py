#!/usr/bin/env python3
"""Entrypoint for seeding development demo accounts."""

import os
import sys

# Add apps/api to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api")))

from scripts.seed_dev_accounts import seed_accounts

if __name__ == "__main__":
    try:
        seed_accounts()
    except RuntimeError as exc:
        print(f"[!] Seeding aborted: {exc}", file=sys.stderr)
        sys.exit(1)
