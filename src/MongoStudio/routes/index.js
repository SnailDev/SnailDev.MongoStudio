var express = require('express');
var router = express.Router();
var db = require('../util/db');

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







// api
router.post('/getserver', function (req, res, next) {
  var type = req.query.type;

  var result = null;
  switch (type) {
    case "1":
      result = db.getservers();
      break;
    default:
      break;
  }

  res.json(result);
});

module.exports = router;
