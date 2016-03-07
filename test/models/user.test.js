'use strict';

let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
let mongoose = require('mongoose');
let User = require("../../models/user.js");
let h = require("../helpers");

chai.use(chaiAsPromised);
let expect = chai.expect;

let db;


describe('User', () => {

  before((done) => {
    db = mongoose.connect('mongodb://localhost/autocron_test');
    done();
  });

  after((done) => {
    mongoose.connection.close();
    done();
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
        if (error) console.log('error' + error.message);
        done();
      });
    });

    it('find a user by userId', (done) => {
      User.findOne({ userId: userId }, (err, user) => {
        expect(user.userId).to.be.equal(userId);
        done();
      });
    });

    afterEach((done) => {
      User.remove({}, () => {
        done();
      });
    });
  });
});
