#!/bin/bash
set -e

find /usr/share/nginx/html -name '*.*' | xargs sed -i "s BUILD_API_HOST $BUILD_API_HOST g"
find /usr/share/nginx/html -name '*.*' | xargs sed -i "s BUILD_SRM_HOST $BUILD_SRM_HOST g"
find /usr/share/nginx/html -name '*.*' | xargs sed -i "s BUILD_MALL_CLIENT_ID $BUILD_MALL_CLIENT_ID g"
find /usr/share/nginx/html -name '*.*' | xargs sed -i "s MALL_APM_APP_ID $MALL_APM_APP_ID g"
find /usr/share/nginx/html -name '*.*' | xargs sed -i "s MALL_ENV $MALL_ENV g"
find /usr/share/nginx/html -name '*.*' | xargs sed -i "s BUILD_MALL_PUBLIC_URL $BUILD_MALL_PUBLIC_URL g"

find /usr/share/nginx/html -name '*.*' | xargs sed -i "s BUILD_YQCLOUD_LOGIN_URL $BUILD_YQCLOUD_LOGIN_URL g"
find /usr/share/nginx/html -name '*.*' | xargs sed -i "s BUILD_YQCLOUD_PASS_URL $BUILD_YQCLOUD_PASS_URL g"
find /usr/share/nginx/html -name '*.*' | xargs sed -i "s BUILD_YQCLOUD_BOTPRESS_URL $BUILD_YQCLOUD_BOTPRESS_URL g"
find /usr/share/nginx/html -name '*.*' | xargs sed -i "s SYSTEM_AUTO_API_HOST ${SYSTEM_AUTO_API_HOST:-false} g"
find /usr/share/nginx/html -name '*.*' | xargs sed -i "s BUILD_WEBSOCKET_HOST ${BUILD_API_HOST}/hpfm/sock-js g"
find /usr/share/nginx/html -name '*.*' | xargs sed -i "s BUILD_AUTO_LOGOUT_METHOD ${BUILD_AUTO_LOGOUT_METHOD:-client} g"

exec "$@"
