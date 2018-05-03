const Logger = require('../util/Logger.js')

module.exports = (bot) => {
  bot.on('disconnect', (error) => {
    Logger.info(`Heroesbot disconnected ${error}. Reconnecting...`)
  })
}
