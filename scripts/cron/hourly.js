#!/usr/bin/env node

'use strict';

const config   = require('config'),
      mongoose = require('mongoose'),
      debug    = require('debug')('autocron:scripts/cron/hourly'),
      Promise  = require('bluebird');

debug('NODE_ENV: ' + process.env.NODE_ENV);
let uri = config.get('database.url') + config.get('database.name');
debug('uri: ' + uri);
const apiConnection =
  require('@colwem/habitica-api-client')
    .getConnection(config.get('api.url'));

debug('api url: ' + config.get('api.url'));

let hour = (new Date()).getUTCHours();
debug('starting: at UTC ' + hour);

function getConnection(connectionString) {
  return Promise.try(() => {
    debug('created mongoose connection');
    return mongoose.connect(uri);
  })
  .disposer(() => {
    mongoose.disconnect();
    debug('closed mongoose connection');
  })
}

Promise.using(getConnection(uri), (connection) => {
  const User = require('../../models/user');
  debug('finding users');
  return User.find({UTCCronTime: hour});
})
.each((user) => {
  debug('found user ' + user.id);
  debug('id: ' + user.userId);
  let promise = apiConnection.getUser(user);

  return promise
    .then((user) => {
      debug('made api call');
      return user;
    })
    .catch((err) => {
      debug('api call failed');
      return debug(err);
    });
})
.catch((err) => {
  return debug(err.stack);
});

