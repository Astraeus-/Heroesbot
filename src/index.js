const Client = require('./Client.js')
const { token } = require('./config.json')
const cron = require('node-cron')
const { syncRegionRoles } = require('./util/SyncRoles.js')

const client = new Client(token, {
  getAllUsers: true,
  disableEveryone: false
})
client.launch()

cron.schedule('0 0 * * *', () => {
  syncRegionRoles(client.bot)
})
