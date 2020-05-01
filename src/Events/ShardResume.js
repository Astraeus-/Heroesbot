const { Logger } = require('../util.js');

module.exports = (bot) => {
  bot.on('shardResume', (id) => {
    Logger.info(`Shard id: ${id} resumed`);
  });
};
