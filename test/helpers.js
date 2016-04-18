'use strict';

const config = require('config'),
      mongoose = require('mongoose');

// let mongoose = require('mongoose'),
    // mockgoose = require('mockgoose');

// mockgoose(mongoose);

const helpers = {

  testUserId: 'bfea558d-aa49-41e7-8b3e-a3c717907816',
  testApiKey: '7baa1947-7c06-4f0a-8883-863148cbf34b',
  realUserId: '041abe75-7ebc-4e11-a32d-9d54f77d74f8',
  realApiKey: 'f467f90c-3291-4020-b7c0-fc055e0bd826',

  uuidGenerator() {
    let s = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    let a = s
        .replace(/[xy]/g, (c) => {
          let r, v;
          r = Math.random() * 16 | 0;
          v = (c === "x" ? r : r & 0x3 | 0x8);
          return v.toString(16);
        });
    return a;
  },

  badUuidGenerator() {
    return 'blah';
  }
}


beforeEach(function (done) {

  function clearDB() {
    for (var i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove(function() {});
    }
    return done();
  }


  if (mongoose.connection.readyState === 0) {
    let uri = config.get('database.url') + config.get('database.name');

    mongoose.connect(uri, function (err) {
      if (err) {
        throw err;
      }

      return clearDB();
    });
  } else {

    return clearDB();
  }
});


afterEach(function (done) {
  mongoose.disconnect();
  return done();
});

module.exports = helpers;
