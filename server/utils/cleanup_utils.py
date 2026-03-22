"""Utilities for cleaning up stale agent instances"""
import os
import glob
import time
import shutil
from server.models import Session


def cleanup_stale_instances(max_age_hours: int = 24) -> int:
    """
    Remove instance directories older than max_age_hours with no active DB session.
    Safe to call manually or on a schedule — never on server startup.

    Args:
        max_age_hours: Maximum age in hours for instance directories to keep

    Returns:
        Number of directories removed
    """
    removed = 0

    for path in glob.glob("instance*_user*/"):
        # Extract instance directory name
        instance_dir = os.path.basename(path.rstrip("/"))

        # Check if there's an active session for this instance
        active_session = Session.query.filter_by(
            instance_dir=instance_dir,
            is_active=True
        ).first()

        if not active_session:
            # Calculate directory age
            try:
                age_hours = (time.time() - os.path.getmtime(path)) / 3600

                if age_hours > max_age_hours:
                    shutil.rmtree(path, ignore_errors=True)
                    removed += 1
            except (OSError, FileNotFoundError):
                # Directory may have been removed by another process
                pass

    return removed
