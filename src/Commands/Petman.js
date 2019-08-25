const BaseCommand = require('../Classes/BaseCommand.js');
const { memeCooldown } = require('../config.js');
const { Logger } = require('../util.js');

class Petman extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: [],
        roles: ['Lounge Master', 'Board', 'Managers', 'Moderators', 'VIP'],
        users: ['108153813143126016']
      }
    };

    const options = {
      prefix: '#',
      command: 'petman',
      description: 'Heroesbot joins in on the Petman chant',
      cooldown: memeCooldown,
      invokeDM: false,
      ignoreInHelp: true
    };

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
