'use strict';

let chai             = require('chai'),
    chaiAsPromised   = require('chai-as-promised'),
    mongoose         = require('mongoose'),
    mockgoose        = require('mockgoose'),
    config           = require('config');
mockgoose(mongoose);

let User             = require("../../models/user.js"),
    h                = require("../helpers");

chai.use(chaiAsPromised);
let expect = chai.expect;

let db;

afterEach(function(done) {
  mockgoose.reset(done);
});

before((done) => {
  db = mongoose.connect(config.get('database.url') + config.get('database.name'));
  done();
});

describe('User', function() {

  describe('#register', function() {
    let appUserId = 'bfea558d-aa49-41e7-8b3e-a3c717907816',
        appApiKey = '7baa1947-7c06-4f0a-8883-863148cbf34b';

    context('when userId and appKey are found', function() {
      // this.timeout(5000);
      it('creates user', function() {
        return expect(User.register({userId: appUserId, apiKey: appApiKey}))
          .to.eventually.be.an.instanceof(User);
      });

      it('sets cronTime to 1 more than dayStart time', function(done) {
        this.timeout(5000);
        User.register({userId: appUserId,
                      apiKey:  appApiKey})
        .then((user) => {
          expect(user.cronTime).to.eql(1);
          done();
        })
        .catch(done)
      })
    });
  });
  describe('#save, #create', () => {

    it('can be created', () => {
      return expect(User.create({userId: h.uuidGenerator(),
                                apiKey: h.uuidGenerator()}))
        .to.be.fulfilled;
    });

    it('does not allow duplicates', () =>{
      let userId = h.uuidGenerator(),
          apiKey = h.uuidGenerator();
      return User.create({userId: userId,
                  apiKey: apiKey})
      .then((user) => {
        return
          expect(
            User.create({userId: userId,
                        apiKey: apiKey})
          ).to.be.rejected;
      });
    });

    it('validates userId format', () => {
      return
        expect(
          User.create({userId: h.badUuidGenerator(),
                      apiKey: h.uuidGenerator()})
        ).to.be.rejected;
    });

    it('validates apiKey format', () =>{
      return
        expect(
          User.create({userId: h.uuidGenerator(),
                      apiKey: h.badUuidGenerator()})
        ).to.be.rejected;
    });

  });

  describe('cronTime', () => {
    let userId = h.uuidGenerator(),
        apiKey = h.uuidGenerator(),
        testUser;

    beforeEach((done) => {
      return User.create({userId: userId,
                  apiKey: apiKey})
      .then((user) => {
        testUser = user;
        done();
      });
    });

    it('validates minimum', () => {
      testUser.cronTime = -1;
      return expect(testUser.save()).to.be.rejected;
    });

    it('validates maximum', () => {
      testUser.cronTime = 24;
      return expect(testUser.save()).to.be.rejected;
    });

    afterEach((done) => {
      User.remove({}, () => {
        done();
      });
    });

  });

  context('has unique userId', () => {
    let userId = h.uuidGenerator(),
        apiKey = h.uuidGenerator();

    beforeEach((done) => {
      let user = new User({
        userId: userId,
        apiKey: apiKey
      });

      user.save((error) => {
        expect(error).to.be.null;
        done();
      });
    });

    it('find a user by userId', (done) => {
      User.findOne({ userId: userId }, (err, user) => {
        expect(user.userId).to.be.equal(userId);
        done();
      });
    });
  });
});
