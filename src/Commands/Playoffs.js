const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
// @todo -> auto populate the channels with the eligible captains from the website.

class Playoffs extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: ['108153813143126016']
      },
      'Heroes Lounge': {
        channels: ['bot_commands'],
        roles: [],
        users: ['108153813143126016']
      }
    }

    const options = {
      prefix: '!',
      command: 'playoffs',
      description: 'Creates the playoff channels',
      syntax: 'playoffs',
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    const guild = msg.channel.guild
    const channelNames = ['a', 'b', 'c', 'd']
    const staffRole = guild.roles.find((role) => {
      return role.name === 'Staff'
    })

    this.bot.createChannel(guild.id, 'Playoffs', 4).then((category) => {
      let errorMessage = ''
      // Updates category permissions.
      category.editPermission(guild.id, 0, 1024, 'role').catch((error) => {
        let msg = 'Unable to update @everyone permissions'
        errorMessage += `- ${msg}\n`
        Logger.warn(msg, error)

      })
      category.editPermission(staffRole.id, 1024, 0, 'role').catch((error) => {
        let msg = 'Unable to update @staff permissions'
        errorMessage += `- ${msg}\n`
        Logger.warn(msg, error)
      })

      for (let i = 0; i < channelNames.length; i++) {
        this.bot.createChannel(guild.id, `championship-group-${channelNames[i]}`, 0, '', category.id).catch((error) => {
          let msg = `Unable to create channel championship-group-${channelNames[i]}`
          errorMessage += `- ${msg}\n`
          Logger.warn(msg, error)
        })
      }
      for (let i = 0; i < channelNames.length; i++) {
        this.bot.createChannel(guild.id, `cup-group-${channelNames[i]}`, 0, '', category.id).catch((error) => {
          let msg = `Unable to create channel cup-group-${channelNames[i]}`
          errorMessage += `- ${msg}\n`
          Logger.warn(msg, error)
        })
      }
    }).then(() => {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.createMessage(`Finished Playoffs creations with errors:\n${errorMessage}`).catch((error) => {
          throw error
        })
      }).catch((error) => {
        Logger.warn('Unable to inform user about Playoff creations', error)
        Logger.warn(`Errors: ${errorMessage}`)
      })
    }).catch((error) => {
      Logger.error('Unable to create playoffs channels', error)
    })
  }
}

module.exports = Playoffs
