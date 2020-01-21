
const { memeCooldown } = require('../config.js');

const BaseCommand = require('../Classes/BaseCommand');
const { Logger } = require('../util.js');

class Rigged extends BaseCommand {
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
      'command': 'rigged',
      'category': 'memes',
      'description': 'Loungebot agrees that rigging has occured',
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
      '🇷',
      '🇮',
      '🇬',
      ':g_:364475638297657345',
      '🇪',
      '🇩',
      ':BabyRage:438477910899163157'
    ];

    for (const emoji of emojisArray) {
      msg.addReaction(emoji).catch((error) => {
        Logger.warn(`Could not add emoji ${emoji}`, error);
      });
    }
  }
}

module.exports = Rigged;

