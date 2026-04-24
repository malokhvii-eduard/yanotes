import logging.config
import os

os.environ.setdefault(
    "SECRET_KEY",
    "test-secret-key-that-is-long-enough-for-simplejwt",
)
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_NAME", "yanotes")
os.environ.setdefault("DB_USER", "yanotes")
os.environ.setdefault("DB_PASSWORD", "yanotes")
os.environ.setdefault("CACHE_HOST", "localhost")

from . import settings as base_settings
from .settings import *

MIDDLEWARE = [
    middleware
    for middleware in base_settings.MIDDLEWARE
    if middleware not in {"django_structlog.middlewares.RequestMiddleware"}
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": "file:yanotes-tests?mode=memory&cache=shared",
        "OPTIONS": {
            "uri": True,
        },
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "yanotes-tests",
    }
}

CACHEOPS_ENABLED = False
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

REST_FRAMEWORK = {
    **base_settings.REST_FRAMEWORK,
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "null": {
            "class": "logging.NullHandler",
        }
    },
    "loggers": {
        "": {"handlers": ["null"], "level": "CRITICAL", "propagate": False},
        "django_structlog": {
            "handlers": ["null"],
            "level": "CRITICAL",
            "propagate": False,
        },
        "yanotes": {"handlers": ["null"], "level": "CRITICAL", "propagate": False},
    },
}
logging.config.dictConfig(LOGGING)
