const { Logger } = require('../util.js');

module.exports = (bot) => {
  bot.on('shardDisconnect', (error, id) => {
    Logger.warn(`Shard id: ${id} disconnected, reconnecting...`, error);
  });
};
