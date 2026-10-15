from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

INSECURE_DEFAULT_JWT_SECRETS: frozenset[str] = frozenset({
    "dev-secret-key-change-in-production",
    "change-this-to-a-secure-random-secret-key-in-production",
    "secret",
    "changeme",
    "default",
    "your-secret-key",
})


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    APP_NAME: str = "arogyavajra"
    APP_DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+psycopg://arogyavajra:arogyavajra_dev_password@localhost:5434/arogyavajra"

    # API Configuration
    API_PREFIX: str = "/api/v1"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # Security & JWT
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Reverse Proxy & Trusted Proxy Configuration
    # Comma-separated list of trusted proxy IP addresses or CIDR blocks (e.g., "127.0.0.1,::1,10.0.0.0/8").
    # If empty or unset, no proxy is trusted by default and forwarded headers are strictly ignored.
    TRUSTED_PROXIES: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        """Return CORS origins as a list of strings."""
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    @property
    def trusted_proxies_list(self) -> list[str]:
        """Return trusted proxies as a list of trimmed IP/CIDR strings."""
        if not self.TRUSTED_PROXIES:
            return []
        return [
            pattern.strip()
            for pattern in self.TRUSTED_PROXIES.split(",")
            if pattern.strip()
        ]


    @model_validator(mode="after")
    def validate_production_configuration(self) -> "Settings":
        """Ensure production environment enforces fail-safe security settings."""
        if self.APP_ENV.lower() in ("production", "prod"):
            if (
                self.JWT_SECRET_KEY in INSECURE_DEFAULT_JWT_SECRETS
                or len(self.JWT_SECRET_KEY.strip()) < 32
            ):
                raise ValueError(
                    "Security validation failed: In production environment (APP_ENV=production), "
                    "JWT_SECRET_KEY must not use known development defaults and must be at least 32 characters long."
                )

            if self.APP_DEBUG:
                raise ValueError(
                    "Security validation failed: In production environment, APP_DEBUG must be False."
                )

            cors_list = self.cors_origins_list
            if not cors_list:
                raise ValueError(
                    "Security validation failed: In production environment, CORS_ORIGINS must not be empty."
                )
            for origin in cors_list:
                origin_clean = origin.strip().lower()
                if (
                    origin_clean == "*"
                    or "localhost" in origin_clean
                    or "127.0.0.1" in origin_clean
                    or "0.0.0.0" in origin_clean
                    or "::1" in origin_clean
                ):
                    raise ValueError(
                        f"Security validation failed: In production environment, CORS origin '{origin}' "
                        "cannot be a wildcard '*' or point to localhost/loopback addresses."
                    )
                if not origin_clean.startswith("https://"):
                    raise ValueError(
                        f"Security validation failed: In production environment, CORS origin '{origin}' "
                        "must use secure HTTPS ('https://')."
                    )

            if "arogyavajra_dev_password" in self.DATABASE_URL or "postgres:postgres@" in self.DATABASE_URL:
                raise ValueError(
                    "Security validation failed: In production environment, DATABASE_URL must not use "
                    "known development or default database credentials."
                )

        return self



settings = Settings()
