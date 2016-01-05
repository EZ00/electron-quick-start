// var mongoose = require('mongoose');
//
// module.exports = mongoose.model('User',{
//   username: String,
//   password: String,
//   email: String
// });
var ObjectID = require('mongodb').ObjectID;
var schema = require('./schemas/category.js');
var Model = require('../models/base');

var Category = new Model('categories',schema);

Category.findAll = function(done){
  var noop = function(){};
  done = done || noop;
  var opt = {
    "sort": [['number','asc']]
  }
  Category.collection.find({},opt).toArray(function(err,docs){
    done(err,docs);
  })
}

Category.insert = function(done){
  var noop = function(){};
  done = done || noop;
  var proto = Object.getPrototypeOf(this);
  proto.insert.call(this,function(err,doc){
    if(err){
      console.error(err);
    }
    else{
      if(doc.doc.level){
        var mod = {};
        mod[doc.doc.level] = 1;
        this.subcount.findAndModify(
         { name: this.collectionName },
         [],
         { $inc: mod },
         {new: true,upsert: true},
         function(err,r){
           //sconsole.log(r);
           done(err,doc);
        });
      }
    }
  }.bind(this))
}

Category.insertChild = function(done){
  var noop = function(){};
  done = done || noop;
  var proto = Object.getPrototypeOf(this);
  proto.insert.call(this,function(err,doc){
    if(err){
      console.error(err);
    }
    else{
      if(doc.doc.parents){
        var mod = {};
        mod[doc.doc.level] = 1;
        this.collection.update(
         { _id: {$in:doc.doc.parents} },
         { $addToSet: { children: doc._id } },
         {multi: true},
         function(err,r){
           //sconsole.log(r);
           done(err,doc);
        });
      }
    }
  }.bind(this))
}

Category.remove = function(docs,done){
  var noop = function(){};
  done = done || noop;
  for(var i=0;i<docs.length;i++){
    var objectId = ObjectID(docs[i]._id);
    for(var j=0;j<docs[i].parents.length;j++){
      docs[i].parents[j] = ObjectID(docs[i].parents[j]);
    }
    this.collection.remove({_id:objectId},function(err,r){
      if(err){
        console.error(err);
      }
      else{
        if(this.parents.length > 0){
          this.collection.update(
           { _id: {$in:this.parents} },
           { $pull: { children: this._id } },
           {multi: true},
           function(err,r){
             //sconsole.log(r);
          }.bind(this));
        }
        done(err,{_id:this._id,parents:this.parents});
      }
    }.bind({collection:this.collection,parents:docs[i].parents,_id:objectId}))
  }
}

Category.moveUp = function(data,done){
  var noop = function(){};
  done = done || noop;
  Category.collection.findOne({_id:data._id},function(err,doc){
    if(err){
      console.error(err);
    }
    else{
      Category.collection.find({level:doc.level},{},{$sort:[["number","asc"]]}).toArray(function(err,docs){
        var source = {};
        source._id = doc._id;
        var target = {};
        target.number = doc.number;
        var first = docs[0].number;
        var last = docs[docs.length-1].number;
        if(doc.number === first){
          source.number = last;
          target._id = docs[docs.length-1]._id;
        }
        else{
          for(var i=0;i<docs.length;i++){
            if(docs[i].number === doc.number){
              source.number = docs[i-1].number;
              target._id = docs[i-1]._id;
              break;
            }
          }
        }
        var newDocs = [source,target];
        Category.batchUpdateById(newDocs,function(){
          done(null,newDocs);
        })
      })
    }
  })
}
Category.moveDown = function(data,done){
  var noop = function(){};
  done = done || noop;
  var _id = ObjectID(data._id);
  Category.collection.findOne({_id:_id},function(err,doc){
    if(err){
      console.error(err);
    }
    else{
      console.log(doc);
      Category.collection.find({level:doc.level},{},{$sort:[["number","asc"]]}).toArray(function(err,docs){
        var source = {};
        source._id = doc._id;
        var target = {};
        target.number = doc.number;
        var first = docs[0].number;
        var last = docs[docs.length-1].number;
        if(doc.number === last){
          source.number = first;
          target._id = docs[0]._id;
        }
        else{
          for(var i=0;i<docs.length;i++){
            if(docs[i].number === doc.number){
              source.number = docs[i+1].number;
              target._id = docs[i+1]._id;
              break;
            }
          }
        }
        var newDocs = [source,target];
        Category.batchUpdateById(newDocs,function(){
          done(null,newDocs);
        })
      })
    }
  })
}
Category.deleteById = function(_id,status,done){
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

Category.updateOneById = function(id,newDoc,oldStatus,done){
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

Category.updateOneByLocalId = function(id,newDoc,oldStatus,done){
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

Category.findFirstLevels = function(done){
  var noop = function(){};
  done = done || noop;
  this.collection.find({level:1}).toArray(function(err,docs){
    done(err,docs);
  });
}

module.exports = Category;
