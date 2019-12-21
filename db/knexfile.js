module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || '54320',
      user: process.env.DATABASE_USER || 'coc',
      password: process.env.DATABASE_PASSWORD || 'pwd123',
      database: process.env.DATABASE_NAME || 'coc',
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
