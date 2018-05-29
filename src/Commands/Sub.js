const BaseCommand = require('../Classes/BaseCommand.js')
const config = require('../config.json')

class Sub extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: [],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: ['role_requests'],
        roles: [],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'sub',
      aliases: ['substitute', 'subplayer'],
      description: 'Add or remove yourself from the sub player role group'
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    let guild = msg.channel.guild || this.bot.guilds.get(config.defaultServer)
    let memberRoles = guild.members.get(msg.author.id).roles
    let role = guild.roles.find((role) => {
      return role.name === 'Sub'
    })
    let notificationMessage

    if (!memberRoles.includes(role.id)) {
      this.bot.addGuildMemberRole(guild.id, msg.author.id, role.id).then(() => {
        notificationMessage = `Welcome to the ${guild.name} substitute player group.`
      }).catch((error) => {
        throw error
      })
    } else {
      this.bot.removeGuildMemberRole(guild.id, msg.author.id, role.id).then(() => {
        notificationMessage = `You have left the ${guild.name} substitute player group.`
      }).catch((error) => {
        throw error
      })
    }

    if (notificationMessage) {
      this.bot.getDMChannel(msg.author.id)
        .then((channel) => channel.createMessage(notificationMessage))
        .catch((error) => {
          throw error
        })
    }
  }
}

module.exports = Sub
