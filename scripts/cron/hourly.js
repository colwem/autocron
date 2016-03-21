#!/usr/bin/env node

'use strict';


const config = require('config'),
      mongoose     = require('mongoose'),
      debug = require('debug')('autocron:scripts/cron/hourly'),
      Promise = require('bluebird');

let uri = config.get('database.url') + config.get('database.name');

const api = require('../../lib/api');
api.configure(config.get('api.url'));

let hour = (new Date()).getUTCHours();
debug('starting: at UTC ' + hour);

function getConnection(connectionString) {
  return Promise.try(() => {
    return mongoose.connect(uri);
    debug('created mongoose connection');
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
  let promise = api.getUser(user);

  return promise
  .then((user) => {
    return debug('made api call');
  })
  .catch((err) => {
    debug('api call failed');
    return debug(err);
  });
})
.catch((err) => {
  return debug(err);
});

