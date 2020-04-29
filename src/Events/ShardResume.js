const { Logger } = require('../util.js');

module.exports = (bot) => {
  bot.on('shardResume', (id) => {
    Logger.warn(`Shard id: ${id} resumed`);
  });
};
