#!/bin/sh

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5

echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list

# See https://askubuntu.com/questions/104160/method-driver-usr-lib-apt-methods-https-could-not-be-found-update-error
sudo apt-get install apt-transport-https

sudo apt-get update

sudo apt-get install -y mongodb-org
