const permissions = require('./permissions.json');
const options = require('./options.json');

const BaseCommand = require('../../Classes/BaseCommand.js');

class Ping extends BaseCommand {
  constructor () {
    super(permissions, options);
  }

  exec (msg) {
    return msg.channel.createMessage('Pong');
  }
}

module.exports = Ping;

