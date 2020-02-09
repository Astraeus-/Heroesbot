
const { memeCooldown } = require('../config.js');

const BaseCommand = require('../Classes/BaseCommand');
const { Logger } = require('../util.js');

class Robbgate extends BaseCommand {
  constructor () {
    const permissions = {
      'Heroes Lounge': {
        'channels': [],
        'roles': ['Lounge Master', 'Board', 'Managers', 'Moderators', 'VIP'],
        'users': ['108153813143126016']
      }
    };

    const options = {
      'prefix': '#',
      'command': 'robbgate',
      'category': 'memes',
      'description': 'Recalls the #Robbgate event',
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
      '🇷',
      '🇴',
      '🇧',
      ':b_:369122821600968705',
      '🇬',
      '🇦',
      '🇹',
      '🇪'
    ];

    for (const emoji of emojisArray) {
      msg.addReaction(emoji).catch((error) => {
        Logger.warn(`Could not add emoji ${emoji}`, error);
      });
    }
  }
}

module.exports = Robbgate;

