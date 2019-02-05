const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const DataFetcher = require('../util/DataFetcher.js')

class UpdateCache extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: ['108153813143126016']
      }
    }

    const options = {
      prefix: '!',
      command: 'updatecache',
      description: 'Updates the Heroesbot cache files.',
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    const TeamData = DataFetcher.allTeamData()
    const MatchesToday = DataFetcher.matchesToday()

    Promise.all([TeamData, MatchesToday]).then(() => {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.createMessage('Updated cache files!')
      }).catch((error) => {
        Logger.warn(`Could not notify about updating cache files`, error)
      })
    }).catch((error) => {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.createMessage(`Could not update cache files\n\`\`\`js\n${error}\n\`\`\``)
      }).catch((error) => {
        Logger.warn(`Could not notify about failing to update cache files`, error)
      })
    })
  }
}

module.exports = UpdateCache
