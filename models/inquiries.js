// var mongoose = require('mongoose');
//
// module.exports = mongoose.model('User',{
//   username: String,
//   password: String,
//   email: String
// });
var schema = require('./schemas/inquiry.js');
var Model = require('../models/base');

var Inquiry = new Model('inquiries',schema);


module.exports = Inquiry;
