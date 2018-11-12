const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const {syncCaptains} = require('../util/SyncRoles.js')

class AssignCaptain extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'assigncaptain',
      aliases: [],
      description: 'Assigns the Captain role to all the captains of participating teams.',
      syntax: 'assigncaptain',
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    syncCaptains(this.bot).then((response) => {
      return this.bot.getDMChannel(msg.author.id)
        .then((channel) => {
          return channel.createMessage(`Updated captains: ${response.updatedCaptainCounter}\nErrors:\n${response.errorMessage}`)
            .catch((error) => {
              throw error
            })
        }).catch((error) => {
          throw error
        })
    }).catch(error => Logger.error('Unable to sync captains', error))
  }
}

module.exports = AssignCaptain
