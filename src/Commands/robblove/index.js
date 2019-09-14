const permissions = require('./permissions.json');
const options = require('./options.json');

const { memeCooldown } = require('../../config.js');

const BaseCommand = require('../../Classes/BaseCommand.js');
const { Logger } = require('../../util.js');

class Robblove extends BaseCommand {
  constructor () {
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
