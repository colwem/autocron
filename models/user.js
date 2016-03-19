'use strict';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    api = require('../lib/api');

mongoose.Promise = global.Promise;

let matcher = /\S{8}-\S{4}-\S{4}-\S{12}/;
let userSchema = new Schema({

  userId: {
    type: String,
    unique: true,
    required: true,
    index: true,
    dropDups: true,
    match: matcher
  },

  apiKey: {
    type: String,
    required: true,
    match: matcher
  },

  cronTime: {
    type:Number,
    default: 0,
    min: 0,
    max: 23
  },

  activated: {
    type: Boolean,
    default: true,
  },

  leaderCanDeactivate: {
    type: Boolean,
    default: true
  }
});

userSchema.statics.register = function(options) {
  let user = new this(options);
  console.log(38);
  return api.getUser({
    userId: user.userId,
    apiKey: user.apiKey
  })
  .then((habiticaUser) => {
    console.log('models/user.js: 54');
    let dayStart = habiticaUser.obj.preferences.dayStart;
    user.cronTime = (dayStart + 1) % 24;
    return user.save();
  })
  .catch((err) => {
    console.log('models/user.js: 60');
    console.log(err);
    return Promise.reject(err);
  });
}

userSchema.methods.validApiKey = function(apiKey) {
  return this.apiKey === apiKey;
}

module.exports = mongoose.model('User', userSchema);
