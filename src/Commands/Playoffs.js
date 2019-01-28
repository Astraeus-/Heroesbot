const BaseCommand = require('../Classes/BaseCommand.js')
const heroesloungeApi = require('heroeslounge-api')
const Logger = require('../util/Logger.js')

// @todo Define the season id with a variable.

class Playoffs extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: ['108153813143126016']
      },
      'Heroes Lounge': {
        channels: ['bot_commands'],
        roles: [],
        users: ['108153813143126016', '202174629245222912', '188331826970886144']
      }
    }

    const options = {
      prefix: '!',
      command: 'playoffs',
      description: 'Creates the playoff channels for the specified region',
      syntax: 'playoffs <region>',
      min_args: 1,
      invokeDM: false,
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg, args) {
    const seasonEnum = {
      'eu': '1',
      'na': '2'
    }
    const guild = msg.channel.guild
    const region = seasonEnum[args[0].toLowerCase()]
    const modRole = guild.roles.find((role) => {
      return role.name === 'Moderators'
    })

    let errorMessage = []

    const manageChannelPermission = guild.members.get(this.bot.user.id).permission.has('manageChannels')

    if (manageChannelPermission) {
      heroesloungeApi.getSeasons()
        .then((seasons) => {
          let seasonsArray = seasons
          let playoffSeason

          for (let i = seasonsArray.length - 1; i >= 0; i--) {
            if (seasonsArray[i].region_id === region && seasonsArray[i].current_round === seasonsArray[i].round_length) {
              playoffSeason = seasonsArray[i]
              break
            }
          }

          if (!playoffSeason) throw Error(`No playoff season for region: ${args[0]}`)

          return playoffSeason
        })
        .then((playoffSeason) => {
          return heroesloungeApi.getSeasonInfo(playoffSeason.id).catch((error) => {
            throw error
          })
        })
        .then(async (playoffSeasonInfo) => {
          const seasonTournaments = playoffSeasonInfo.playoffs
          let tournaments = []

          for (let tournament in seasonTournaments) {
            const tournamentDetails = await heroesloungeApi.getPlayoffInfo(seasonTournaments[tournament].id)
              .catch((error) => {
                Logger.error(`Unable to find playoffs with id: ${seasonTournaments[tournament].id}`, error)
              })
            seasonTournaments[tournament]['divisions'] = tournamentDetails.divisions
            tournaments.push(seasonTournaments[tournament])
          }
          return tournaments
        })
        .then(async (tournaments) => {
          const playoffCategory = await this.bot.createChannel(guild.id, `Playoffs-${args[0].toUpperCase()}`, 4).catch((error) => {
            throw error
          })

          /* Updates main category permissions */
          playoffCategory.editPermission(guild.id, 0, 1024, 'role')
            .catch((error) => {
              const msg = 'Unable to update @everyone permissions'
              errorMessage.push(msg)
              Logger.warn(msg, error)
            })
          playoffCategory.editPermission(modRole.id, 1024, 0, 'role')
            .catch((error) => {
              const msg = 'Unable to update @Moderators permissions'
              errorMessage.push(msg)
              Logger.warn(msg, error)
            })

          return { playoffCategory, tournaments }
        })
        .then(async (playoffs) => {
          const tournaments = playoffs.tournaments
          const category = playoffs.playoffCategory
          let captainPermissionUpdates = []

          for (let tournament in tournaments) {
            for (let division of tournaments[tournament].divisions) {
              const divisionInfo = await heroesloungeApi.getDivisionInfo(division.id).catch((error) => {
                Logger.error(`Unable to retrieve division info for division with id: ${division.id}`, error)
              })

              let channel = await this.bot.createChannel(guild.id, `${tournaments[tournament].title}-${division.slug}`, 0, '', category.id).catch((error) => {
                const msg = `Unable to create channel ${tournaments[tournament].title}-${division.slug}`
                errorMessage.push(msg)
                Logger.warn(msg, error)
              })

              /* Grants access to the playoff channel to the team's captain */
              for (let team of divisionInfo.teams) {
                const divisionTeamInfo = await heroesloungeApi.getTeamInfo(team.id).catch((error) => {
                  Logger.error(`Unable to get team in for team with id: ${team.id}`, error)
                })

                for (let sloth of divisionTeamInfo.sloths) {
                  if (sloth.is_captain === '1') {
                    if (!sloth.discord_id) {
                      const msg = `Unable to add ${sloth.title} of ${team.title} to ${channel.name}`
                      errorMessage.push(msg)
                    } else {
                      captainPermissionUpdates.push(
                        channel.editPermission(sloth.discord_id, 1024, 0, 'member').catch((error) => {
                          const msg = `Error adding ${sloth.title} of ${team.title} to ${channel.name}`
                          errorMessage.push(msg)
                          Logger.warn(msg, error)
                        })
                      )
                    }
                    break
                  }
                }
              }
            }
          }
          return captainPermissionUpdates
        })
        .then((captainPermissionUpdates) => {
          return Promise.all(captainPermissionUpdates)
        })
        .then(() => {
          return this.bot.getDMChannel(msg.author.id).then((channel) => {
            return sendErrorResponse(channel, errorMessage)
              .catch((error) => {
                throw error
              })
          }).catch((error) => {
            Logger.warn('Unable to inform user about Playoff creations', error)
            Logger.warn(`Errors: ${errorMessage}`)
          })
        }).catch(error => Logger.error('Unable to create playoffs channels', error))
    } else {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.createMessage(`Unable to create playoff channels.\nMissing permission: manageChannels`)
          .catch((error) => {
            throw error
          })
      })
    }
  }
}

let sendErrorResponse = (channel, errorMessage) => {
  let errorResponse = 'Finished Playoffs creations with errors:\n'
  for (let error of errorMessage) {
    errorResponse += `${error}\n`

    if (errorResponse.length >= 1750) {
      channel.createMessage(errorResponse).catch((error) => {
        Logger.warn('Unable to send playoff error message', error)
      })
      errorResponse = ''
    }
  }
  return channel.createMessage(errorResponse).catch((error) => {
    Logger.warn('Unable to send playoff error message', error)
  })
}

module.exports = Playoffs
