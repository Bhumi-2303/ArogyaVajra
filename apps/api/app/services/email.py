"""Email service interface and pluggable console logging implementation."""

import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class EmailSender(ABC):
    """Abstract transactional email delivery service."""

    @abstractmethod
    def send_password_reset_email(self, to_email: str, reset_url: str) -> None:
        """Deliver a password reset link to the specified recipient email."""


class ConsoleEmailSender(EmailSender):
    """Console implementation logging email payloads for dev, staging, and container environments."""

    def send_password_reset_email(self, to_email: str, reset_url: str) -> None:
        logger.info(
            "[EMAIL SENDER] Password reset requested for: %s | Reset Link: %s",
            to_email,
            reset_url,
        )


_default_email_sender: EmailSender = ConsoleEmailSender()


def get_email_sender() -> EmailSender:
    """Dependency provider for EmailSender."""
    return _default_email_sender


def set_email_sender(sender: EmailSender) -> None:
    """Override email sender instance (primarily for tests)."""
    global _default_email_sender
    _default_email_sender = sender
