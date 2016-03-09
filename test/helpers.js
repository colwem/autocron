'use strict';

// let mongoose = require('mongoose'),
    // mockgoose = require('mockgoose');

// mockgoose(mongoose);

class Helpers {

  constructor() {
    this.testUserId = 'bfea558d-aa49-41e7-8b3e-a3c717907816';
    this.testApiKey = '7baa1947-7c06-4f0a-8883-863148cbf34b';
  }

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
  };

  badUuidGenerator() {
    return 'blah';
  }

}

module.exports = new Helpers();

