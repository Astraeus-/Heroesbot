const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');
const { env } = require('../config.js');

const { exec } = require('child_process');

class Restart extends BaseCommand {
  constructor () {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: ['108153813143126016']
      }
    };

    const options = {
      prefix: '!',
      command: 'restart',
      description: 'Restarts elements of the host OS.',
      syntax: 'restart <option>\nOptions are: network, all',
      ignoreInHelp: true,
      min_args: 1,
      enabled: false
    };

    super(permissions, options);
  }

  exec (msg, args) {
    if (env !== 'production') return;

    if (args[0] === 'all') {
      Logger.info('Restarting Heroesbot host, please wait...');
      exec('sudo /sbin/reboot', (error) => {
        if (error) Logger.error('Error restarting Heroesbot', error);
      });
    } else if (args[0] === 'network') {
      Logger.info('Restarting Heroesbot networking, please wait...');
      exec('sudo ifconfig wlan0 down', (error) => {
        if (error) Logger.error('Error disabling networking service Heroesbot', error);
      });

      setTimeout(() => {
        exec('sudo ifconfig wlan0 up', (error) => {
          if (error) Logger.error('Error enabling networking service Heroesbot', error);
        });
      }, 3000);
    } else {
      msg.author.getDMChannel().then((channel) => {
        return channel.createMessage(`Incorrect command **${this.prefix + this.command}** syntax \nCommand usage: ${this.syntax}`);
      }).catch((error) => {
        Logger.warn('Could not inform invalid syntax', error);
      });
    }
  }
}

module.exports = Restart;
