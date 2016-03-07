"use strict";

let chai      = require('chai'),
    session   = require('supertest-session'),
    request   = require('supertest'),
    mongoose  = require('mongoose'),
    mockgoose = require('mockgoose'),
    helpers   = require('../helpers'),
    app       = require('../../app'),
    h         = require('../helpers');

mockgoose(mongoose);
let expect = chai.expect;

describe('User routes', () => {
  describe('POST /users/register', () => {
    it('should create a user', (done) => {
      let userId = h.uuidGenerator();
      let apiKey = h.uuidGenerator();

      request(app)
        .post('/users/register')
        .send({userId: userId, apiKey: apiKey})
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(err).to.equal(null);
          expect(res.header.location).to.include('/');
          // expect(res.body.success).to.equal(true);
          done();
        });
    });
  });


  describe('GET /users/', () => {
    let testSession,
        userId = h.uuidGenerator(),
        apiKey = h.uuidGenerator();

    context('when in a login session', () => {

      beforeEach((done) => {
        testSession = session(app)
        testSession
          .post('/users/register')
          .send({userId: userId, apiKey: apiKey})
          .expect(302)
          .end(done);
      });

      it('should get user page', (done) => {
        testSession
          .get('/users/')
          .expect(200)
          .end((err, res) => {
            expect(res.text).to.include(userId);
            done()
          });
      });
    });

    context('when not a login session', () =>{
      it('should redirect to /users/login', (done) => {
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


  describe('GET /users/edit', () => {
    let testSession,
        userId = h.uuidGenerator(),
        apiKey = h.uuidGenerator();

    context('when in a login session', () => {

      beforeEach((done) => {
        testSession = session(app)
        testSession
          .post('/users/register')
          .send({userId: userId, apiKey: apiKey})
          .expect(302)
          .end(done);
      });

      it('should get edit page', (done) => {
        testSession
          .get('/users/edit')
          .expect(200)
          .end((err, res) => {
            expect(res.text).to.include('form');
            expect(res.text).to.include('cronTime');
            done()
          });
      });
    });

    context('when not a login session', () =>{
      it('should redirect to /users/login', (done) => {
        request(app)
          .get('/users/edit')
          .expect(302)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.header.location).to.include('users/login');
            done();
          });
      });
    });
  })
});
