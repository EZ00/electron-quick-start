// var mongoose = require('mongoose');
//
// module.exports = mongoose.model('User',{
//   username: String,
//   password: String,
//   email: String
// });
var schema = require('./schemas/test.js');
var Model = require('../models/base');

var Test = new Model('tests',schema);

module.exports = Test;
