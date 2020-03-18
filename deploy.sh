#!/bin/bash
set -xe

if [ $TRAVIS_BRANCH == 'backend' ] ; then
  eval "$(ssh-agent -s)"
  ssh-add
  npm run build
  rsync -rq --delete --rsync-path="mkdir -p /frontend && rsync" \
  $TRAVIS_BUILD_DIR/build ubuntu@3.90.254.42:frontend
else
  echo "Not deploying, since this branch isn't backend."
fi
