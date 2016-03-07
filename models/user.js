var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

mongoose.Promise = global.Promise;

var userSchema = new Schema({
  userId: { type: String, 
            unique: true, 
            required: true, 
            index: true, 
            dropDups: true},
  apiKey: {type: String, required: true},
  cronTime: {type: Date}
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
