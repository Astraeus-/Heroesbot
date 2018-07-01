const Client = require('./Client.js')
const config = require('./config.json')
const cron = require('node-cron')
const DataFetcher = require('./util/DataFetcher.js')

const bot = new Client(config.token, {
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
