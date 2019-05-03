
{ decamelize, camelize } = require 'humps'
{ plural } = require 'pluralize'
_ = require 'lodash'

getType = (modules, value, field) ->
  current = modules.types[value]
  return current { field } if _.isFunction current
  return current

extendModel = (model) ->
  # association helper
  model.associateWith = (models, method, content) ->
    return unless content
    if _.isString content
      [other, alias, key, targetKey] = content.split ':'
      otherModel = if other is '_' then @ else models[other]
      @[method] models[other],
        as: alias if alias
        foreignKey: decamelize (key ? alias) + 'Id' if key
        targetKey: targetKey if targetKey

    else if _.isObject content
      content.model = if not content.model or content.model is '_' then @ else models[content.model]
      @[method] models[other], content

    else if _.isArray content
      for value in content
        @associateWith method, models, value

createModels = (sequelize, modules) ->
  models = {}
  for name, module of modules.models
    modules.models[name] = module = module() if _.isFunction module
    { model, options, mixins, extensions, methods } = module

    # register mixins to model
    if mixins
      mixins = [mixins] if _.isString mixins
      for mixin in mixins
        model = _.assign model, modules.mixins[mixin].model
        extensions = _.assign extensions, modules.mixins[mixin].extensions
        methods = _.assign extensions, modules.mixins[mixin].methods

    # replace string-based types to actual types
    model = _.mapValues model, (value, key) ->
      return getType modules, value, key if _.isString value
      if _.isObject(value) and _.isString(value.type)
        value.type = getType value.type, key
      return value

    options = _.assign options or {},
      tableName: plural decamelize name

    # register model
    sqModel = models[name] = sequelize.define camelize(name), model, options

    # register extensions
    if extensions?
      for key, extension of extensions
        sqModel[key] = extension

    # register methods
    if methods?
      for key, method of methods
        sqModel.prototype[key] = method

    extendModel sqModel

  return models

applyAssociations = (models, modules) ->
  manyPairs = []
  for name, module of modules.models
    model = models[name]
    { associations } = module
    continue unless associations

    { hasOne, hasMany, belongsTo, belongsToMany } = associations
    model.associateWith models, 'hasOne', hasOne
    model.associateWith models, 'hasMany', hasMany
    model.associateWith models, 'belongsTo', belongsTo

    belongsToMany = [belongsToMany] unless _.isArray belongsToMany
    belongsToMany?.forEach (content) ->
      if _.isString content
        [other, through] = content.split ':'

        if through?
          model.belongsToMany models[other], { through }

        else
          pair = _.find manyPairs, (x) ->
            hasA = _.some x, (y) -> y is name
            hasB = _.some x, (y) -> y is other
            hasA and hasB

          manyPairs.push [name, other] unless pair
          a = plural decamelize (pair?[0] or name)
          b = plural decamelize (pair?[1] or other)

          model.belongsToMany models[other], through: "#{a}_#{b}"

      else if _.isObject content
        content.model = models[content.model]
        model.belongsToMany models[other], content

  return models

module.exports = (sequelize, modules) ->
  models = createModels sequelize, modules
  return applyAssociations models, modules
