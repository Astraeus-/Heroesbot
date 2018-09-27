const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')

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
        roles: ['Lounge Master', 'Board', 'Managers', 'Moderators'],
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
      .catch(error => Logger.error('Unable to respond to ping', error))
  }
}

module.exports = Ping
