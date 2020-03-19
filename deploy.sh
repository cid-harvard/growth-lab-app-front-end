#!/bin/bash
set -xe

if [ $TRAVIS_BRANCH == 'backend' ] ; then
  rsync -rq --delete --rsync-path="mkdir -p $APP_DIR/frontend && rsync" $TRAVIS_BUILD_DIR/build ubuntu@$STAGING_IP_ADDRESS:$APP_DIR/frontend
  scp nginx.conf ubuntu@$STAGING_IP_ADDRESS:$APP_DIR
  scp gunicorn.ini ubuntu@$STAGING_IP_ADDRESS:$APP_DIR
else
  echo "Branch not specified in script. Not deploying to server."
fi
