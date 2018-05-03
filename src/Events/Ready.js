const Logger = require('../util/Logger.js')

module.exports = (bot) => {
  bot.on('ready', () => {
    Logger.info('Heroesbot connected')
  })
}
