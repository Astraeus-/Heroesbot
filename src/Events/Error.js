const { Logger } = require('../util.js')

module.exports = (bot) => {
  bot.on('error', (error, id) => {
    Logger.error(`Error ${id}:`, error)
  })
}
