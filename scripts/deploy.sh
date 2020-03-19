#!/bin/bash
set -xe

if [ $TRAVIS_BRANCH == 'backend' ] ; then
  # Copy Travis build
  rsync -rq --delete --rsync-path="mkdir -p $APP_DIR/frontend && rsync" $TRAVIS_BUILD_DIR/build ubuntu@$STAGING_IP_ADDRESS:$APP_DIR/frontend

  # Copy NGINX and Gunicorn configs
  scp ./config/nginx.conf ubuntu@$STAGING_IP_ADDRESS:/usr/local/nginx/conf
  scp ./config/gunicorn.ini ubuntu@$STAGING_IP_ADDRESS:$APP_DIR
else
  echo "Branch not specified in script. Not deploying to server."
fi
