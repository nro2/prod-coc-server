# poc-coc-server

## Overview

This application is a POC (Proof of Concept) for a service that serves up an API backend for poc-coc.

## How to Develop

1. Install the required packages: `npm install`
2. Run the application: `npm start`
3. Check that the application is running by visiting [localhost:8080](http://localhost:8080)


## How to install Docker on Linux
1. update `sudo apt-get update`
2. Remove old Docker software `sudo apt-get remove docker docker-engine docker.io`
3. Install docker `sudo apt install docker.io`
4. State and automate docker at startup `sudo systemctl start docker` `sudo systemctl enable docker`
5. Install docker compose `sudo apt install docker-compose`
6. Create a new group account `sudo groupadd docker`
7. Modify system account `sudo usermod -aG docker $USER`
8. Logout and/or restart
9. Change docker compose ownership `sudo chown $USER:$USER /usr/local/bin/docker-compose`

## How to run docker
1. Navigate to ~/poc-coc/server
2. Start up the docker image `docker-compose up -d`
3. When down spin down the container `docker-compose down`