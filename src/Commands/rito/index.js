const permissions = require('./permissions.json');
const options = require('./options.json');

const { memeCooldown } = require('../../config.js');

const BaseCommand = require('../../Classes/BaseCommand.js');
const { Logger } = require('../../util.js');

class Rito extends BaseCommand {
  constructor () {
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
