const heroesloungeApi = require('heroeslounge-api')
const { defaultServer } = require('../config.json')
const Logger = require('./Logger.js')

const { regions } = require('../util/Regions.js')

module.exports.syncRegionRoles = async (bot) => {
  Logger.info('Synchronising region roles')
  return heroesloungeApi.getSloths().then((sloths) => {
    const regionIds = {}
    const regionDiscordRoleIds = {}

    regions.forEach((region) => {
      if (region.heroesloungeId) {
        regionIds[region.name] = region.heroesloungeId
        regionDiscordRoleIds[region.name] = bot.guilds.get(defaultServer).roles.find(role => role.name === region.name)
      }
    })

    let syncedSloths = []

    for (let sloth in sloths) {
      const currentSloth = sloths[sloth]
      if (currentSloth.discord_id.length === 0) continue

      const member = bot.guilds.get(defaultServer).members.get(currentSloth.discord_id)
      if (!member) continue

      const roles = member.roles
      let regionRoleId
      if (currentSloth.region_id === '1') {
        regionRoleId = regionDiscordRoleIds['EU']
      } else if (currentSloth.region_id === '2') {
        regionRoleId = regionDiscordRoleIds['NA']
      } else {
        continue
      }

      if (roles.includes(regionRoleId)) continue

      if (currentSloth.region_id === regionIds['EU'] && roles.includes(regionDiscordRoleIds['NA'])) {
        bot.removeGuildMemberRole(defaultServer, currentSloth.discord_id, regionDiscordRoleIds['NA']).catch((error) => {
          Logger.error(`Error removing old region role from ${currentSloth.discord_tag}`, error)
        })
      }

      if (currentSloth.region_id === regionIds['NA'] && roles.includes(regionDiscordRoleIds['EU'])) {
        bot.removeGuildMemberRole(defaultServer, currentSloth.discord_id, regionDiscordRoleIds['EU']).catch((error) => {
          Logger.error(`Error removing old region role from ${currentSloth.discord_tag}`, error)
        })
      }

      syncedSloths.push(
        bot.addGuildMemberRole(defaultServer, currentSloth.discord_id, regionRoleId).catch((error) => {
          Logger.error(`Error assigning region role to ${currentSloth.discord_tag}`, error)
        })
      )
    }

    return syncedSloths
  }).then((syncedSloths) => {
    return Promise.all(syncedSloths).then(() => {
      Logger.info(`Region role synchronisation complete, updated ${syncedSloths.length} users`)
      return 'Region role synchronisation complete'
    })
  }).catch((error) => {
    Logger.error('Error syncing all region roles', error)
  })
}
