
const BaseCommand = require('../Classes/BaseCommand');
const { Logger } = require('../util.js');

const Client = require('../Client.js');
const path = require('path');

class Reload extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        'channels': ['robotchannel'],
        'roles': ['Admin'],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'reload',
      'category': 'admin',
      'aliases': [],
      'description': 'Hot reloads the commands.',
      'syntax': 'reload',
      'ignoreInHelp': true
    };
    
    super(permissions, options, bot);
  }

  exec (msg) {
    let warnings = '';

    Promise.all(
      [
        Client.loadCommands(this.bot, __dirname).catch((error) => {
          const warningMessage = 'Unable to reload commands';
          warnings += warningMessage + '\n';
          Logger.warn(warningMessage, error);
        }),

        Client.loadEvents(this.bot, path.join(__dirname, '../', 'Events')).catch((error) => {
          const warningMessage = 'Unable to reload events';
          warnings += warningMessage + '\n';
          Logger.warn(warningMessage, error);
        })
      ]
    ).then(() => {
      msg.author.getDMChannel().then((channel) => {
        if (warnings.length > 0) {
          return channel.createMessage(warnings);
        }

        return msg.addReaction('✅');
      }).catch((error) => {
        Logger.warn('Unable to inform about command reload', error);
      });
    });
  }
}

module.exports = Reload;

