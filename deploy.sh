#!/bin/bash
set -xe

SERVER_ADDRESS=$1
NGINX_SSL_CONF=$2
SERVER_USER=ubuntu
APP_DIR=/home/ubuntu

# Decrypt deploy key and add to SSH keys
openssl aes-256-cbc -K $encrypted_ba9faf39c0a7_key -iv $encrypted_ba9faf39c0a7_iv -in deploy_key.enc -out ./deploy_key -d
eval "$(ssh-agent -s)"
chmod 600 ./deploy_key
echo -e "Host $SERVER_ADDRESS\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
ssh-add ./deploy_key

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
  export REACT_APP_API_URL='https://hgl-app-staging.cid-labs.com/graphql'
  export REACT_APP_ALBANIA_FDI_PASSWORD=$REACT_APP_ALBANIA_FDI_PASSWORD
EOF

# Copy Travis build
rsync -rq --delete --rsync-path="mkdir -p $APP_DIR/frontend && rsync" $TRAVIS_BUILD_DIR/build $SERVER_USER@$SERVER_ADDRESS:$APP_DIR/frontend

# Copy NGINX config
scp ./config/nginx.conf $SERVER_USER@$SERVER_ADDRESS:/etc/nginx
scp ./config/$NGINX_SSL_CONF $SERVER_USER@$SERVER_ADDRESS:/etc/nginx/nginx_ssl.conf

# Reset NGINX
ssh $SERVER_USER@$SERVER_ADDRESS sudo systemctl reload nginx
