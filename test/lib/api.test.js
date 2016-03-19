"use strict";


let chai           = require('chai'),
    h              = require('../helpers'),
    chaiAsPromised = require('chai-as-promised'),
    Api            = require('../../lib/api'),
    sinon          = require('sinon'),
    sinonChai      = require('sinon-chai'),
    config         = require('config'),
    Promise        = require('bluebird'),
    AssertionError = require('assert').AssertionError;

Api.definitionUrl = config.get('api.url');

chai.use(chaiAsPromised);
chai.use(sinonChai);

let expect = chai.expect;

const goodUser = {
  userId: h.testUserId,
  apiKey: h.testApiKey
};

const badUser = {
  userId: h.realUserId,
  apiKey: h.realApiKey
};

const goodUrl = config.get('api.url');
const badUrl = config.get('api.url').replace('api', 'ai');


describe('Api', function() {
  this.timeout(5000);

  describe('#constructor', function() {
    it('has a definitionUrl', function() {
      expect(Api.definitionUrl).to.exist;
      expect(Api.definitionUrl).to.be.a('string');
    });
  });

  describe('#configure', function() {
    afterEach(function() {
      Api.reset();
    });

    context('when no arguments are given', function() {
      context('when there is no this.definitionUrl', function() {
        it('raises an AssertionError', function(done) {
          Api.configure()
          .catch((err) => {
            expect(err).to.be.an.instanceof(AssertionError);
          })
          .then(() => done(), done);
        });
      });

      context('when there is a this.definitionUrl', function() {
        it('does not raise an error', function(done) {
          Api.definitionUrl = config.get('api.url');

          Api.configure()
          .then(() => done(), done);
        });
      });
    });

    context('when a definitionUrl is given', function() {
      context('when it is invalid', function() {
        let defUrl = config.get('api.url').replace('api', 'a');

        it('rejects with cant read swagger error', function(done) {
          Api.configure(defUrl)
          .catch((err) => {
            expect(err.toString()).to.include('read swagger JSON');
          })
          .then(() => done(), done);
        });
      });

      context('when it is valid', function() {
        let defUrl = config.get('api.url');

        it('fulfills with client', function(done) {
          Api.configure(defUrl)
          .then((client) => {
            expect(client).to.have.property('apis');
          })
          .then(() => done(), done);
        });
      });
    });

    context('when an options argument is given', function() {
      context("when it doesn't contain a definitionUrl", function() {
        it('raises an assertion error', function(done) {
          Api.configure({})
          .catch((err) => {
            expect(err).to.be.an.instanceof(AssertionError);
          })
          .then(() => done(), done);
        });
      });

      context('when it contains a definitionUrl', function() {
        let options = {
          definitionUrl: config.get('api.url')
        }
        context('when there was a this.definitionUrl', function() {

          it('uses the options url', function(done) {
            Api.defintionUrl = config.get('api.url').replace('api', 'a');
            Api.configure(options)
            .then((client) => {
              expect(client).to.have.property('apis');
            })
            .then(() => done(), done);
          });
        });
      });
    });

    context('when no definitionUrl is given', function() {
      beforeEach(function() {
        Api.reset();
      });

      it('raises AssertionError', function(done) {
        Api.configure()
        .catch((err) => {
          expect(err).to.be.an.instanceof(AssertionError);
        })
        .then(() => done(), done);
      });
    });

    context('when an invalid definitionUrl is given', function() {
    });

    context('when a valid definitionUrl is given', function() {
      it.skip('does stuff', function(done) {

      });
    });
  });

  describe('#_build', function() {
    afterEach(function() {
      Api.reset();
    });
    beforeEach(function() {
      Api.reset();
    });
    context('when this.definitionUrl is undef', function() {
      it('Error', function(done) {
        delete Api.defintionUrl;
        Api._build()
        .catch((err) => {
          expect(err).to.be.an.instanceof(TypeError);
        })
        .then(() => done(), done);
      });
    });
  });


  describe('#_promiseWithTimeout', function() {
    let timeout = 1000,
        tries = 3;

    context('when it timesout more than tries times', function() {
      it('raises out of tries error', function(done) {
        let called = 0,
            fn = function() {
              called++;
              return Promise.delay(timeout * 1.1)
            };

        Api._promiseWithTimeout(3, timeout, fn)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err.toString()).to.include('Ran out of tries');
          expect(called).to.equal(3);
        })
        .then(() => done(), done);
      });
    });

    context('when fn resolves', function() {
      it('returns the resolution', function(done) {
        let origStr = 'success',
            fn = function() {
              return Promise.resolve(origStr);
            };

        Api._promiseWithTimeout(tries, timeout, fn)
        .then((str) => {
          expect(str).to.equal(origStr);
        })
        .then(() => done(), done);
      });
    });

    context('when fn raises an error', function() {
      it('propogates error in a rejected promise', function(done) {
        let fn = function() {
              throw new Error('ERROR');
            };

        Api._promiseWithTimeout(tries, timeout, fn)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err.toString()).to.include('ERROR');
        })
        .then(() => done(), done);
      });
    });
  });

  describe('#getUser', function() {

    beforeEach(function() {
      Api.reset();
    });

    context('when improperly connected', function() {
      beforeEach(function() {
        Api.configure(badUrl);
      });
      it("it gets the Can't read swagger error", function(done) {
        Api.getUser(goodUser)
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err.toString()).to.include("Can't read swagger JSON");
        })
        .then(() => done(), done);
      });
    });

    context('when properly connected', function() {
      beforeEach(function() {
        Api.configure(goodUrl);
      });
      context('when incorrectly credentialed', function() {
        it('rejects with Could not find user error', function(done) {
          Api.getUser(badUser)
          .catch((err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.toString()).to.include('Could not find a Habitica user that');
          })
          .then(() => done(), done);
        });
      });

      context('when correctly credentialed', function() {
        it('returns a user', function(done) {
          Api.getUser(goodUser)
          .then((user) => {
            expect(user).to.exist;
          })
          .then(() => done(), done);
        });
      });
    });
  });

  describe('#attachUser', function() {
    context("when there's no user", function() {
      beforeEach(function() {
        Api.reset();
        Api.configure(config.get('api.url'));
      });
      it('flashes a danger message and redirects to /', function(done) {
        let req = {
          flash: function(type, message) {
            expect(type).to.be.equal('danger');
            expect(message).to.include('authenticated');
          }
        };
        let res = {
          redirect: function(path) {
            expect(path).to.be.equal('/');
            done();
          }
        };
        Api.attachUser(req, res, done);
      });
    });

    context('when there is a user', function() {
      let req = {
        user: {
          userId: h.testUserId,
          apiKey: h.testApiKey
        }
      };

      context('when improperly connected', function() {
        beforeEach(function() {
          Api.reset();
          Api.configure(badUrl);
        });

        it('sets a flash and calls next()', function(done) {
          req.flash = sinon.spy();
          let next = sinon.spy(),
              res = {locals: {}};
          Api.attachUser(req, res, next)
          .then(() => {
            expect(req.flash).to.have.been.calledWith('danger');
            expect(next).to.have.been.called;
            done();
          })
          .catch(done);
        });
      });

      context('when properly connected', function() {
        beforeEach(function() {
          Api.reset();
          Api.configure(goodUrl);
        });

        it('attaches user to req and res.locals', function(done) {
          req.flash = sinon.spy();
          let next = sinon.spy(),
              res = {locals: {}};

           Api.attachUser(req, res, next)
          .then(() => {
            expect(req.flash).not.to.have.been.called;
            expect(res.locals.apiUser).to.exist;
            expect(req.apiUser).to.exist;
            expect(next).to.have.been.called;
          })
          .then(() => done(), done);
        });
      });
    });
  });
});
