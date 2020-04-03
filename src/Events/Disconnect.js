const { Logger } = require('../util.js');

module.exports = (bot) => {
  bot.on('disconnect', () => {
    Logger.info('Heroesbot disconnected, reconnecting...');
  });
};
