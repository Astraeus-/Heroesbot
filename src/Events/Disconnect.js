const { Logger } = require('../util.js')

module.exports = (bot) => {
  bot.on('disconnect', (error) => {
    Logger.info(`Heroesbot disconnected ${error}. Reconnecting...`)
  })
}
