const Logger = require('../util/Logger.js')

module.exports = (bot) => {
  bot.on('error', (error, id) => {
    Logger.error(`Error ${id}:`, error)
  })
}
