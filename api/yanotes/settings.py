"""Django settings for notes project.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""
import logging.config
import os

from pathlib import Path

import environ
import structlog


env = environ.Env()

# Build paths inside the project.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
# https://docs.djangoproject.com/en/4.1/ref/settings/#secret-key
SECRET_KEY = env.str("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
# https://docs.djangoproject.com/en/4.1/ref/settings/#debug
DEBUG = env.bool("DEBUG", default=False)

# https://docs.djangoproject.com/en/4.1/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ["*"]

# https://docs.djangoproject.com/en/4.1/ref/settings/#wsgi-application
WSGI_APPLICATION = "yanotes.wsgi.application"

# https://docs.djangoproject.com/en/4.1/ref/settings/#root-urlconf
ROOT_URLCONF = "yanotes.urls"

# https://docs.djangoproject.com/en/4.1/ref/settings/#x-frame-options
X_FRAME_OPTIONS = "SAMEORIGIN"

# Application definition
# https://docs.djangoproject.com/en/4.1/ref/applications/
INSTALLED_APPS = [
    # Admin theme
    # https://github.com/fabiocaccamo/django-admin-interface
    "admin_interface",
    # Standard library applications
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party applications
    "rest_framework",
    "drf_spectacular",
    "drf_spectacular_sidecar",
    "colorfield",
    # Project applications
    "yanotes.notes",
]

# Middleware
# https://docs.djangoproject.com/en/4.1/topics/http/middleware/
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_structlog.middlewares.RequestMiddleware",
]

# Templates
# https://docs.djangoproject.com/en/4.1/topics/templates/
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases/
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": env.str("DB_HOST"),
        "NAME": env.str("DB_NAME"),
        "USER": env.str("DB_USER"),
        "PASSWORD": env.str("DB_PASSWORD"),
        "PORT": env.int("DB_PORT", default=5432),
    }
}

# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators/
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (  # noqa
            "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# https://docs.djangoproject.com/en/4.1/ref/settings/#time-zone
TIME_ZONE = env.str("TIME_ZONE", default="UTC")

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/
STATIC_ROOT = os.path.join(BASE_DIR, "static")
STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Django REST Framework
# https://www.django-rest-framework.org/api-guide/settings/
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
}

# Django REST Framework Spectacular
# https://drf-spectacular.readthedocs.io/en/latest/
SPECTACULAR_SETTINGS = {
    "SCHEMA_PATH_PREFIX": r"/api",
    "SERVE_INCLUDE_SCHEMA": False,
    "SWAGGER_UI_DIST": "SIDECAR",
    "SWAGGER_UI_FAVICON_HREF": "SIDECAR",
    "REDOC_DIST": "SIDECAR",
    "TITLE": "YaNotes",
    "DESCRIPTION": (
        "YaNotes API is an HTTP API for simple note-taking app. It is used by the"
        " YaNotes UI and everything you can do with the UI can be done using the"
        " HTTP API.\n\n"
        "### Security\n\n"
        "Each API endpoint has an associated access policy, it is documented in the"
        " description of each endpoint. Different access policies are available:\n\n"
        "* Public access\n"
        "* Authenticated access\n"
        "* Administrator access\n"
        "#### Public access\n\n"
        "No authentication is required to access the endpoints with this access"
        " policy.\n\n"
        "#### Authenticated access\n\n"
        "Authentication is required to access the endpoints with this access policy."
        " Extra-checks might be added to ensure access to the resource is granted."
        " Returned data might also be filtered.\n\n"
        "#### Administrator access\n\n"
        "Authentication as well as an administrator role are required to access the"
        " endpoints with this access policy."
    ),
    "CONTACT": {
        "url": "https://malokhvii-eduard.github.io/",
        "email": "malokhvii.ee@gmail.com",
    },
    "VERSION": "1.0.0",
    "TAGS": [
        {"name": "auth", "description": "Authenticate and manage tokens"},
        {"name": "users", "description": "Manage users"},
        {"name": "notes", "description": "Manage notes"},
    ],
}

# Logging
# https://docs.djangoproject.com/en/4.1/topics/logging/
LOGGING_CONFIG = None
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "plain_console": {
            "()": structlog.stdlib.ProcessorFormatter,
            "processor": structlog.dev.ConsoleRenderer(),
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "plain_console",
        }
    },
    "loggers": {
        "": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "yanotes": {
            "handlers": ["console"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
    },
}

# Structured logging
# https://www.structlog.org/en/stable/
# https://django-structlog.readthedocs.io/en/latest/
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.filter_by_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)
logging.config.dictConfig(LOGGING)

# https://docs.djangoproject.com/en/4.1/ref/settings/#silenced-system-checks
SILENCED_SYSTEM_CHECKS = ["security.W019"]
