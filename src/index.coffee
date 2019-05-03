
folderToObject = require '@collaveinc/folder-to-object'
generateModels = require './generateModels'
_ = require 'lodash'

module.exports = (sequelize, cwd) ->

  # decamelize all fields
  sequelize.addHook 'beforeDefine', (attrs) ->
    for key in _.keys attrs
      if _.isFunction attrs[key]
        attrs[key] = { type: attrs[key], field: decamelize key }
      else
        attrs[key].field = decamelize key

  modules = await folderToObject.async cwd or process.cwd
  return generateModels sequelize, modules
