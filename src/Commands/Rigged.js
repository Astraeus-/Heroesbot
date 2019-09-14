const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');

class Rigged extends BaseCommand {
  constructor () {
    const commandFolder = __filename.substring(__dirname.length + 1, __filename.length - 3).toLowerCase();
    const {permissions, options} = require(`./${commandFolder}/`);

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
