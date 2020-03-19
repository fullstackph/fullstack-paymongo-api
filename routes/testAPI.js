var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  var text = { text: "API is working properly" };
  res.json(text);
});

module.exports = router;
