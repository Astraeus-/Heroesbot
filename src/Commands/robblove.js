
const { memeCooldown } = require('../config.js');

const BaseCommand = require('../Classes/BaseCommand');
const { Logger } = require('../util.js');

class Robblove extends BaseCommand {
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
      'command': 'robblove',
      'category': 'memes',
      'description': 'Responds loving Robb',
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
      '🇱',
      ':o_:369122792861597697',
      '🇻',
      '🇪',
      '❤'
    ];

    for (const emoji of emojisArray) {
      msg.addReaction(emoji).catch((error) => {
        Logger.warn(`Could not add emoji ${emoji}`, error);
      });
    }
  }
}

module.exports = Robblove;
