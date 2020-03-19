#!/bin/bash
set -xe

if [ $TRAVIS_BRANCH == 'backend' ] ; then
	ssh ubuntu@$STAGING_IP_ADDRESS <<- EOF
		sudo apt update
		sudo apt install -y nginx
		sudo systemctl enable nginx
		sudo mkdir -p /etc/nginx
		sudo chown -R ubuntu /etc/nginx
		sudo chmod -R 755 /etc/nginx/
		sudo mkdir -p /var/log/nginx/
		sudo chown -R ubuntu /var/log/nginx
		sudo chmod -R 755 /var/log/nginx/
	EOF

	# Copy Travis build
	rsync -rq --delete --rsync-path="mkdir -p $APP_DIR/frontend && rsync" $TRAVIS_BUILD_DIR/build ubuntu@$STAGING_IP_ADDRESS:$APP_DIR/frontend

	# Copy NGINX and Gunicorn configs
	scp ./config/nginx.conf ubuntu@$STAGING_IP_ADDRESS:/etc/nginx
	scp ./config/gunicorn.ini ubuntu@$STAGING_IP_ADDRESS:$APP_DIR
else
	echo "Branch not specified in script. Not deploying to server."
fi
