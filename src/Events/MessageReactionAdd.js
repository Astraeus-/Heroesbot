const Logger = require('../util/Logger.js')

module.exports = (bot) => {
  bot.on('messageReactionAdd', (msg, emoji, userID) => {
    if (msg.id === '449186816466092032' && emoji.name === 'PartyParrot') {
      let guild = msg.channel.guild.id
      if (bot.guilds.get(guild).roles.get('449093576065024001')) {
        bot.addGuildMemberRole(guild, userID, '449093576065024001')
      } else {
        Logger.warn(`IRL Talk role does not exist`)
      }
    }
  })
}
