'use strict';

let _       = require('lodash'),
    Swagger = require('swagger-client');

// let apiKey = '7baa1947-7c06-4f0a-8883-863148cbf34b',
    // userId = 'bfea558d-aa49-41e7-8b3e-a3c717907816',
    // gid    = 'a3df59d5-14f0-4610-9694-1c136d7102c4';


function api(options) {
  options = _.assign({ url: 'http://localhost:3000/api/v2/api-docs/'}, options)
  return new Swagger({
    url: options.url,
    usePromise: true,
    authorizations: {
      xApiUser:
        new Swagger.ApiKeyAuthorization("x-api-user",options.userId,"header"),
      xApiKey:
        new Swagger.ApiKeyAuthorization("x-api-key",options.apiKey,"header")
    }
  })
}

module.exports = api;
