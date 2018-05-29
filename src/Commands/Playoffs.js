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

    this.bot.createChannel(guildId, 'Playoffs', 4).then((category) => {
      // Updates category permissions.
      category.editPermission(guild.id, 0, 1024, 'role')
      category.editPermission(staffRole.id, 1024, 0, 'role')

      for (let i = 0; i < channelNames.length; i++) {
        this.bot.createChannel(guild.id, `championship-group-${channelNames[i]}`, 0, '', category.id)
      }
      for (let i = 0; i < channelNames.length; i++) {
        this.bot.createChannel(guild.id, `cup-group-${channelNames[i]}`, 0, '', category.id)
      }
    }).then(() => {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        channel.createMessage(`Successfully created playoff channels in guild ${guild.name}`)
      })
    }).catch((error) => {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        channel.createMessage(`Error creating playoff channels in guild ${guild.name}`)
      })
      console.log(error)
    })
  }
}

module.exports = Playoffs
