// var mongoose = require('mongoose');
//
// module.exports = mongoose.model('User',{
//   username: String,
//   password: String,
//   email: String
// });
var schema = require('./schemas/ineffectiveProduct.js');
var Model = require('../models/base');

var IneffectiveProduct = new Model('ineffectiveProducts',schema);


module.exports = IneffectiveProduct;
