var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.content = "string";
schemaObject.for = 'objectid';
module.exports=schemaObject;
