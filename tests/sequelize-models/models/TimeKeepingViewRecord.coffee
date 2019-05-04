
Sequelize = require 'sequelize'

module.exports = ->
  model:
    date: Sequelize.DATE
    timeIn: Sequelize.DATE
    timeOut: Sequelize.DATE
    isLate: Sequelize.BOOLEAN
    isAbsent: Sequelize.BOOLEAN

  associations:
    belongsTo: ['User', 'TimeKeepingReport']
