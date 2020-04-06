#!/bin/bash
set -xe

ssh $SERVER_USER@$SERVER_ADDRESS <<- EOF
	sudo apt update
	sudo apt install -y nginx
	sudo systemctl enable nginx
	sudo mkdir -p /etc/nginx
	sudo chown -R $SERVER_USER /etc/nginx
	sudo chmod -R 755 /etc/nginx/
	sudo mkdir -p /var/log/nginx/
	sudo chown -R $SERVER_USER /var/log/nginx
	sudo chmod -R 755 /var/log/nginx/
EOF

# Copy Travis build
rsync -rq --delete --rsync-path="mkdir -p $APP_DIR/frontend && rsync" $TRAVIS_BUILD_DIR/build $SERVER_USER@$SERVER_ADDRESS:$APP_DIR/frontend

# Copy NGINX config
scp ./config/nginx.conf $SERVER_USER@$SERVER_ADDRESS:/etc/nginx
