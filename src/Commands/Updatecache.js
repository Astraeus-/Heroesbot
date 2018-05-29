const BaseCommand = require('../Classes/BaseCommand.js')
const DataFetcher = require('../util/DataFetcher.js')

class Updatecache extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admins'],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'updatecache',
      description: 'Updates the Heroesbot cache files.',
      ignoreInHelp: true
    }

    super(permissions, options)
  }

  exec (msg) {
    let TeamData = DataFetcher.allTeamData()
    let MatchesToday = DataFetcher.matchesToday()

    Promise.all([TeamData, MatchesToday]).then(() => {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        channel.createMessage('Updated cache files!')
      })
    }).catch((error) => {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        channel.createMessage(`Could not update cache files\n\`\`\`js\n${error}\n\`\`\``)
      })
    })
  }
}

module.exports = Updatecache
