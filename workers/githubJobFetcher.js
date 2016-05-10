//write a filter that makes sure that the job posting is actually from the company.
var Promise = require('bluebird');
var _ = require('underscore');
var config = require('../server/common.js').config();
var clearbit = require('clearbit')(config.clearbitKey);
var db = require('../server/database');
var rp = require('request-promise');
var jobTable = require('../server/database').jobsTable;


db.companiesTable.getCompanies()
  .then(function(companyArr) {
    var companyInfo = _.map(companyArr, function (company) {
      return [Number(company.id), company.name];
    });
    return new Promise(function (resolve, reject) {
      return Promise.map(companyInfo, function (companyObj) {
        return rp('https://jobs.github.com/positions.json?description=' + companyObj[1])
        .then(function (data) {
          var jobLists = JSON.parse(data);
          var filteredJobs = _.filter(jobLists, function(job) {
            if (job.company.toLowerCase().indexOf(companyObj[1].toLowerCase()) !== -1) {
              return job;
            }
          });
          _.each(filteredJobs, function(job) {
            // console.log(job.company.toLowerCase().indexOf(companyObj[1].toLowerCase()) === 0);
            if (job.company.toLowerCase().indexOf(companyObj[1].toLowerCase()) === 0) {
              job.company_id = companyObj[0];
            }
          });
          // console.log(filteredJobs);
          return filteredJobs;
        });
      })
      .then(function (data) {
        resolve(data);
      });
    })
    .then(function (data) {
      var finalArray = _.flatten(data);
      _.each(finalArray, function (job) {
        console.log(job);
        var resultObj = {
          title: job.title,
          company_name: job.company,
          url: job.url,
          description: job.description,
          visa_sponsored: null,
          remote_ok: null,
          relocation: null,
          created: job.created_at,
          city: job.location,
          company_id: job.company_id
        };
        // console.log('this is resultObj', resultObj);
        // console.log('job', job);
        // jobTable.addJob(resultObj);
      });
    });
  })
    .catch(function (err) {
      console.log('error in github api call', err);
    });
