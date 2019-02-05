const Client = require('./Client.js')
const { token } = require('./config.json')
const cron = require('node-cron')
const { syncRegionRoles } = require('./util/SyncRoles.js')

const bot = new Client(token, {
  getAllUsers: true,
  disableEveryone: false
})
bot.launch()

cron.schedule('0 */2 * * *', () => {
  syncRegionRoles(bot.bot)
})
