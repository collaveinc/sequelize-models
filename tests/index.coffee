
do ->

  class TestModel
  TestModel.hasOne =  (model, opts) -> console.log 'hasOne', opts
  TestModel.belongsTo = (model, opts) -> console.log 'belongsTo', opts
  TestModel.hasMany = (model, opts) -> console.log 'hasMany', opts
  TestModel.belongsToMany = (model, opts) -> console.log 'belongsToMany', opts

  sqModels = require '../src/index'

  sequelize =
    addHook: (hook) ->
      console.log '-- Added Hook'
    define: (name, model, options) ->
      console.log "-- Defining model: #{name}"
      return TestModel

  await sqModels sequelize, 'tests/sequelize-models'
