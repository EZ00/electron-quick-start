// var mongoose = require('mongoose');
//
// module.exports = mongoose.model('User',{
//   username: String,
//   password: String,
//   email: String
// });
var schema = require('./schemas/alirank.js');
var Model = require('../models/base');

var Alirank = new Model('aliranks',schema);

module.exports = Alirank;
