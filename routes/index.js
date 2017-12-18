var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('index.html');
});

router.get('/house', function(req, res, next) {
  res.send('house.html');
});

router.get('/fund', function(req, res, next) {
  res.send('fund.html');
});

router.get('/post', function(req, res, next) {
  res.send('post.html');
});

router.get('/test', function(req, res, next) {
  res.send('test.html');
});

module.exports = router;
