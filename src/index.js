const Client = require('./Client.js')
const { token } = require('./config.json')
const cron = require('node-cron')

const client = new Client(token, {
  getAllUsers: true,
  disableEveryone: false
})

let regionTask = cron.schedule('0 0 * * *', () => {
  client.bot.commands.get('assignregion').exec()
}, {
  scheduled: false
})

let remindTask = cron.schedule('* * * * *', () => {
  client.bot.commands.get('remind').remind()
}, {
  scheduled: false
})

client.launch().then(() => {
  regionTask.start()
  remindTask.start()
})
