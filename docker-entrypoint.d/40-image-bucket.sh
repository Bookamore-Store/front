#!/bin/sh
set -eu

if [ -z "${IMAGE_BUCKET_URL:-}" ]; then
  echo "IMAGE_BUCKET_URL is required for the production frontend image" >&2
  exit 1
fi

case "$IMAGE_BUCKET_URL" in
  */) IMAGE_BUCKET_URL=${IMAGE_BUCKET_URL%/} ;;
esac

sed -i "s|__IMAGE_BUCKET_URL__|${IMAGE_BUCKET_URL}|g" \
  /etc/nginx/conf.d/default.conf
