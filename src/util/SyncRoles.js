const heroesloungeApi = require('heroeslounge-api')
const { defaultServer } = require('../config.json')
const Logger = require('./Logger.js')

module.exports.syncCaptains = async (bot) => {
  Logger.info('Synchronising captain roles')

  const seasons = await heroesloungeApi.getSeasons().catch((error) => {
    throw error
  })

  let teamsByRegion = []
  let seasonCounter = 0

  for (let i = seasons.length - 1; i >= 0; i--) {
    if (seasonCounter >= 2) break
    if (seasons[i].type === '2') continue // Ignore Division S seasons

    if (seasons[i].is_active === '1' && seasons[i].reg_open === '0') {
      teamsByRegion = [...teamsByRegion, heroesloungeApi.getSeasonTeams(seasons[i].id)]
      seasonCounter++
    } else if (season.is_active === '1' && seasons[i].reg_open === '1') {
      seasonCounter++
    }
  }

  let teams = []
  await Promise.all(teamsByRegion).then((regionTeams) => {
    for (let i = 0; i < regionTeams.length; i++) {
      teams = [...teams, ...regionTeams[i]]
    }
  }).catch((error) => {
    throw error
  })

  let teamsWithDetails = []
  for (let team of teams) {
    const teamDetails = new Promise((resolve, reject) => {
      heroesloungeApi.getTeamSloths(team.id).then((sloths) => {
        let fullTeam = team
        fullTeam['sloths'] = sloths
        resolve(fullTeam)
      }).catch((error) => {
        Logger.warn(`Unable to get team sloths for team ${team.title}`, error)
        let fullTeam = team
        fullTeam['sloths'] = []
        resolve(fullTeam)
      })
    })

    teamsWithDetails = [...teamsWithDetails, teamDetails]
  }

  return Promise.all(teamsWithDetails).then((teamsWithDetails) => {
    let errorMessage = ''
    let syncedSloths = []

    const guild = bot.guilds.get(defaultServer)
    const captainRole = guild.roles.find((role) => {
      return role.name === 'Captains'
    })

    for (let team of teamsWithDetails) {
      if (team.sloths && team.sloths.length > 0 && team.disbanded === '0') {
        if (team.sloths[0].is_captain === '1') {
          if (team.sloths[0].discord_id.length > 0) {
            let captainSloth = team.sloths[0]

            const member = guild.members.get(captainSloth.discord_id)
            if (member) {
              if (member.roles.includes(captainRole.id)) continue

              syncedSloths.push(
                bot.addGuildMemberRole(defaultServer, captainSloth.discord_id, captainRole.id).catch((error) => {
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
    const regionIds = {
      EU: '1',
      NA: '2'
    }

    const regionRoleIds = {
      EU: '494534903547822105',
      NA: '494535033722372106'
    }

    let syncedSloths = []

    for (let sloth in sloths) {
      const currentSloth = sloths[sloth]
      if (currentSloth.discord_id.length === 0) continue

      const member = bot.guilds.get(defaultServer).members.get(currentSloth.discord_id)
      if (!member) continue

      const roles = member.roles
      let regionRoleId
      if (currentSloth.region_id === '1') {
        regionRoleId = regionRoleIds['EU']
      } else if (currentSloth.region_id === '2') {
        regionRoleId = regionRoleIds['NA']
      } else {
        continue
      }

      if (roles.includes(regionRoleId)) continue

      if (currentSloth.region_id === regionIds['EU'] && roles.includes(regionRoleIds['NA'])) {
        bot.removeGuildMemberRole(defaultServer, currentSloth.discord_id, regionRoleIds['NA']).catch((error) => {
          Logger.error(`Error removing old region role from ${currentSloth.discord_tag}`, error)
        })
      }

      if (currentSloth.region_id === regionIds['NA'] && roles.includes(regionRoleIds['EU'])) {
        bot.removeGuildMemberRole(defaultServer, currentSloth.discord_id, regionRoleIds['EU']).catch((error) => {
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
