
const BaseCommand = require('../Classes/BaseCommand.js');

class Ping extends BaseCommand {
  constructor () {
    const permissions = {
      'Test-Server': {
        'channels': ['robotchannel'],
        'roles': ['Admin'],
        'users': []
      },
      'Heroes Lounge': {
        'channels': ['devops'],
        'roles': ['Lounge Master', 'Board', 'Managers', 'Moderators'],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'ping',
      'category': 'admin',
      'description': 'Pings Heroesbot',
      'syntax': 'ping'
    };
    
    super(permissions, options);
  }

  exec (msg) {
    return msg.channel.createMessage('Pong');
  }
}

module.exports = Ping;

