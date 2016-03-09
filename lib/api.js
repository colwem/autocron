'use strict';

let _       = require('lodash'),
    Swagger = require('swagger-client');

// let apiKey = '7baa1947-7c06-4f0a-8883-863148cbf34b',
    // userId = 'bfea558d-aa49-41e7-8b3e-a3c717907816',
    // gid    = 'a3df59d5-14f0-4610-9694-1c136d7102c4';

class Api {

  constructor() {
    this.definitionUrl = 'http://localhost:3000/api/v2/api-docs/';
  }

  attachUser() {
    let self = this;
    return function(req, res, next) {
      self.connect(req.user.userId, req.user.apiKey);
      self.client.then((client) => {
        return client.user.user_GET()
      })
      .then((user) => {
        req.apiUser = user.obj;
        res.locals.apiUser = user.obj;
        next();
      })
      .catch((err) => {
        if( err === "Can't read from server.  It may not have the appropriate "
           + "access-control-origin settings.") {
          req.flash('danger', "Couldn't connect to the habitica server.  Try "
                  + "again in a minute.  If you keep getting this error it means "
                  +   "habitica is having issues.  Unfortunatly this site is "
                  + "basically dead if Habitica is dead");
        } else {
          req.flash('danger', err);
        }
        res.redirect(req.header('Referer' || '/'))
      });
    }
  }

  connect(userId, apiKey) {
    if( typeof userId === 'object' ) {
      let options = userId;
      userId = options.userId;
      apiKey = options.apiKey;
    }
    this.client = new Swagger({
      url: this.definitionUrl,
      usePromise: true,
      authorizations: {
        xApiUser:
          new Swagger
          .ApiKeyAuthorization("x-api-user",userId,"header"),
        xApiKey:
          new Swagger
          .ApiKeyAuthorization("x-api-key",apiKey,"header")
      }
    });
    return this.client;
  }

  use(cb) {
    return this.client.then((client) => cb(client));
  }
}

module.exports = new Api();


// function api(options) {
//   options = _.assign({ url: 'http://localhost:3000/api/v2/api-docs/'}, options)
//   return new Swagger({
//     url: options.url,
//     usePromise: true,
//     authorizations: {
//       xApiUser:
//         new Swagger.ApiKeyAuthorization("x-api-user",options.userId,"header"),
//       xApiKey:
//         new Swagger.ApiKeyAuthorization("x-api-key",options.apiKey,"header")
//     }
//   })
// }

// module.exports = api;
