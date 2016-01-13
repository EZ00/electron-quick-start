var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.aliId = "string";
schemaObject.title = 'string';
schemaObject.timeUpdated = 'timeModified';
schemaObject.pn = 'number';
schemaObject.position = 'number';
schemaObject.pnc = 'number';
schemaObject.positionc = 'number';
schemaObject.notIn = 'number';
schemaObject.type = 'string';


//exports.schema=schemaObject;
module.exports = schemaObject;
