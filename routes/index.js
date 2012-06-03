var db = require('../db');
var express = require('express');
var spawn = require('child_process').spawn;

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index', {
      title: 'LGBTrights.me',
      subtitle: 'Rights where you are'
    });
  });
  app.get('/add-info', function(req, res) {
    res.render('add-info', {
      title: 'Admin',
      subtitle: 'Rights where you are'
    });
  });
  app.get('/moreinfo', express.query(), function(req, res) {
    res.render('more_info', {
      key: req.query.key,
      right: req.query.right
    });
  });
  app.get('/rights', express.query(), function(req, res) {
    db.rights(req.query.state, req.query.county, req.query.city, function(err, data) {
      res.send(data);
    });
  });
  app.get('/list', express.query(), function(req, res) {
    var q = typeof(req.query.q) == 'String' ? q : '*'; // wildcard query string for redis.keys
    db.list(q, function(err, data){
      res.send(data);
    });
  });
  app.post('/load', function(req, res) {
    db.load(req.body, function(err, data){
      if (err) return res.send(err);
      res.send(data);
    });
  });
  app.get('/reload', function(req, res) {
    var url = '';
    var port = 0;

    if (process.env.REDISTOGO_URL) {
      url = "lgbtrights.me";
      port = 80;
    } else {
      url = "localhost";
      port = 3000;
    }
    spawn('ruby', ['download_data.rb', url, port]);

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.send('{"success": true}');
  });
};
