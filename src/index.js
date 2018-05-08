const Client = require('./Client.js')
const config = require('./config.json')
const cron = require('node-cron')
const DataFetcher = require('./util/DataFetcher.js')
const Logger = require('./util/Logger.js')

const bot = new Client(config.token)
bot.launch()

cron.schedule('0 0 * * *', () => {
  Logger.info('Updating all Teamdata cache')
  DataFetcher.allTeamData()
})

cron.schedule('*/15 * * * *', () => {
  Logger.info('Updating MatchesToday cache')
  DataFetcher.matchesToday()
})
