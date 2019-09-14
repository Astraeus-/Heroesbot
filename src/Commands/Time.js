const BaseCommand = require('../Classes/BaseCommand.js');
const dateformat = require('date-fns/format');

class Time extends BaseCommand {
  constructor (bot) {
    const commandFolder = __filename.substring(__dirname.length + 1, __filename.length - 3).toLowerCase();
    const {permissions, options} = require(`./${commandFolder}/`);

    super(permissions, options);
  }

  exec (msg) {
    const timestamp = dateformat(msg.timestamp, 'hh:mm:ss a');
    return msg.channel.createMessage(`The current time is ${timestamp}`);
  }
}

module.exports = Time;
