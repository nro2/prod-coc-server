# poc-coc-server

## Overview

This application is a POC (Proof of Concept) for a service that serves up an API backend for poc-coc.

## How to Develop

1. Install the required packages: `npm install`
2. Run the application: `npm start`
3. Check that the application is running by visiting [localhost:8080](http://localhost:8080)

## Creating database migrations

1. Install db-migrate globally run `npm install -g db-migrate`
2. Install db-migrate locally by running `npm install db-migrate or npm install`
2. To create a new migration run `db-migrate create [Name_Of_Migration]` 
3. Fill out the exports.up and exports.down functions with your schema changes.
4. Run `db-migrate up -e [ENV]` where [ENV] is the name of the environment you are targeting in the database.json file.

Documentation https://db-migrate.readthedocs.io/en/latest/

