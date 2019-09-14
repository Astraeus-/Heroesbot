const permissions = require('./permissions.json');
const options = require('./options.json');

const { memeCooldown } = require('../../config.js');

const BaseCommand = require('../../Classes/BaseCommand.js');
const { Logger } = require('../../util.js');

class Petman extends BaseCommand {
  constructor () {
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

