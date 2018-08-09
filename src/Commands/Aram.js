const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const config = require('../config.json')

class Aram extends BaseCommand {
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
      command: 'aram',
      description: 'Add or remove yourself from the aram role group'
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    let guild = msg.channel.guild || this.bot.guilds.get(config.defaultServer)
    let memberRoles = guild.members.get(msg.author.id).roles
    let role = guild.roles.find((role) => {
      return role.name === 'Aramplayers'
    })
    let notificationMessage

    if (!memberRoles.includes(role.id)) {
      this.bot.addGuildMemberRole(guild.id, msg.author.id, role.id).then(() => {
        notificationMessage = `Welcome to the ${guild.name} ARAM group.`
      }).catch((error) => {
        Logger.error('Could not add Aramplayers role to member', error)
      })
    } else {
      this.bot.removeGuildMemberRole(guild.id, msg.author.id, role.id).then(() => {
        notificationMessage = `You have left the ${guild.name} ARAM group.`
      }).catch((error) => {
        Logger.error('Could not remove Aramplayers role from member', error)
      })
    }

    if (notificationMessage) {
      this.bot.getDMChannel(msg.author.id)
        .then((channel) => channel.createMessage(notificationMessage))
        .catch((error) => {
          Logger.warn('Could not notify member about Aramplayers role status', error)
        })
    }
  }
}

module.exports = Aram
