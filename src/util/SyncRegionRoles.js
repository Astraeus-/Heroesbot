const heroesloungeApi = require('heroeslounge-api')
const {defaultServer} = require('../config.json')
const Logger = require('./Logger.js')

module.exports.syncRegionRoles = async (bot) => {
  Logger.info('Synchronising region roles')
  return heroesloungeApi.getSloths().then((sloths) => {
    let syncedSloths = []

    for (let sloth in sloths) {
      const currentSloth = sloths[sloth]
      if (currentSloth.discord_id.length === 0) return

      const member = bot.guilds.get(defaultServer).members.get(currentSloth.discord_id)
      if (!member) return

      const roles = member.roles
      let regionRoleId
      if (currentSloth.region_id === '1') {
        regionRoleId = '494534903547822105' // EU
      } else if (currentSloth.region_id === '2') {
        regionRoleId = '494535033722372106' // NA
      } else {
        return
      }

      // User already has regionRole trying to assign.
      if (roles.includes(regionRoleId)) return

      // Remove NA region role if region changed to EU.
      if (currentSloth.region_id === '1' && roles.includes('494535033722372106')) {
        bot.removeGuildMemberRole(defaultServer, currentSloth.discord_id, '494535033722372106')
          .catch(error => Logger.error(`Error removing old region role from ${currentSloth.discord_tag}`, error))
      }
      // Remove EU region role if region changed to NA.
      if (currentSloth.region_id === '2' && roles.includes('494534903547822105')) {
        bot.removeGuildMemberRole(defaultServer, currentSloth.discord_id, '494534903547822105')
          .catch(error => Logger.error(`Error removing old region role from ${currentSloth.discord_tag}`, error))
      }

      syncedSloths.push(
        bot.addGuildMemberRole(defaultServer, currentSloth.discord_id, regionRoleId)
          .catch(error => Logger.error(`Error assigning region role to ${currentSloth.discord_tag}`, error))
      )
    }

    return Promise.all(syncedSloths).then(() => {
      Logger.info('Region role synchronisation complete')
    })
  }).catch(error => Logger.error('Error getting list of all sloths', error))
}
