// var mongoose = require('mongoose');
//
// module.exports = mongoose.model('User',{
//   username: String,
//   password: String,
//   email: String
// });
var bCrypt = require('bcrypt-nodejs');
var schemaUser = require('./schemas/user.js');
var Model = require('../models/base');

var User = new Model('users',schemaUser);

User.isValidPassword=function(user, password){
    return bCrypt.compareSync(password, user.password);
}

User.getUserNames=function(done){
  this.collection.find({},{fields:{_id:1,username:1}}).toArray(function(err,docs){
    //console.log(docs);
    // var names = [];
    // for(var i=0;i<docs.length;i++){
    //   names.push(docs[i].username);
    // }
    done(err,docs);
  });
}
module.exports = User;
