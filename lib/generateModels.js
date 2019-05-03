// Generated by CoffeeScript 2.4.1
(function() {
  var _, applyAssociations, camelize, createModels, decamelize, extendModel, getType, plural;

  ({decamelize, camelize} = require('humps'));

  ({plural} = require('pluralize'));

  _ = require('lodash');

  getType = function(modules, value, field) {
    var current;
    current = modules.types[value];
    if (_.isFunction(current)) {
      return current({field});
    }
    return current;
  };

  extendModel = function(model) {
    // association helper
    return model.associateWith = function(models, method, content) {
      var alias, i, key, len, other, otherModel, results, targetKey, value;
      if (!content) {
        return;
      }
      if (_.isString(content)) {
        [other, alias, key, targetKey] = content.split(':');
        otherModel = other === '_' ? this : models[other];
        return this[method](models[other], {
          as: alias ? alias : void 0,
          foreignKey: key ? decamelize((key != null ? key : alias) + 'Id') : void 0,
          targetKey: targetKey ? targetKey : void 0
        });
      } else if (_.isObject(content)) {
        content.model = !content.model || content.model === '_' ? this : models[content.model];
        return this[method](models[other], content);
      } else if (_.isArray(content)) {
        results = [];
        for (i = 0, len = content.length; i < len; i++) {
          value = content[i];
          results.push(this.associateWith(method, models, value));
        }
        return results;
      }
    };
  };

  createModels = function(sequelize, modules) {
    var extension, extensions, i, key, len, method, methods, mixin, mixins, model, models, module, name, options, ref, sqModel;
    models = {};
    ref = modules.models;
    for (name in ref) {
      module = ref[name];
      if (_.isFunction(module)) {
        modules.models[name] = module = module();
      }
      ({model, options, mixins, extensions, methods} = module);
      // register mixins to model
      if (mixins) {
        if (_.isString(mixins)) {
          mixins = [mixins];
        }
        for (i = 0, len = mixins.length; i < len; i++) {
          mixin = mixins[i];
          model = _.assign(model, modules.mixins[mixin].model);
          extensions = _.assign(extensions, modules.mixins[mixin].extensions);
          methods = _.assign(extensions, modules.mixins[mixin].methods);
        }
      }
      // replace string-based types to actual types
      model = _.mapValues(model, function(value, key) {
        if (_.isString(value)) {
          return getType(modules, value, key);
        }
        if (_.isObject(value) && _.isString(value.type)) {
          value.type = getType(value.type, key);
        }
        return value;
      });
      options = _.assign(options || {}, {
        tableName: plural(decamelize(name))
      });
      // register model
      sqModel = models[name] = sequelize.define(camelize(name), model, options);
      // register extensions
      if (extensions != null) {
        for (key in extensions) {
          extension = extensions[key];
          sqModel[key] = extension;
        }
      }
      // register methods
      if (methods != null) {
        for (key in methods) {
          method = methods[key];
          sqModel.prototype[key] = method;
        }
      }
      extendModel(sqModel);
    }
    return models;
  };

  applyAssociations = function(models, modules) {
    var associations, belongsTo, belongsToMany, hasMany, hasOne, manyPairs, model, module, name, ref;
    manyPairs = [];
    ref = modules.models;
    for (name in ref) {
      module = ref[name];
      model = models[name];
      ({associations} = module);
      if (!associations) {
        continue;
      }
      ({hasOne, hasMany, belongsTo, belongsToMany} = associations);
      model.associateWith(models, 'hasOne', hasOne);
      model.associateWith(models, 'hasMany', hasMany);
      model.associateWith(models, 'belongsTo', belongsTo);
      if (!_.isArray(belongsToMany)) {
        belongsToMany = [belongsToMany];
      }
      if (belongsToMany != null) {
        belongsToMany.forEach(function(content) {
          var a, b, other, pair, through;
          if (_.isString(content)) {
            [other, through] = content.split(':');
            if (through != null) {
              return model.belongsToMany(models[other], {through});
            } else {
              pair = _.find(manyPairs, function(x) {
                var hasA, hasB;
                hasA = _.some(x, function(y) {
                  return y === name;
                });
                hasB = _.some(x, function(y) {
                  return y === other;
                });
                return hasA && hasB;
              });
              if (!pair) {
                manyPairs.push([name, other]);
              }
              a = plural(decamelize((pair != null ? pair[0] : void 0) || name));
              b = plural(decamelize((pair != null ? pair[1] : void 0) || other));
              return model.belongsToMany(models[other], {
                through: `${a}_${b}`
              });
            }
          } else if (_.isObject(content)) {
            content.model = models[content.model];
            return model.belongsToMany(models[other], content);
          }
        });
      }
    }
    return models;
  };

  module.exports = function(sequelize, modules) {
    var models;
    models = createModels(sequelize, modules);
    return applyAssociations(models, modules);
  };

}).call(this);