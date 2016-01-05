var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.firstName = "string";
schemaObject.gmtModify = 'string';
schemaObject.aid = 'number';
schemaObject.imageURL = 'string';
schemaObject.isDeletedInP4P = 'boolean';
schemaObject.isKwSearch = 'string';
schemaObject.isP4PProduct = 'boolean';
schemaObject.isShowcase = 'string';
schemaObject.lastName = 'string';
schemaObject.noeffDays = 'number';
schemaObject.sid = 'string';
schemaObject.subject = 'string';
module.exports=schemaObject;
