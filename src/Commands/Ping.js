const BaseCommand = require('../Classes/BaseCommand.js')

class Ping extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: ['devops'],
        roles: ['Lounge Master', 'Manager', 'Moderators', 'Staff'],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'ping',
      description: 'Pings Heroesbot',
      syntax: 'ping'
    }

    super(permissions, options)
  }

  exec (msg) {
    msg.channel.createMessage('Pong')
  }
}

module.exports = Ping
