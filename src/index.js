const Client = require('./Client.js')
const config = require('./config.json')

const bot = new Client(config.token)

bot.launch()
