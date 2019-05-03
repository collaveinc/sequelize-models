
Sequelize = require 'sequelize'

module.exports = ->
  type: Sequelize.UUID
  primaryKey: true
  defaultValue: Sequelize.UUIDV4
