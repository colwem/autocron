var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var mongoose = require('mongoose');
var User = require("../../models/user.js");
var h = require("../helpers");

chai.use(chaiAsPromised);
var expect = chai.expect;

var db;


describe('User', function() {

  before(function(done) {
    db = mongoose.connect('mongodb://localhost/autocron_test');
    done();
  });

  after(function(done) {
    mongoose.connection.close();
    done();
  });
  
  describe('#save, #create', function() {

    it('can be created', function() {
      return expect(User.create({userId: h.uuidGenerator(),
                                apiKey: h.uuidGenerator()}))
        .to.be.fulfilled;
    });

    it('does not allow duplicates', function(){
      var userId = h.uuidGenerator(),
          apiKey = h.uuidGenerator();
      return User.create({userId: userId,
                  apiKey: apiKey})
      .then(function(user) {
        return 
          expect(
            User.create({userId: userId,
                        apiKey: apiKey})
          ).to.be.rejected;
      });
    });

    it('validates userId format', function() {
      return 
        expect(
          User.create({userId: h.badUuidGenerator(),
                      apiKey: h.uuidGenerator()})
        ).to.be.rejected;
    });

    it('validates apiKey format', function(){
      return 
        expect(
          User.create({userId: h.uuidGenerator(),
                      apiKey: h.badUuidGenerator()})
        ).to.be.rejected;
    });

  });

  context('has unique userId', function() {
    var userId = h.uuidGenerator(), 
        apiKey = h.uuidGenerator(); 
    beforeEach(function(done) {
      var user = new User({
        userId: userId,
        apiKey: apiKey
      });

      user.save(function(error) {
        if (error) console.log('error' + error.message);
        done();
      });
    });

    it('find a user by userId', function(done) {
      User.findOne({ userId: userId }, function(err, user) {
        expect(user.userId).to.be.equal(userId);
        done();
      });
    });

    afterEach(function(done) {
      User.remove({}, function() {
        done();
      });
    });
  });
});
