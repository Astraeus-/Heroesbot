const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');

class Petman extends BaseCommand {
  constructor () {
    const commandFolder = __filename.substring(__dirname.length + 1, __filename.length - 3).toLowerCase();
    const {permissions, options} = require(`./${commandFolder}/`);

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
