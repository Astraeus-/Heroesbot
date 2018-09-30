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
      description: 'Creates the playoff channels for the specified season',
      syntax: 'playoffs <seasonId>',
      min_args: 1,
      invokeDM: false,
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg, args) {
    const guild = msg.channel.guild
    const seasonId = args[0]
    const modRole = guild.roles.find((role) => {
      return role.name === 'Moderators'
    })

    let errorMessage = ''

    this.bot.createChannel(guild.id, 'Playoffs', 4)
      .then((category) => {
        // Updates category permissions.
        category.editPermission(guild.id, 0, 1024, 'role')
          .catch((error) => {
            const msg = 'Unable to update @everyone permissions'
            errorMessage += `- ${msg}\n`
            Logger.warn(msg, error)
          })
        category.editPermission(modRole.id, 1024, 0, 'role')
          .catch((error) => {
            const msg = 'Unable to update @Moderators permissions'
            errorMessage += `- ${msg}\n`
            Logger.warn(msg, error)
          })

        return heroesloungeApi.getSeasonInfo(seasonId)
          .then(async (seasonInfo) => {
            const seasonTournaments = seasonInfo.playoffs
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
            for (let tournament in tournaments) {
              for (let division of tournaments[tournament].divisions) {
                const divisionInfo = await heroesloungeApi.getDivisionInfo(division.id).catch((error) => {
                  Logger.error(`Unable to retrieve division info for division with id: ${division.id}`, error)
                })
                this.bot.createChannel(guild.id, `${tournaments[tournament].title}-${division.slug}`, 0, '', category.id)
                  .then((channel) => {
                    let divisionTeamDetails = []
                    for (let team of divisionInfo.teams) {
                      divisionTeamDetails.push(
                        heroesloungeApi.getTeamInfo(team.id).catch((error) => {
                          Logger.error(`Unable to get team in for team with id: ${team.id}`, error)
                        })
                      )
                    }
                    Promise.all(divisionTeamDetails).then((teamDetails) => {
                      for (let team of teamDetails) {
                        for (let sloth of team.sloths) {
                          if (sloth.is_captain === '1') {
                            if (!sloth.discord_id) {
                              const msg = `Unable to add ${sloth.title} of ${team.title} to ${channel.name}`
                              errorMessage += `- ${msg}\n`
                            } else {
                              channel.editPermission(sloth.discord_id, 1024, 0, 'member').catch((error) => {
                                const msg = `Error adding ${sloth.title} of ${team.title} to ${channel.name}`
                                errorMessage += `- ${msg}\n`
                                Logger.warn(msg, error)
                              })
                            }
                            break
                          }
                        }
                      }
                    })
                  })
                  .catch((error) => {
                    const msg = `Unable to create channel ${tournaments[tournament].title}-${division.slug}`
                    errorMessage += `- ${msg}\n`
                    Logger.warn(msg, error)
                  })
              }
            }
          }).catch((error) => {
            throw error
          })
      })
      .then(() => {
        return this.bot.getDMChannel(msg.author.id).then((channel) => {
          return channel.createMessage(`Finished Playoffs creations with errors:\n${errorMessage}`)
            .catch((error) => {
              throw error
            })
        }).catch((error) => {
          Logger.warn('Unable to inform user about Playoff creations', error)
          Logger.warn(`Errors: ${errorMessage}`)
        })
      }).catch(error => Logger.error('Unable to create playoffs channels', error))
  }
}

module.exports = Playoffs
