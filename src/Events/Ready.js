const { Logger } = require('../util.js')

module.exports = (bot) => {
  bot.on('ready', () => {
    Logger.info('Heroesbot connected')
  })
}
