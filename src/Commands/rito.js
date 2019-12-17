
const { memeCooldown } = require('../config.js');

const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');

class Rito extends BaseCommand {
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
      'command': 'rito',
      'category': 'memes',
      'description': 'Have Heroesbot join in on the rito',
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
      ':fire_:369251928250515486',
      '🔫',
      ':RageSloth:438468862967545869',
      '🗡',
      '🔥'
    ];

    for (const emoji of emojisArray) {
      msg.addReaction(emoji).catch((error) => {
        Logger.warn(`Could not add emoji ${emoji}`, error);
      });
    }
  }
}

module.exports = Rito;
