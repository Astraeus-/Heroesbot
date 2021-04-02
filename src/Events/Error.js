const { Logger } = require('../util.js');

module.exports = (bot) => {
  bot.on('error', (error, id) => {
    if (error.message !== 'Connection reset by peer') {
      Logger.error(`Encountered an error on shard ${id}`, error);
    }
  });
};
