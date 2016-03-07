'use strict';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

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

  dayStart: {
    type:Number, 
    default: 0,
    min: 0,
    max: 23
  }
});

userSchema.methods.validApiKey = (apiKey) =>{
  return this.apiKey === apiKey;
}

userSchema.statics.register = (newUser) => {
  // return this.findOne(newUser, (err, user) => {
    // if (user) {
      // return new Promise((a,b) => { b("user exists!") }); 
    // }
  // });
    return newUser.save();
}

module.exports = mongoose.model('User', userSchema);
