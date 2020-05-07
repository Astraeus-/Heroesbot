const { Logger } = require('../util.js');

module.exports = (bot) => {
  bot.on('debug', (message, id) => {
    Logger.info(`DEBUG: ${message} on shard ${id}`);
  });
};
