#!/usr/bin/env python3
"""Root CLI entrypoint for ArogyaVajra Initial Administrator Bootstrap."""

import os
import sys

# Add apps/api to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api")))

from scripts.bootstrap_admin import main

if __name__ == "__main__":
    main()
