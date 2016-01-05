var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.name = "string";
schemaObject.email = 'string';
schemaObject.company = 'string';
schemaObject.phone = 'string';
schemaObject.content = 'string';
module.exports=schemaObject;
