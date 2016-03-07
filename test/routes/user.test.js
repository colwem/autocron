"use strict";

let chai = require('chai');
let request = require('supertest');
let mongoose = require('mongoose');
let mockgoose = require('mockgoose');
let helpers = require('../helpers');
mockgoose(mongoose);
let app = require('../../app');
let h = require('../helpers');

let expect = chai.expect;

describe('User routes', () => {
  describe('#register', () => {
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
});
