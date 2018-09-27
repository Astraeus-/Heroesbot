const Client = require('./Client.js')
const {token} = require('./config.json')
const cron = require('node-cron')
const DataFetcher = require('./util/DataFetcher.js')
const util = require('./util/SyncRegionRoles.js')

const bot = new Client(token, {
  getAllUsers: true,
  disableEveryone: false
})
bot.launch()

cron.schedule('0 0 * * *', () => {
  DataFetcher.allTeamData()
})

cron.schedule('*/15 * * * *', () => {
  DataFetcher.matchesToday()
})

cron.schedule('*/30 * * * *', () => {
  util.syncRegionRoles(bot.bot)
})
