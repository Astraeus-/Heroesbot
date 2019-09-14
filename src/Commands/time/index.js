const permissions = require('./permissions.json');
const options = require('./options.json');

const BaseCommand = require('../../Classes/BaseCommand.js');
const dateformat = require('date-fns/format');

class Time extends BaseCommand {
  constructor (bot) {
    super(permissions, options);
  }

  exec (msg) {
    const timestamp = dateformat(msg.timestamp, 'hh:mm:ss a');
    return msg.channel.createMessage(`The current time is ${timestamp}`);
  }
}

module.exports = Time;
