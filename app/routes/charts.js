var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  var data = {};
  res.render('charts', data);
});

module.exports = router;
