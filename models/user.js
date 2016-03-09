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
  }
});

userSchema.statics.register = function(options) {
  let user = new this(options);

  return api.connect({
    userId: user.userId,
    apiKey: user.apiKey
  })
  .then((client) => {
    return client.user.user_GET()
  })
  .catch((err) => {
    if( err.obj.err === "No user found." ) {
      return Promise.reject("Could not find a Habitica user that "
                          + "matches that User Id and Api Token");
    }
    else {
      return Promise.reject(err);
    }
  })
  .then((habiticaUser) => {
    let dayStart = habiticaUser.obj.preferences.dayStart;
    user.cronTime = (dayStart + 1) % 24;
    return user.save();
  });
}

userSchema.methods.validApiKey = function(apiKey) {
  return this.apiKey === apiKey;
}

module.exports = mongoose.model('User', userSchema);
