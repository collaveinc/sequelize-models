
Sequelize = require 'sequelize'

module.exports = ->
  model:
    id: 'ID'
    serial: 'Serial'
    name: { type: Sequelize.TEXT, unique: true }
    password: Sequelize.TEXT
    role: Sequelize.TEXT

  associations:
    belongsTo: 'User'

  methods:
    getProject: ->
      console.log 'Hello World'
