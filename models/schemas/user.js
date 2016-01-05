var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.username = "string";
schemaObject.password = 'password';
schemaObject.isAdmin = 'boolean';
module.exports=schemaObject;
