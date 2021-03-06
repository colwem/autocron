"use strict";

// process.env.NODE_ENV = 'test';

let chai      = require('chai'),
    session   = require('supertest-session'),
    request   = require('supertest'),
    mongoose  = require('mongoose');
    // mockgoose = require('mockgoose');
// mockgoose(mongoose);

let app       = require('../../app'),
    h         = require('../helpers');

let expect = chai.expect;

let userId = h.testUserId,
    apiKey = h.testApiKey,
    badUserId = h.uuidGenerator(),
    badApiKey = h.uuidGenerator();

describe('User routes', function() {
  this.timeout(3000);
  describe('GET /users/login', function() {

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

      it('displays error', function(done) {
        let testSession = session(app);

        testSession
          .post('/users/login')
          .send({userId: 'blah', apiKey: 'blam'})
          .end(() => {
            testSession
              .get('/users/login')
              .expect(200)
              .end((err, res) => {
                expect(res.text).to.include('danger');
                done();
              });
          });
      });

    });

  });

  describe('POST /users/login', function() {

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
            .send({userId: userId, apiKey: apiKey})
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

      it('should get user page', function(done) {
        this.timeout(5000);
        testSession = session(app)
        testSession
          .post('/users/login')
          .send({userId: userId, apiKey: apiKey})
          .expect(302)
          .end((err, res) => {
            if(err) return done(err);
            testSession
              .get('/users/')
              .expect(200)
              .end(function(err, res) {
                expect(res.text).to.include(userId);
                done()
              });
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


  // afterEach(function(done) {
    // mockgoose.reset(() => {
      // done();
    // });
  // });

});
