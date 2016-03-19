'use strict';

let dev = require('./development'),
    def = require('./default');

module.exports = {
  database: {
    url: process.env.OPENSHIFT_MONGODB_DB_URL || dev.database.url || def.database.url
  },
  ip: process.env.OPENSHIFT_NODEJS_IP || dev.ip || def.ip,
  port: process.env.OPENSHIFT_NODEJS_PORT || dev.port || def.port,
  api: {
    url: 'http://habitica.com/api/v2/api-docs/'
  },
  session: {
    store: 'db'
  }
}
