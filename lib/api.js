'use strict';

let _       = require('lodash'),
    Swagger = require('swagger-client'),
    debug   = require('debug')('autocron:lib/api'),
    assert  = require('assert'),
    Promise = require('bluebird');

let Api = {

  _connections: new Map(),

  timeout: 2000,

  getConnection(definitionUrl, force) {
    if(!definitionUrl) {

      return Promise.reject(new Error('definitionUrl must be provided'));
    }
    if(this._connections.has(definitionUrl) && !force) {

      return this._connections.get(defintionUrl);
    }

    let connection = Object.create(ApiConnection);
    connection.client = this
      ._build(definitionUrl)
      .then((client) => {

        return client;
      })
      .catch((err) => {
        console.log(err.stack);

        throw err;
      });

    this._connections.set(definitionUrl, connection);
    return connection;
  },

  _build(definitionUrl) {
    let tries = 5;

    return promiseWithTimeout(tries, this.timeout, () => {

        return new Swagger({
          url: definitionUrl,
          usePromise: true,
        });
      })
      .catch((err) => {
        console.log('lib/api.js: 64');
        if(typeof err === 'string') {

          throw new Error(err);
        }

        throw err;
      });
  }
}

const ApiConnection = {

  _setAuthorizations(client, userId, apiKey) {
    client
      .clientAuthorizations
      .add('xApiUser',
          new Swagger
          .ApiKeyAuthorization("x-api-user",userId,"header"));

    client
      .clientAuthorizations
      .add('xApiKey',
          new Swagger
          .ApiKeyAuthorization("x-api-key",apiKey,"header"));
  },

  getUser(userCreds) {

    if(!userCreds.userId || !userCreds.apiKey) {
      return Promise.reject(new Error('userId and apiKey required'))
    }

    return this.client
    .then((client) => {
      this._setAuthorizations(client, userCreds.userId, userCreds.apiKey);

      return client.user.user_GET();
    })
    .then((user) => {
      return user.obj;
    })
    .catch((err) => {

      if( err instanceof Error ) throw err;

      if(err.obj && err.obj.err) err = err.obj.err;

      if( err === "Can't read from server.  It may not have the appropriate "
          + "access-control-origin settings.") {
            console.log('lib/api.js: 116');
          throw new Error(
            "Couldn't connect to the habitica server.  Try "
          + "again in a minute.  If you keep getting this error it means "
          +   "habitica is having issues.  Unfortunatly this site is "
          + "basically dead if Habitica is dead");
      }
      else if( err === "No user found." ) {
        console.log('lib/api.js: 124');
        throw new Error("Could not find a Habitica user that "
                      + "matches that User Id and Api Token");
      }
      else {
        console.log('lib/api.js: 128');
        throw err;
      }
    });
  },

  attachUser(req, res, next) {
    let authUser = req.user;

    if(!authUser) {
      req.flash('danger', 'No authenticated user');
      return res.redirect('/');
    }

    return this.getUser({userId: authUser.userId, apiKey: authUser.apiKey})
    .then((apiUser) => {
      req.apiUser = apiUser.obj;
      res.locals.apiUser = apiUser.obj;
      return next();
    })
    .catch((err) => {
      if(typeof err === 'object') err = JSON.stringify(err, null, 2);
      req.flash('danger', err)
      return next();
    });
  }
}

function promiseWithTimeout(triesLeft, timeout, fn) {

  return Promise.try(fn)
    .timeout(timeout)
    .catch(Promise.TimeoutError, (e) => {

      if (triesLeft <= 0) {

        throw new Error('Ran out of tries');
      }

      return promiseWithTimeout(triesLeft - 1, timeout, fn);
    });
}

// Api.attachUser = _.bind(Api.attachUser, Api);

module.exports = Api;
