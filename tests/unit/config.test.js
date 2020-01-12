const assert = require('assert');
const decache = require('decache');

describe('Config variable tests', () => {
  let config;
  before(() => {
    decache('../../src/config');
    config = require('../../src/config');
  });

  describe('DATABASE_HOST', () => {
    const host = 'localhost';
    it(`defaults to '${host}'`, () => {
      assert.equal(config.DATABASE_HOST, host);
    });

    it('reads from environment variable', () => {
      const expected = 'test-database-host';
      process.env.DATABASE_HOST = expected;

      decache('../../src/config');
      config = require('../../src/config');

      assert.equal(config.DATABASE_HOST, expected);
    });
  });

  describe('DATABASE_NAME', () => {
    const name = 'coc';
    it(`defaults to '${name}'`, () => {
      assert.equal(config.DATABASE_NAME, name);
    });

    it('reads from environment variable', () => {
      const expected = 'test-database-name';
      process.env.DATABASE_NAME = expected;

      decache('../../src/config');
      config = require('../../src/config');

      assert.equal(config.DATABASE_NAME, expected);
    });
  });

  describe('DATABASE_PASSWORD', () => {
    const password = 'pwd123';
    it(`defaults to '${password}'`, () => {
      assert.equal(config.DATABASE_PASSWORD, password);
    });

    it('reads from environment variable', () => {
      const expected = 'test-database-password';
      process.env.DATABASE_PASSWORD = expected;

      decache('../../src/config');
      config = require('../../src/config');

      assert.equal(config.DATABASE_PASSWORD, expected);
    });
  });

  describe('DATABASE_PORT', () => {
    const port = '54320';
    it(`defaults to '${port}'`, () => {
      assert.equal(config.DATABASE_PORT, port);
    });

    it('reads from environment variable', () => {
      const expected = 'test-database-port';
      process.env.DATABASE_PORT = expected;

      decache('../../src/config');
      config = require('../../src/config');

      assert.equal(config.DATABASE_PORT, expected);
    });
  });

  describe('DATABASE_USER', () => {
    const user = 'coc';
    it(`defaults to '${user}'`, () => {
      assert.equal(config.DATABASE_USER, user);
    });

    it('reads from environment variable', () => {
      const expected = 'test-database-user';
      process.env.DATABASE_USER = expected;

      decache('../../src/config');
      config = require('../../src/config');

      assert.equal(config.DATABASE_USER, expected);
    });
  });

  describe('NODE_ENV', () => {
    const environment = 'development';
    it(`defaults to '${environment}'`, () => {
      assert.equal(config.NODE_ENV, environment);
    });

    it('reads from environment variable', () => {
      const expected = 'test-node-environment';
      process.env.NODE_ENV = expected;

      decache('../../src/config');
      config = require('../../src/config');

      assert.equal(config.NODE_ENV, expected);
    });
  });

  describe('SERVER_HOST', () => {
    const host = 'localhost';
    it(`defaults to '${host}'`, () => {
      assert.equal(config.SERVER_HOST, host);
    });

    it('reads from environment variable', () => {
      const expected = 'test-server-host';
      process.env.SERVER_HOST = expected;

      decache('../../src/config');
      config = require('../../src/config');

      assert.equal(config.SERVER_HOST, expected);
    });
  });

  describe('SERVER_PORT', () => {
    const port = 8080;
    it(`defaults to '${port}'`, () => {
      assert.equal(config.SERVER_PORT, port);
    });

    it('reads from environment variable', () => {
      const expected = 'test-server-port';
      process.env.SERVER_PORT = expected;

      decache('../../src/config');
      config = require('../../src/config');

      assert.equal(config.SERVER_PORT, expected);
    });
  });

  describe('SERVER_PROTOCOL', () => {
    const protocol = 'http';
    it(`defaults to '${protocol}'`, () => {
      assert.equal(config.SERVER_PROTOCOL, protocol);
    });

    it('reads from environment variable', () => {
      const expected = 'test-server-protocol';
      process.env.SERVER_PROTOCOL = expected;

      decache('../../src/config');
      config = require('../../src/config');

      assert.equal(config.SERVER_PROTOCOL, expected);
    });
  });

  describe('SERVER_URL', () => {
    const url = 'http://localhost:8080';
    it(`defaults to '${url}'`, () => {
      assert.equal(config.SERVER_URL, url);
    });

    it('reads from environment variable', () => {
      const expected = 'test-server-url';
      process.env.SERVER_URL = expected;

      decache('../../src/config');
      config = require('../../src/config');

      assert.equal(config.SERVER_URL, expected);
    });
  });
});
