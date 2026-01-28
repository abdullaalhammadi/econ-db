#!/bin/sh

# Replace placeholder with actual environment variable in all JS files
find /usr/share/nginx/html -type f -name '*.js' -exec sed -i "s|__VITE_API_BASE_URL__|${VITE_API_BASE_URL}|g" {} +

# Execute the CMD
exec "$@"
