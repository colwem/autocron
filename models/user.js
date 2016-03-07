var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

mongoose.Promise = global.Promise;

var matcher = /\S{8}-\S{4}-\S{4}-\S{12}/;
var userSchema = new Schema({

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

userSchema.methods.validApiKey = function(apiKey){
  return this.apiKey === apiKey;
}

userSchema.statics.register = function(newUser) {
  // return this.findOne(newUser, function(err, user) {
    // if (user) {
      // return new Promise(function(a,b) { b("user exists!") }); 
    // }
  // });
    return newUser.save();
}

module.exports = mongoose.model('User', userSchema);
