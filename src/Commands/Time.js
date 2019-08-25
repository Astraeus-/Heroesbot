const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');
const dateformat = require('date-fns/format');

class Time extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: ['match_lounge_1', 'match_lounge_2', 'match_lounge_3', 'match_lounge_4', 'match_lounge_5', 'match_lounge_6', 'match_lounge_7', 'match_lounge_8', 'match_lounge_9', 'match_lounge_10', 'match_lounge_11', 'match_lounge_12', 'match_lounge_13', 'match_lounge_14', 'match_lounge_15', 'match_lounge_16', 'match_lounge_17', 'match_lounge_18', 'match_lounge_19', 'match_lounge_20', 'devops'],
        roles: [],
        users: []
      }
    };

    const options = {
      prefix: '!',
      command: 'time',
      aliases: ['now'],
      description: 'Outputs the time of the invokers message.',
      syntax: 'time'

    };

    super(permissions, options);
  }

  exec (msg) {
    const timestamp = dateformat(msg.timestamp, 'hh:mm:ss A');
    msg.channel.createMessage(`The current time is ${timestamp}`).catch((error) => {
      Logger.error('Could not respond with timestamp', error);
    });
  }
}

module.exports = Time;
