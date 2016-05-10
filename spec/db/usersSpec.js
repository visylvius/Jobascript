/* eslint-disable no-unused-vars */
var Promise = require('bluebird');
var usersTable = require('../../server/database').usersTable;
var companiesTable = require('../../server/database').companiesTable;
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;
var should = chai.should();
/* eslint-enable */

describe('Database Users', function () {
  var userID = '';
  var companyID = '';

  before(function (done) {
    usersTable.createUser()
    .then(function (user) {
      userID = user.id;
      return companiesTable.addCompany({ name: 'tesla' });
    })
    .then(function (id) {
      companyID = id;
      done();
    });
  });

  after(function (done) {
    usersTable.clearAll().then(function () {
      return companiesTable.clearAll();
    }).then(function () {
      done();
    });
  });

  describe('Create and Retreive Users', function () {
    it('Should add anonymous user and return user obj', function () {
      return usersTable.createUser()
      .then(function (user) {
        return user;
      })
      .should.eventually.have.property('username');
    });

    it('Should add user with username', function () {
      return usersTable.createUser({ username: 'dummy' })
      .should.eventually.have.property('username', 'dummy');
    });

    it('Get user by username', function () {
      return usersTable.getUser({ username: 'dummy' })
      .should.eventually.have.property('username', 'dummy');
    });

    it('Get user by id', function () {
      return usersTable.getUser({ id: userID })
      .should.eventually.have.property('username');
    });
  });

  describe('Follow and Unfollow Company', function () {
    it('Takes userID and companyID and link them', function () {
      return usersTable.followCompany(userID, companyID).should.be.fulfilled;
    });

    it('Unfollow Company', function () {
      return usersTable.unfollowCompany(userID, companyID).should.be.fulfilled;
    });
  });

  describe('User specific companies list', function () {
    before(function (done) {
      usersTable.followCompany(userID, companyID).then(function () {
        done();
      });
    });

    it('Should return a list of companies the user follows', function () {
      return usersTable.getCompanies(userID)
      .should.eventually.be.an('array')
      .and.have.lengthOf(1);
    });
  });
});