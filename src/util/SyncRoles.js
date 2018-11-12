const heroesloungeApi = require('heroeslounge-api')
const {defaultServer} = require('../config.json')
const Logger = require('./Logger.js')

module.exports.syncCaptains = async (bot) => {
  Logger.info('Synchronising captain roles')
  const currentSeasonEU = await heroesloungeApi.getSeasonInfo(6).catch((error) => {
    throw error
  })
  const currentSeasonNA = await heroesloungeApi.getSeasonInfo(5).catch((error) => {
    throw error
  })

  let currentTeams = []
  currentTeams = [...currentTeams, ...currentSeasonEU.teams, ...currentSeasonNA.teams]

  let teamDetails = []
  for (let team of currentTeams) {
    const teamInfo = heroesloungeApi.getTeamInfo(team.id).catch((error) => {
      Logger.warn(`Unable to get team info for team ${team.title}`, error)
    })

    teamDetails = [...teamDetails, teamInfo]
  }

  return Promise.all(teamDetails).then((teamDetails) => {
    let errorMessage = ''
    let syncedSloths = []

    const guild = bot.guilds.get(defaultServer)
    const captainRole = guild.roles.find((role) => {
      return role.name === 'Captains'
    })

    for (let team of teamDetails) {
      if (team.sloths && team.sloths.length > 0 && team.disbanded === '0') {
        if (team.sloths[0].is_captain === '1') {
          if (team.sloths[0].discord_id.length > 0) {
            let captainSloth = team.sloths[0]

            const member = guild.members.get(captainSloth.discord_id)
            if (member) {
              const roles = member.roles
              // If the user already has the captain role, skip over them.
              if (roles.includes(captainRole.id)) continue

              syncedSloths.push(
                bot.addGuildMemberRole(defaultServer, captainSloth.discord_id, captainRole.id)
                  .catch((error) => {
                    Logger.warn(`Unable to assign captain for team ${team.title} user ${captainSloth.title}`, error)
                    errorMessage += `Unable to assign captain for team ${team.title} user ${captainSloth.title}\n`
                  })
              )
            } else {
              errorMessage += `Captain not on discord for ${team.title} member ${captainSloth.title}\n`
            }
          } else {
            errorMessage += `No discord id for ${team.title}\n`
          }
        } else {
          errorMessage += `No captain for ${team.title}\n`
        }
      } else {
        errorMessage += `No sloths for ${team.title}\n`
      }
    }

    return Promise.all(syncedSloths).then(() => {
      Logger.info(`Captain role synchronisation complete, updated ${syncedSloths.length} users`)
      return {
        'updatedCaptainCounter': syncedSloths.length,
        'errorMessage': errorMessage
      }
    }).catch((error) => {
      throw error
    })
  })
}

module.exports.syncRegionRoles = async (bot) => {
  Logger.info('Synchronising region roles')
  return heroesloungeApi.getSloths().then((sloths) => {
    let syncedSloths = []

    for (let sloth in sloths) {
      const currentSloth = sloths[sloth]
      if (currentSloth.discord_id.length === 0) continue

      const member = bot.guilds.get(defaultServer).members.get(currentSloth.discord_id)
      if (!member) continue

      const roles = member.roles
      let regionRoleId
      if (currentSloth.region_id === '1') {
        regionRoleId = '494534903547822105' // EU
      } else if (currentSloth.region_id === '2') {
        regionRoleId = '494535033722372106' // NA
      } else {
        continue
      }

      // User already has regionRole trying to assign.
      if (roles.includes(regionRoleId)) continue

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

    return syncedSloths
  }).then((syncedSloths) => {
    return Promise.all(syncedSloths).then(() => {
      Logger.info(`Region role synchronisation complete, updated ${syncedSloths.length} users`)
      return 'Region role synchronisation complete'
    }).catch((error) => {
      throw error
    })
  }).catch(error => Logger.error('Error syncing all region roles', error))
}
