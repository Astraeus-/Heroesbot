const Client = require('./Client.js')
const config = require('./config.json')
const cron = require('node-cron')
const DataFetcher = require('./util/DataFetcher.js')

const bot = new Client(config.token, {
  disableEveryone: false
})
bot.launch()

cron.schedule('0 0 * * *', () => {
  DataFetcher.allTeamData()
})

cron.schedule('*/15 * * * *', () => {
  DataFetcher.matchesToday()
})


/*

Bugs:
- Patreon VIP did not get updated when a new one arrived.
- Users are not always inside of the cache, thus creating errors when trying to take actions on them. (We need to try to force retrieve them)

API:
- Update Heroes Lounge API response handler to first check the res.statusCode header before trying to parse data -> We may already know that the response is invalid, yet try to parse data from it anyway.

Bugs:
- Matches that belong to a playoff have their match scheduled, but the teams playing are still TBH, so it can't fetch their data.
- Playoff matches that are casted can have a channel assigned, but do not always have casters assigned to them.
- When updating matches today cache, sometimes it can't find the teams belonging to the match.
- parse JSON response error -> Maybe related to users scheduling the match and it bugging somehow like that.


/*
