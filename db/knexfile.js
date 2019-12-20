module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
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
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
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
      host: '127.0.0.1',
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
