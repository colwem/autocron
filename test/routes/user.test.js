"use strict";

var chai = require('chai');
var request = require('supertest');  
var mongoose = require('mongoose');  
var mockgoose = require('mockgoose');
var helpers = require('../helpers');
mockgoose(mongoose);  
var app = require('../../app');
let h = require('../helpers');

var expect = chai.expect;  

describe('User routes', function() {  
  describe('#register', function() {
    it('should create a user', function(done) {
      let userId = h.uuidGenerator();
      let apiKey = h.uuidGenerator();

      request(app)
        .post('/users/register')
        .send({userId: userId, apiKey: apiKey})
        .expect(302)
        .end(function(err, res) {
          if (err) return done(err); 
          expect(err).to.equal(null);
          expect(res.header.location).to.include('/');
          // expect(res.body.success).to.equal(true);
          done();
        });
    });
  });
});
