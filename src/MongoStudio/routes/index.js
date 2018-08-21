var express = require('express');
var router = express.Router();
var mongo = require('../util/db');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'MongoStudio' });
});

router.get('/introduction', function (req, res, next) {
  res.render('introduction', { title: 'Introduction' });
});

router.get('/updatehistory', function (req, res, next) {
  res.render('updatehistory', { title: 'Updatehistory' });
});

router.get('/showdata', function (req, res, next) {
  res.render('showdata', { title: 'ShowData', server: req.query.server, db: req.query.db, col: req.query.col, serverName: req.query.serverName });
});

router.get('/showdatadetail', function (req, res, next) {
  res.render('showdatadetail', { title: 'ShowDataDetail' });
});

router.get('/showexportoptions', function (req, res, next) {
  res.render('showexportoptions', { title: 'ShowExportOptions' });
});

// api
router.post('/getserver', function (req, res, next) {
  var infoReturn = function (result) { res.json(result); };

  var id = req.query.id;
  var type = req.query.type;

  switch (type) {
    case 'server':
      mongo.getservers(infoReturn);
      break;
    case 'db':
      var server = req.query.server;
      mongo.getdbs(id, server, infoReturn);
      break;
    case 'col':
      var server = req.query.server;
      var db = req.query.db;
      mongo.getcols(id, server, db, infoReturn);
      break;
    case 'indexContainer':
      mongo.getindexContainer(id, infoReturn);
      break;
    case 'index':
      var server = req.query.server;
      var db = req.query.db;
      var col = req.query.col;
      mongo.getindexes(id, server, db, col, infoReturn);
      break;
    default:
      res.json([]);
      break;
  }
});

router.post('/getdata', function (req, res, next) {
  var dataReturn = function (result) { res.json(result); };

  var server = req.body.server;
  var db = req.body.db;
  var col = req.body.col;
  var jsonfind = mongo.handleJsonFind(JSON.parse(req.body.jsonfind || "{}"));
  var jsonfield = JSON.parse(req.body.jsonfield || "{}");
  var jsonsort = JSON.parse(req.body.jsonsort || "{ \"_id\": 1 }");
  var skip = parseInt(req.body.skip || 0);
  var limit = parseInt(req.body.limit || 30);
  var page = parseInt(req.body.page || 1);
  var pageSize = parseInt(req.body.pagesize || 30);
  var viewType = parseInt(req.body.type || 0);
  var isPager = parseInt(req.body.isPager || 1);

  mongo.getdata(server, db, col, jsonfind, jsonfield, jsonsort, skip, limit, page, pageSize, viewType, isPager, dataReturn);
});

router.post('/getdatadetail', function (req, res, next) {
  var dataReturn = function (result) { res.json(result); };

  var server = req.body.server;
  var db = req.body.db;
  var col = req.body.col;
  var jsonfield = JSON.parse(req.body.jsonfield || "{}");
  var id = req.body.did;
  mongo.getdatadetail(server, db, col, id, jsonfield, dataReturn);
});

router.post('/explain', function (req, res, next) {
  var dataReturn = function (result) { res.json(result); };

  var server = req.body.server;
  var db = req.body.db;
  var col = req.body.col;
  var jsonfind =  mongo.handleJsonFind(JSON.parse(req.body.jsonfind || "{}"));
  var jsonfield = JSON.parse(req.body.jsonfield || "{}");
  var jsonsort = JSON.parse(req.body.jsonsort || "{ \"_id\": 1 }");
  var skip = parseInt(req.body.skip || 0);
  var limit = parseInt(req.body.limit || 30);

  mongo.explain(server, db, col, jsonfind, jsonfield, jsonsort, skip, limit, dataReturn);
});


module.exports = router;
