
const { memeCooldown } = require('../config.js');

const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');

class Blametinyowl extends BaseCommand {
  constructor () {
    const permissions = {
      'Test-Server': {
        'channels': ['robotchannel'],
        'roles': ['Admin'],
        'users': []
      },
      'Heroes Lounge': {
        'channels': [],
        'roles': ['Lounge Master', 'Board', 'Managers', 'Moderators', 'VIP'],
        'users': ['108153813143126016']
      }
    };

    const options = {
      'prefix': '#',
      'command': 'blametinyowl',
      'category': 'memes',
      'description': 'Responds blaming tinyowl',
      'invokeDM': false,
      'ignoreInHelp': true
    };
    
    if (!options.cooldown) {
      options.cooldown = memeCooldown;
    }
    
    super(permissions, options);
  }

  exec (msg) {
    const emojisArray = [
      '#⃣',
      '🇧',
      '🇱',
      '🇦',
      '🇲',
      '🇪',
      '🇹',
      '🇮',
      '🇳',
      '🇾',
      '🇴',
      '🇼',
      ':l_:369122853460770828',
      '🦉'
    ];

    for (const emoji of emojisArray) {
      msg.addReaction(emoji).catch((error) => {
        Logger.warn(`Could not add emoji ${emoji}`, error);
      });
    }
  }
}

module.exports = Blametinyowl;
