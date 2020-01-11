module.exports = {
  DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
  DATABASE_NAME: process.env.DATABASE_NAME || 'coc',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'pwd123',
  DATABASE_PORT: process.env.DATABASE_PORT || '54320',
  DATABASE_USER: process.env.DATABASE_USER || 'coc',
  NODE_ENV: process.env.NODE_ENV || 'development',
  SERVER_HOST: process.env.SERVER_HOST || 'localhost',
  SERVER_PORT: process.env.SERVER_PORT || 8080,
  SERVER_PROTOCOL: process.env.SERVER_PROTOCOL || 'http',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:8080',
};
