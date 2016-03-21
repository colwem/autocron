"use strict";

// process.env.NODE_ENV = 'test';

let chai      = require('chai'),
    session   = require('supertest-session'),
    request   = require('supertest'),
    mongoose  = require('mongoose'),
    mockgoose = require('mockgoose');
mockgoose(mongoose);
let helpers   = require('../helpers'),
    app       = require('../../app'),
    h         = require('../helpers');

let expect = chai.expect;

let userId = h.testUserId,
    apiKey = h.testApiKey,
    badUserId = h.uuidGenerator(),
    badApiKey = h.uuidGenerator();

describe('User routes', function() {
  this.timeout(3000);
  describe('GET /users/login', function() {

    // beforeEach(function(done) {
    //   request(app)
    //     .post('/users/login')
    //     .send({userId: userId, apiKey: apiKey})
    //     .expect(302)
    //     .end((err, res) => {
    //       if (err) return done(err);
    //       expect(err).to.equal(null);
    //       expect(res.header.location).to.not.include('login');
    //       // expect(res.body.success).to.equal(true);
    //       done();
    //     });
    // });

    it('gets login page', function(done){
      request(app)
        .get('/users/login')
        .expect(200)
        .end((err, res) => {
          expect(res.text).to.include('form');
          expect(res.text).to.include('userId');
          expect(res.text).to.include('apiKey');
          done();
        });
    });

    context('when login fails', function() {
      let testSession;
      before(function(done)  {
        testSession = session(app)
        testSession
          .post('/users/login')
          .send({userId: 'blah', apiKey: 'blam'})
          .end(done)
      });

      it('displays error', function(done) {
        testSession
          .get('/users/login')
          .expect(200)
          .end((err, res) => {
            expect(res.text).to.include('danger');
            done();
          });
      });

      afterEach(function(done) {
        mockgoose.reset(() => {
          done();
        });
      });
    });

    afterEach(function(done) {
      mockgoose.reset(() => {
        done();
      });
    });
  });

  describe.only('POST /users/login', function() {
    context("when userId or Api Token aren't valid", function() {
      this.timeout(5000)
      it('redirects to /users/login', function(done) {
        request(app)
          .post('/users/login')
          .send({userId: 'blah', apiKey: 'blah'})
          .expect(302)
          .end((err, res) => {
            if (err) return done(err);
            expect(err).to.equal(null);
            expect(res.header.location).to.include('login');
            // expect(res.body.success).to.equal(true);
            done();
          });
      });

      it('puts correct error in session', function(done) {
        let testSession = session(app);
        testSession
          .post('/users/login')
          .send({userId: 'blah', apiKey: 'blah'})
          .expect(302)
          .end((err, res) => {
            if (err) return done(err);
            expect(err).to.equal(null);
            expect(res.header.location).to.include('login');
            // expect(res.body.success).to.equal(true);
            testSession
              .get(res.header.location)
              .expect(200)
              .end((err, res) => {
                expect(res.text).to.include('danger');
                done();
              })
          });
      });

      afterEach(function(done) {
        mockgoose.reset(() => {
          done();
        });
      });
    });

    context('when userId and Api Token valid', function() {
      context("when they don't exist in api", function() {
        it('redirects', function(done) {
          request(app)
            .post('/users/login')
            .send({userId: badUserId, apiKey: badApiKey})
            .expect(302)
            .end((err, res) => {
              if (err) return done(err);

              expect(err).to.equal(null);
              expect(res.header.location).to.include('login');

              done();
            });
        });

        it('errors', function(done) {
          let testSession = session(app);
          testSession
            .post('/users/login')
            .send({userId: badUserId, apiKey: badApiKey})
            .expect(302)
            .end((err, res) => {
              if (err) return done(err);

              expect(err).to.equal(null);
              expect(res.header.location).to.include('login');

              testSession
                .get(res.header.location)
                .expect(200)
                .end((err, res) => {
                  if (err) {
                    return done(err);
                  }

                  expect(res.text).to.include('danger');
                  done();
                });
            });
        });
      });

      context('when they exist in api', function() {
        it('redirects to /users/', function(done) {
          request(app)
            .post('/users/login')
            .send({userId: userId, apiKey: userId})
            .expect(302)
            .end((err, res) => {
              if (err) return done(err);
              expect(err).to.equal(null);
              expect(res.header.location).to.not.include('login');
              // expect(res.body.success).to.equal(true);
              done();
            });
        });
      });
    });
  });

  describe('GET /users/', function() {
    let testSession,
        userId = h.testUserId,
        apiKey = h.testApiKey;

    context('when in a login session', function() {

      beforeEach(function(done) {
        testSession = session(app)
        testSession
          .post('/users/register')
          .send({userId: userId, apiKey: apiKey})
          .expect(302)
          .end(done);
      });


      it('should get user page', function(done) {
        testSession
          .get('/users/')
          .expect(200)
          .end(function(err, res) {
            expect(res.text).to.include(userId);
            done()
          });
      });

      afterEach(function(done) {
        mockgoose.reset(() => {
          done();
        });
      });

    });

    context('when not a login session', function() {
      it('should redirect to /users/login', function(done) {
        request(app)
          .get('/users/')
          .expect(302)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.header.location).to.include('users/login');
            done();
          });
      });
    });
  });



  after(function(done) {
    mockgoose.reset(() => {
      done();
    });
  });

});
