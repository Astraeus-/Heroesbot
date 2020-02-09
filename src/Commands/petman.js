
const { memeCooldown } = require('../config.js');

const BaseCommand = require('../Classes/BaseCommand');
const { Logger } = require('../util.js');

class Petman extends BaseCommand {
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
      'command': 'petman',
      'category': 'memes',
      'description': 'Heroesbot joins in on the Petman chant',
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
      ':PetmanPride:438477246706089997',
      '🇵',
      '🇪',
      '🇹',
      '🇲',
      '🇦',
      '🇳',
      ':Petman:438477216108773396'
    ];

    for (const emoji of emojisArray) {
      msg.addReaction(emoji).catch((error) => {
        Logger.warn(`Could not add emoji ${emoji}`, error);
      });
    }
  }
}

module.exports = Petman;

