'use strict';

let _       = require('lodash'),
    Swagger = require('swagger-client'),
    debug   = require('debug')('autocron:lib/api'),
    assert  = require('assert'),
    Promise = require('bluebird');

let Api = {

  _built: false,
  _configured: false,

  reset: function Api_resetDefaults() {
    delete this.definitionUrl;
    delete this.client;
    this._configured = false;
    this._built = false;
  },

  configure: function Api_configure(defUrl, options) {
    this._configured = true;

    this.client = Promise.try(() => {
      if( typeof defUrl === 'object' ) {
        options = defUrl;
        defUrl = options.definitionUrl;
      }
      this.definitionUrl = defUrl || this.definitionUrl;
      assert(this.definitionUrl, 'definitionUrl must be provided');

      return this
      ._build()
      .then((client) => {
        // Had big issue here, was resolving into an Error object
        // rather than it being caught
        console.log('lib/api.js: 35');
        this._built = true;
        return client;
      })
      .catch((err) => {
        console.log('lib/api.js: 41');
        console.log(err);
        this._built = false;
        throw err;
      });
    });

    return this.client;
  },

  _build: function Api_build() {
    let tries = 3,
        timeout = 500;

    return this
    ._promiseWithTimeout(tries, timeout, () => {
      return new Swagger({
        url: this.definitionUrl,
        usePromise: true,
      });
    })
    .catch((err) => {
      if(typeof err === 'string') {

        return Promise.reject(new Error(err));
      }

      return Promise.reject(err);
    });
  },

  _promiseWithTimeout: function Api_buildRec(triesLeft, timeout, fn) {
    return Promise.try(() => {
      return fn();
    })
    .timeout(timeout)
    .catch(Promise.TimeoutError, (e) => {
      if (triesLeft <= 0) {
        // Do I need to throw Errors to have them rejected?
        throw new Error('Ran out of tries');
      }
      return this._promiseWithTimeout(triesLeft - 1, timeout, fn);
    });
  },

  getUser: function Api_getUser(userId, apiKey) {
    console.log('lib/api.js: 82');
    if( typeof userId === 'object' ) {
      console.log('lib/api.js: 84');
      let options = userId;
      userId = options.userId;
      apiKey = options.apiKey;
    }
    if(!userId || !apiKey) {
      console.log('lib/api.js: 89');
      return Promise.reject(new Error('userId and apiKey required'))
    }
    if( ! this._configured ) {
      console.log('lib/api.js: 92');
      return Promise.reject(
        new Error('You must configure the api before you call this method'));
    }
    console.log('lib/api.js: 95');
    return this.client
    .then((client) => {
      console.log('lib/api.js: 97');
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
      console.log('lib/api.js: 108');
      return client.user.user_GET();
    })
    .catch((err) => {
      if( err instanceof Error ) return Promise.reject(err);
      if(typeof err === 'object') err = err.obj.err
      if( err === "Can't read from server.  It may not have the appropriate "
          + "access-control-origin settings.") {
            console.log('lib/api.js: 116');
        return Promise.reject(new Error(
            "Couldn't connect to the habitica server.  Try "
          + "again in a minute.  If you keep getting this error it means "
          +   "habitica is having issues.  Unfortunatly this site is "
          + "basically dead if Habitica is dead"));
      }
      else if( err === "No user found." ) {
        console.log('lib/api.js: 124');
        return Promise.reject(new Error("Could not find a Habitica user that "
                            + "matches that User Id and Api Token"));
      }
      else {
        console.log('lib/api.js: 128');
        return Promise.reject(err);
      }
    });
  },

  attachUser: function Api_attachUser(req, res, next) {
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

Api.attachUser = _.bind(Api.attachUser, Api);

module.exports = Api;
