var __ = require('underscore');
var schemaObject = __.clone(require('./object.js'));

schemaObject.priority = 'number';


//exports.schema=schemaObject;
module.exports = schemaObject;
