// var mongoose = require('mongoose');
//
// module.exports = mongoose.model('User',{
//   username: String,
//   password: String,
//   email: String
// });
var schema = require('./schemas/keyword.js');
var Model = require('../models/base');

var Keyword = new Model('keywords',schema);

module.exports = Keyword;
