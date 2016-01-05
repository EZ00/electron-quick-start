var env = require('../env');
var database = require('../db');
var ObjectID = require('mongodb').ObjectID;
var events = require('events');
var bCrypt = require('bcrypt-nodejs');
var __ = require('underscore');

var inits = {};
inits['string'] = function(prop,newDoc,done){
  if(!(this.props[prop]===undefined)){
    if(typeof this.props[prop] === 'string'){
      newDoc[prop] = this.props[prop];
      done()
    }
    else{
      var msg = prop+' is not a string.';
      console.error(msg);
      done(msg);
      //return false;
    }
  }
  else{
    var msg = 'missing property: '+ prop;
    console.error(msg);
    done(msg);
    //return false;
  }
}

var Base = function(colName,schema) {
  this.props = {};
  this.db = database;
	this.collectionName = colName;
  this.collection = this.db.collection(this.collectionName);
  //console.log('this.collection',this.collection);
  this.counters = this.db.collection(env.counter_collection);
  this.subcount = this.db.collection("subcount");
  this.blanks = this.db.collection("blanks");
  this.histories = this.db.collection(this.collectionName+'h');
  this.schema = schema;
  this.inits = inits;
};

Base.prototype = {
	extend: function(properties) {
		var Child = module.exports;
		Child.prototype = module.exports.prototype;
		for(var key in properties) {
			Child.prototype[key] = properties[key];
		}
		return Child;
	},
	setDB: function(db) {
		this.db = db;
	},
  insert: function(done){
    var noop = function(){};
    done = done || noop;
    var newDoc = {};
    var autoIncProp = null;
    var waitCounter = 1;
    var eventCenter = new events.EventEmitter();
    eventCenter.on('d',function(){
      waitCounter = waitCounter - 1;
      if(waitCounter === 0){
        //insert the newDoc
        //console.log('this.collection',this);
        //console.log('before insert to collection newDoc: ',newDoc);
        // if the counter doc exists, newDoc[autoIncProp] = the counter +1,else newDoc[autoIncProp] = 1
        this.counters.findOne({ name: this.collectionName },function(err,doc){
          if(doc){
            newDoc[autoIncProp] = doc.seq+1;
          }
          else{
            newDoc[autoIncProp] = 1;
          }
          this.collection.insert(newDoc,function(err,insertedDoc){
            //inserted
            //update the counter
            this.counters.findAndModify(
             { name: this.collectionName },
             [],
             { $inc: { seq: 1 } },
             {new: true,upsert: true},
             function(err,doc){
               if(err){
                 //console.log(err);
                 done(err);
                 return false;
               }
               //console.log('counter inserted: ',doc);
               //console.log('after insert to collection newDoc: ',newDoc);
               //console.log('after insert to collection doc: ',doc);
               //console.log('after insert to collection doc._id: ',doc._id);
               //console.log('after insert to collection newDoc._id: ',newDoc._id);
               var orgDoc = __.clone(newDoc);
               newDoc.itemId = newDoc._id;
               delete newDoc._id;
               delete newDoc.timeCreated;
               newDoc.editorId = newDoc.creatorId;
               delete newDoc.creatorId;
               delete newDoc.creatorName;
               //console.log('before insert to histories newDoc: ',newDoc);
               this.histories.insert(newDoc,function(err,doc){
                 //console.log("insertedDoc:",insertedDoc);
                 done(null,{_id:newDoc.itemId,doc:orgDoc});
               })
              }.bind(this)
            );
          }.bind(this));
        }.bind(this))
      }
    }.bind(this));
    //console.log(this.schema);
    for(var prop in this.schema){
      //init newDoc according to its type
      var type = this.schema[prop];
      if(prop === 'editorId'){
        newDoc['editorId'] = this.props['creatorId'];
      }
      else if(prop === 'editorName'){
        newDoc['editorName'] = this.props['creatorName'];
      }
      else if(this.schema[prop] === 'string'){
        waitCounter = waitCounter+1;
        this.inits['string'].call(this,prop,newDoc,function(err){
          if(err){
          }
          else{
            eventCenter.emit('d');
          }
        })
      }
      else if(this.schema[prop] === 'autoInc'){
        autoIncProp = prop;
        //waitCounter = waitCounter + 1;
        //TODO: test this javascript feature
        // this.counters.findAndModify(
        //    { name: this.collectionName },
        //    [],
        //    { $inc: { seq: 1 } },
        //    {new: true,upsert: true},
        //    function(err,doc){
        //      if(err){
        //        console.log(err);
        //        done(err);
        //        return false;
        //      }
        //      console.log('counter inserted: ',doc);
        //      newDoc[autoIncProp]=doc.value.seq;
        //      eventCenter.emit('d');
        //    }
        // );
      }
      else if(this.schema[prop] === 'userId'){
        if(!(this.props[prop]===undefined)){
          //TODO: check type or length
          //console.log('base.js userId: '+this.props[prop]);
          newDoc[prop] = ObjectID(this.props[prop]);
        }
        else{
          console.error('missing property: '+ prop);
          done('missing property: '+ prop)
          return false;
        }
      }
      else if(this.schema[prop] === 'timeCreated'){
        newDoc[prop] = new Date();
      }
      else if(this.schema[prop] === 'timeModified'){
        newDoc[prop] = new Date();
      }
      else if(this.schema[prop] === 'number'){
        if(!(this.props[prop]===undefined)){
          if(typeof this.props[prop] === 'number'){
            newDoc[prop] = this.props[prop];
          }
          else{
            console.error(prop+' is not a number.')
            done(prop+' is not a number.');
            return false;
          }
        }
        else{
          console.error('missing property: '+ prop);
          done('missing property: '+ prop)
          return false;
        }
      }
      else if(this.schema[prop] === 'array'){
        if(!(this.props[prop]===undefined)){
          if(Array.isArray(this.props[prop])){
            newDoc[prop] = this.props[prop];
          }
          else{
            console.error(prop+' is not a array.')
            done(prop+' is not a array.');
            return false;
          }
        }
        else{
          console.error('missing property: '+ prop);
          done('missing property: '+ prop)
          return false;
        }
      }
      else if(this.schema[prop] === 'password'){
        //TODO: check for exists
        newDoc[prop] = bCrypt.hashSync(this.props[prop], bCrypt.genSaltSync(10), null);
      }
      else if(this.schema[prop] === 'boolean'){
        if(!(this.props[prop]===undefined)){
          if(typeof this.props[prop] === 'boolean'){
            newDoc[prop] = this.props[prop];
          }
          else{
            console.error(prop+' is not a boolean.')
            done(prop+' is not a boolean.');
            return false;
          }
        }
        else{
          console.error('missing property: '+ prop);
          done('missing property: '+ prop)
          return false;
        }
      }
      else if(type === 'policy'){
        if(!(this.props[prop]===undefined)){
          if(typeof this.props[prop] === 'string'){
            var policy = JSON.parse(this.props[prop]);
            if(policy.type){
              if(policy.type === 'public'){
                newDoc[prop] = JSON.stringify({type:'public'});
              }
              else if(policy.type === 'all users'){
                newDoc[prop] = JSON.stringify({type:'all users'});
              }
              else if(policy.type === 'users'){
                //check if user exists
                if(policy.users){
                  if( Object.prototype.toString.call( policy.users ) === '[object Array]' ) {
                    //TODO: check if user exists
                    newDoc[prop] = JSON.stringify({type:'users',users:policy.users});
                  }
                  else{
                    console.log('policy.users is not a array')
                    return false;
                  }
                }
                else{
                  console.log('policy.users is undefined')
                  return false;
                }
              }
              else if(policy.type === 'groups'){
                //TODO: check if groups exists
                newDoc[prop] = JSON.stringify({type:'all users',groups:policy.groups});
              }
              else if(policy.type === 'ug'){
                //TODO: check if users and group exists
                newDoc[prop] = JSON.stringify({type:'ug',users:policy.users,groups:policy.groups});
              }
            }
            else{
              console.error('policy.type is undefined');
              return false;
            }
          }
          else{
            console.error(prop+' is not a string.')
            done(prop+' is not a string.');
            return false;
          }
        }
        else{
          console.error('missing property: '+ prop);
          done('missing property: '+ prop)
          return false;
        }
      }
      else{
        var msg = 'base.js the property: "'+prop+'" has a invalid type';
        console.error(msg);
        done(msg);
        return false;
      }
    }
    eventCenter.emit('d');
  },
  updateOneById: function(id,doc,done){
    var noop = function(){};
    done = done || noop;
    var objectId = new ObjectID(id);
    doc.timeModified = new Date();
    this.collection.update({_id:objectId},{$set:doc},function(err,count,result){
      console.log('Base.js updateOneById');
      console.log(err);
      console.log(count);
      console.log(result);
      done(err,count);
    })
  },
  updateOneByLocalId: function(id,doc,done){
    var noop = function(){};
    done = done || noop;
    doc.timeModified = new Date();
    // the doc here says collection.update has 3 params https://mongodb.github.io/node-mongodb-native/markdown-docs/insert.html#update
    this.collection.findAndModify({id:id},[],{$set:doc},{},function(err,originalDoc){
      // console.log('Base.js updateOneByLocalId');
      // console.log(err);
      // console.log(count);
      // console.log(result);
      if(!err){
        //console.log(originalDoc);
        var oldDoc = originalDoc.value;
        for(prop in doc){
          oldDoc[prop] = doc[prop];
        }
        oldDoc.itemId = oldDoc._id;
        delete oldDoc._id;
        delete oldDoc.timeCreated;
        delete oldDoc.creatorId;
        delete oldDoc.creatorName;
        //console.log('oldDoc:\n',oldDoc);
        this.histories.insert(oldDoc,function(err,doc){
          done(err);
        })
      }
    }.bind(this))
  },
  findOneById: function(id,done){
    var noop = function(){};
    done = done || noop;
    var objectId = new ObjectID(id);
    this.collection.findOne({_id:objectId},function(err,doc){
      done(err,doc);
    })
  },
  findOneByLocalId: function(id,done){
    var noop = function(){};
    done = done || noop;
    this.collection.findOne({id:id},function(err,doc){
      // console.log({id:id},err,doc);
      done(err,doc);
    })
  },
  findAll: function(done){
    var noop = function(){};
    done = done || noop;
    this.collection.find({}).toArray(function(err,docs){
      done(err,docs);
    });
  },
  findAllAndCounter: function(options,done){
    var noop = function(){};
    done = done || noop;
    var opt = {
      "sort": [['timeModified','desc']]
    }
    options = options || opt;
    this.collection.find({},options).toArray(function(err,docs){
      if(err){
        done(err)
      }
      else{
        this.counters.findOne({name:this.collectionName},function(err,counter){
          done(err,docs,counter)
        })
      }
    }.bind(this));
  },
  findAllAndCounts: function(options,done){
    var noop = function(){};
    done = done || noop;
    var opt = {
      "sort": [['priority','desc'],['timeModified','desc']]
    }
    options = options || opt;
    this.collection.find({},options).toArray(function(err,docs){
      if(err){
        done(err)
      }
      else{
        this.subcount.findOne({name:this.collectionName},function(err,counts){
          done(err,docs,counts)
        })
      }
    }.bind(this));
  },
  deleteById: function(_id,done){
    var noop = function(){};
    done = done || noop;
    this.collection.remove({_id:_id},{single:true},function(err,result){
      done(err,result);
    })
  },
  batchUpdateById: function(newDocs,done){
    var noop = function(){};
    done = done || noop;
    var upCount = 0;
    for(var i=0;i<newDocs.length;i++){
      var _id=newDocs[i]._id;
      delete newDocs[i]._id;
      var newDoc = {number:0};
      for(var key in newDocs[i]){
        newDoc[key] = newDocs[i][key];
      }
      console.log("newDoc",newDoc);
      this.collection.update({_id:_id},{$set:newDoc},function(err,result){
        if(err){
          console.error(err);
        }
        else{
          upCount += 1;
          if(upCount === newDocs.length){
            done()
          }
        }
      })
    }
  }
}

module.exports = Base;

// exports.all = function(cb) {
//   var collection = db.get().collection('comments')
//
//   collection.find().toArray(function(err, docs) {
//     cb(err, docs)
//   })
// }
//
// exports.recent = function(cb) {
//   var collection = db.get().collection('comments')
//
//   collection.find().sort({'date': -1}).limit(100).toArray(function(err, docs) {
//     cb(err, docs)
//   })
// }
