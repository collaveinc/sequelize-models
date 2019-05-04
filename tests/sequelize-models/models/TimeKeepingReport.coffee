
Sequelize = require 'sequelize'

module.exports = ->
  model:
    report: Sequelize.JSONB

  associations:
    belongsTo: 'User'
