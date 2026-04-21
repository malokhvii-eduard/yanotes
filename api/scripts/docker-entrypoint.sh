#!/usr/bin/env sh
set -e

if [ "$DJANGO_COLLECTSTATIC" = true ]; then
  python manage.py collectstatic -v 2 --noinput
fi

if [ -n "$SUPERUSER_USERNAME" ] && [ -n "$SUPERUSER_EMAIL" ] &&
  [ -n "$SUPERUSER_PASSWORD" ]; then
  python manage.py safecreatesuperuser \
    --username "$SUPERUSER_USERNAME" \
    --email "$SUPERUSER_EMAIL" \
    --password "$SUPERUSER_PASSWORD"
fi

exec gunicorn "$@"
