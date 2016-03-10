'use strict';

module.exports = {
  database: {
    url: process.env.OPENSHIFT_MONGODB_DB_URL
  },
  ip: process.env.OPENSHIFT_NODEJS_IP,
  port: process.env.OPENSHIFT_NODEJS_PORT,
  api: {
    url: 'http://habitica.com/api/v2/api-docs/'
  }
}
