const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const util = require('../util/SyncRegionRoles.js')

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
    util.syncRegionRoles(this.bot).then(() => {
      return this.bot.getDMChannel(msg.author.id)
        .then((channel) => {
          return channel.createMessage('Completed region role sync!')
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
