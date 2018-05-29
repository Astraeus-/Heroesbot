const BaseCommand = require('../Classes/BaseCommand.js')

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
      // Updates category permissions.
      category.editPermission(guild.id, 0, 1024, 'role').catch((error) => {
        throw error
      })
      category.editPermission(staffRole.id, 1024, 0, 'role').catch((error) => {
        throw error
      })

      for (let i = 0; i < channelNames.length; i++) {
        this.bot.createChannel(guild.id, `championship-group-${channelNames[i]}`, 0, '', category.id).catch((error) => {
          throw error
        })
      }
      for (let i = 0; i < channelNames.length; i++) {
        this.bot.createChannel(guild.id, `cup-group-${channelNames[i]}`, 0, '', category.id).catch((error) => {
          throw error
        })
      }
    }).then(() => {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        channel.createMessage(`Successfully created playoff channels in ${guild.name}`)
      })
    }).catch((error) => {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        channel.createMessage(`Error creating playoff channels in ${guild.name}`)
      })
      throw error
    })
  }
}

module.exports = Playoffs
