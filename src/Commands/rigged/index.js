const permissions = require('./permissions.json');
const options = require('./options.json');

const { memeCooldown } = require('../../config.js');

const BaseCommand = require('../../Classes/BaseCommand.js');
const { Logger } = require('../../util.js');

class Rigged extends BaseCommand {
  constructor () {
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

