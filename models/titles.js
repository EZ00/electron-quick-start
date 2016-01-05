// var mongoose = require('mongoose');
//
// module.exports = mongoose.model('User',{
//   username: String,
//   password: String,
//   email: String
// });
var schema = require('./schemas/title.js');
var Model = require('../models/base');

var Title = new Model('titles',schema);

module.exports = Title;
