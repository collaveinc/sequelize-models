
Sequelize = require 'sequelize'

module.exports = ->
  model:
    time: Sequelize.DATE
    type: Sequelize.ENUM ['in', 'out', 'alive']
    challenge: Sequelize.TEXT
    signature: Sequelize.TEXT

  associations:
    belongsTo: 'User'
