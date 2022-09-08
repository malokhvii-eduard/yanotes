#!/usr/bin/env sh
set -e

main() {
  if [ "$DJANGO_COLLECTSTATIC" = true ]; then
    ./manage.py collectstatic -v 2 --noinput
  fi

  if [ "$DJANGO_MIGRATE" = true ]; then
    ./manage.py migrate --noinput
  fi

  if [ -n "$SUPERUSER_USERNAME" ] && [ -n "$SUPERUSER_EMAIL" ] &&
    [ -n "$SUPERUSER_PASSWORD" ]; then
    ./manage.py safecreatesuperuser \
      --username "$SUPERUSER_USERNAME" \
      --email "$SUPERUSER_EMAIL" \
      --password "$SUPERUSER_PASSWORD"
  fi

  exec gunicorn "$@"
}

main "$@"
