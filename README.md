# prod-coc-server

## Overview

This application is a POC (Proof of Concept) for a service that serves up an API
backend for poc-coc.

## How to Develop

Run the application:

1. Install the required packages: `npm install`
2. Run the application: `npm start`
3. Check that the application is running by visiting
   [localhost:8080](http://localhost:8080)

Interact with the database:

1. Provision database resources:
   `docker-compose -f docker-compose.yml up --build`
2. Create tables in the database: `npm run migrate:up development`
3. Seed the database with data: `npm run seed`

## How to Test

**Unit Tests**:

The unit tests are found in `/tests/unit`.

Run them via `npm test`.

**Integration Tests**

The unit tests are found in `/tests/integration`.

To run them,

1. Provision database resources:
   `docker-compose -f docker-compose.yml up --build`
2. Run the integration tests: `npm run test:integration`

## Creating database migrations

1. Make sure the latest packages are installed by running `npm install`
2. To create a new migration run `npm run migrate <name-of-migration>`
3. Fill out the `exports.up` and `exports.down` functions with your schema
   changes.
4. Run `npm run migrate:up <env>` where `<env>` is the name of the environment
   you are targeting in the [db/knexfile.js](./db/knexfile.js) file.

Documentation: [Knex Migrations](http://knexjs.org/#Migrations)

## How to install Docker on Linux

1. update `sudo apt-get update`
2. Remove old Docker software
   `sudo apt-get remove docker docker-engine docker.io`
3. Install docker `sudo apt install docker.io`
4. State and automate docker at startup `sudo systemctl start docker`
   `sudo systemctl enable docker`
5. Install docker compose `sudo apt install docker-compose`
6. Create a new group account `sudo groupadd docker`
7. Modify system account `sudo usermod -aG docker $USER`
8. Logout and/or restart
9. Change docker compose ownership
   `sudo chown $USER:$USER /usr/local/bin/docker-compose`

## How to run docker

1. Navigate to project root
2. Start up the docker image `docker-compose up -d` 2b. If you are having issues
   running this on windows run without `-d` option
3. To access database directly `psql -h localhost -p 54320 -U coc -d coc`
4. When done spin down the container `docker-compose down`

### How to run the application end-to-end

1. run docker-compose up -d from the prod-coc-server project
2. run node index.js from the prod-coc-server project 2b. If you are having
   issues running this on windows run without -d option
3. run npm start from the prod-coc-client project
4. To access the database directly use the command
   `docker exec -it coc_postgres psql -U coc`
