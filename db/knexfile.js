const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
} = require('../src/config');

module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      user: DATABASE_USER,
      password: DATABASE_PASSWORD,
      database: DATABASE_NAME,
    },
    migrations: {
      directory: __dirname + '/migrations',
    },
    seeds: {
      directory: __dirname + '/seeds/development',
    },
  },
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: '54320',
      user: 'coc',
      password: 'pwd123',
      database: 'coc',
    },
    migrations: {
      directory: __dirname + '/migrations',
    },
    seeds: {
      directory: __dirname + '/seeds/development',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: '54320',
      user: 'coc',
      password: 'pwd123',
      database: 'coc',
    },
    migrations: {
      directory: __dirname + '/migrations',
    },
    seeds: {
      directory: __dirname + '/seeds/development',
    },
  },
};
