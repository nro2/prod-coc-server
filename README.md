# prod-coc-server

## Overview

This application is the back-end server/API for the Committee of Committees
application (coc).

## Requirements

1. Node.js and npm:
   [Install instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Docker: [https://docs.docker.com/install/]
3. Coc client for building end-to-end application:
   [coc-client](https://bitbucket.org/CapstoneFall19/prod-coc-client/)
   application

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

## Building the application

### Run the back end

1. Install the required packages: `npm install`
2. Run the application: `npm start`
3. Check that the application is running by visiting
   [localhost:8080](http://localhost:8080)

### Run the back end with docker

1. Navigate to project root
2. Provision database resources:
   `docker-compose -f docker-compose.yml up --build`
3. Populate database with tables and data: `npm run database`
4. To access database directly `psql -h localhost -p 54320 -U coc -d coc`
5. When done spin down the container `docker-compose down`

### Building Front-End Assets

In order to serve the front-end application from the back-end server, the
front-end assets must be built and copied to the back-end.

1. Navigate to the client root directory
2. Build the static assets: `npm run build`
3. Copy the `build/` directory created by this command into the coc-server
4. On the server, run `npm start` and visit http://localhost:8080/; the
   front-end page should be visible

### Run the application end to end

1. In prod-coc-server root directory run: `docker-compose up -d` 1b. If you are
   having issues running this on windows run without `-d` option
2. In prod-coc-server root directory run: `npm start`
3. In prod-coc-client run: `npm start`
4. To access the database directly use the command
   `docker exec -it coc_postgres psql -U coc`

## How to Test

### Unit Tests

The unit tests are found in `/tests/unit`.

Run them via `npm test`.

### Integration Tests

The unit tests are found in `/tests/integration`.

They can be ran manually, by provisioning database resources and running the
integration tests:

1. Provision database resources:
   `docker-compose -f docker-compose.yml up --build`
2. Run the integration tests: `npm run test:integration`

Another easy option is to run the integration tests automatically within a
docker network

1. `docker-compose -f docker-compose-tests.yml up --build`
2. Verify that the process ends with code 0 and all tests pass

To exist these containers after finishing press CTRL-C to send an interrupt
signal.

## Database migrations

### Creating migrations

1. Make sure the latest packages are installed by running `npm install`
2. To create a new migration run `npm run migrate <name-of-migration>`
3. Fill out the `exports.up` and `exports.down` functions with your schema
   changes.
4. Run `npm run migrate:up <env>` where `<env>` is the name of the environment
   you are targeting in the [db/knexfile.js](./db/knexfile.js) file.

Documentation: [Knex Migrations](http://knexjs.org/#Migrations)

### Running migrations

1. To run a migration, first ensure that your database is in a neutral state:

   ```bash
   npm run migrate:reset development
   ```

2. Then run the migration and seed the database:

   ```bash
   npm run database
   ```

## Help

**Help! The database is displaying strange behavior**

The database container might be logging
`error: relation <table> already exists`, or that a relation already exists.
This could be because it is out of sync with the current schema or data.

There is the possibility that the database container might be cached, such that
when it is spun up again it still holds outdated information that is
incompatible with the current schema or data.

To fix this, the nuclear option is to delete all of the docker images. You can
do this by running `docker system prune`.

A less abrasive option would be to:

- List the docker images in your machine with `docker images`
- Verify that there is a `postgres` image in the results
- Make a note of the `postgres` image IMAGE ID
- Remove the image via `docker rmi <IMAGE-ID> --force`

**Help! There are Knex MySQL warnings when running `npm install`**

According to [this thread](https://github.com/knex/knex/issues/3512) on GitHub
issues, the problem should be solved by updating to the latest `npm`.

To update to latest, run `npm install -g npm`.

**Help! I'm seeing errors while migrating or seeding the database**

Maybe the database is in a state where it doesn't allow for a migration to be
executed or the data to be seeded.

- To bring the database instance back to a predictable state, run
  `npm run migrate:reset development`.
- Then execute the command that created the migration or seeding error
- If this approach doesn't work, try `docker system prune`
