'use strict';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    config = require('config'),
    api = require('../lib/api').getConnection(config.get('api.url'));


// When I trie to use bluebird I get this warning about
// handler not returning a promise.
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
    max: 23,
    required: true
  },

  timeZoneOffset: {
    type: Number,
    default: 0,
    min: -12 * 60,
    max: 12 * 60,
    required: true
  },

  timeZone: {
    type: Number,
    default: 0,
    min: -12,
    max: 12,
  },

  UTCCronTime: {
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
}, {
  strict: 'throw'
});

userSchema.pre('save', function(next) {

  this.timeZone = timeZoneToHours(this.timeZoneOffset);

  let UTCCronTime = this.timeZone + this.cronTime;
  UTCCronTime = UTCCronTime < 0 ? 24 + UTCCronTime : UTCCronTime;

  this.UTCCronTime = UTCCronTime;
  next();
});

userSchema.statics.register = function(options) {
  let user = new this(options);

  return api.getUser({
    userId: user.userId,
    apiKey: user.apiKey
  })

  .then((habiticaUser) => {
    habiticaUser = habiticaUser;
    let dayStart = habiticaUser.preferences.dayStart;

    user.cronTime = (dayStart + 1) % 24;
    user.timeZoneOffset = habiticaUser.preferences.timezoneOffset;

    return user.save();
  })

  .catch((err) => {

    throw err;
  });
}

userSchema.methods.validApiKey = function(apiKey) {

  return this.apiKey === apiKey;
}

function timeZoneToHours(timeZoneMinutes) {
  return Math.round( timeZoneMinutes / 60);
}

module.exports = mongoose.model('User', userSchema);
