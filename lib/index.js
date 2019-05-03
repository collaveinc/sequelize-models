// Generated by CoffeeScript 2.4.1
(function() {
  var _, folderToObject, generateModels;

  folderToObject = require('@collaveinc/folder-to-object');

  generateModels = require('./generateModels');

  _ = require('lodash');

  module.exports = async function(sequelize, cwd) {
    var modules;
    // decamelize all fields
    sequelize.addHook('beforeDefine', function(attrs) {
      var i, key, len, ref, results;
      ref = _.keys(attrs);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        if (_.isFunction(attrs[key])) {
          results.push(attrs[key] = {
            type: attrs[key],
            field: decamelize(key)
          });
        } else {
          results.push(attrs[key].field = decamelize(key));
        }
      }
      return results;
    });
    modules = (await folderToObject.async(cwd || process.cwd));
    return generateModels(sequelize, modules);
  };

}).call(this);