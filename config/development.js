'use strict';

module.exports = {
  database: {
    url: 'mongodb://localhost/',
    name: 'autocron_dev'
  },
  api: {
    url: 'http://localhost:3000/api/v2/api-docs/'
  },
  session: {
    store: 'db'
  },
  port: 8080,
  ip: '127.0.0.1',
  pretty: true
};
