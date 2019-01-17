const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const { syncRegionRoles } = require('../util/SyncRoles.js')

class AssignRegion extends BaseCommand {
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
      command: 'assignregion',
      aliases: [],
      description: 'Assigns the EU or NA region to all the registered website users.',
      syntax: 'assignregion',
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    syncRegionRoles(this.bot).then((response) => {
      return this.bot.getDMChannel(msg.author.id)
        .then((channel) => {
          return channel.createMessage(response)
            .catch((error) => {
              throw error
            })
        }).catch((error) => {
          throw error
        })
    }).catch(error => Logger.error('Unable to sync region roles', error))
  }
}

module.exports = AssignRegion
