// var mongoose = require('mongoose');
//
// module.exports = mongoose.model('User',{
//   username: String,
//   password: String,
//   email: String
// });
var schema = require('./schemas/product.js');
var Model = require('../models/base');

var Product = new Model('products',schema);

Product.insert = function(done){
  var noop = function(){};
  done = done || noop;
  var proto = Object.getPrototypeOf(this);
  proto.insert.call(this,function(err,doc){
    if(err){
    }
    else{
      if(doc.doc.status){
        var mod = {};
        mod[doc.doc.status] = 1;
        this.subcount.findAndModify(
         { name: this.collectionName },
         [],
         { $inc: mod },
         {new: true,upsert: true},
         function(err,r){
           done(err,doc);
        });
      }
    }
  }.bind(this))
}

Product.deleteById = function(_id,status,done){
  var noop = function(){};
  done = done || noop;
  var proto = Object.getPrototypeOf(this);
  proto.deleteById.call(this,_id,function(err,result){
    // console.log('delete task by id:');
    // console.log(result);
    if(err){
      // console.error(err);
      done(err,result);
    }
    else if(result.result.n === 1){
      var mod = {};
      mod[status] = -1;
      this.subcount.update({name:this.collectionName},{ $inc: mod },{},function(err,result){
        done(err,result);
      })
    }
    else{
      console.error('result not === 1');
      done(err,result);
    }
  }.bind(this))
}

Product.updateOneById = function(id,newDoc,oldStatus,done){
  var noop = function(){};
  done = done || noop;
  var proto = Object.getPrototypeOf(this);
  proto.updateOneById.call(this,id,newDoc,function(err,count){
    if(err){
    }
    else{
      if(count && newDoc.status !== oldStatus){
        var mod = {};
        mod[newDoc.status] = 1;
        mod[oldStatus] = -1;
        this.subcount.findAndModify(
         { name: this.collectionName },
         [],
         { $inc: mod },
         {new: true,upsert: true},
         function(err,r){
           done(err,id);
        });
      }
    }
  }.bind(this))
}

Product.updateOneByLocalId = function(id,newDoc,oldStatus,done){
  var noop = function(){};
  done = done || noop;
  var proto = Object.getPrototypeOf(this);
  proto.updateOneByLocalId.call(this,id,newDoc,function(err){
    if(err){
    }
    else{
      if(newDoc.status !== oldStatus){
        console.log('nModified===1 && newDoc.status !== oldStatus');
        var mod = {};
        mod[newDoc.status] = 1;
        mod[oldStatus] = -1;
        this.subcount.findAndModify(
         { name: this.collectionName },
         [],
         { $inc: mod },
         {new: true,upsert: true},
         function(err,r){
           done(err,id);
        });
      }
      else{
        done(err,id);
      }
    }
  }.bind(this))
}

module.exports = Product;
