const BaseCommand = require('../Classes/BaseCommand.js');

class Ping extends BaseCommand {
  constructor () {
    const commandFolder = __filename.substring(__dirname.length + 1, __filename.length - 3).toLowerCase();
    const {permissions, options} = require(`./${commandFolder}/`);

    super(permissions, options);
  }

  exec (msg) {
    return msg.channel.createMessage('Pong');
  }
}

module.exports = Ping;

/*
Each command needs to reference it's own folder for it's data.

E.g: ping references ./ping/* for it's files.

However, we also need to be able to inject additional data into this.
  E.g: we have a global cooldown that we use for all our reaction responses.

*/
