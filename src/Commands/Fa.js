const BaseCommand = require('../Classes/BaseCommand.js')
const config = require('../config.json')

class Fa extends BaseCommand {
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
      command: 'freeagent',
      aliases: ['fa'],
      description: 'Add or remove yourself from the free agent role group'
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    let guild = msg.channel.guild || this.bot.guilds.get(config.defaultServer)
    let memberRoles = guild.members.get(msg.author.id).roles
    let role = guild.roles.find((role) => {
      return role.name === 'Free-agent'
    })
    let notificationMessage

    if (!memberRoles.includes(role.id)) {
      this.bot.addGuildMemberRole(guild.id, msg.author.id, role.id).then(() => {
        notificationMessage = `Welcome to the ${guild.name} Free-agent group.\nMake sure to check out our #free-agent-lounge under Competition.`
      }).catch((error) => {
        throw error
      })
    } else {
      this.bot.removeGuildMemberRole(guild.id, msg.author.id, role.id).then(() => {
        notificationMessage = `You have left the ${guild.name} Free-agent group.`
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

module.exports = Fa
