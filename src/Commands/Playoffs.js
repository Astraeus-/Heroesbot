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
        users: ['108153813143126016']
      }
    }

    const options = {
      prefix: '!',
      command: 'playoffs',
      description: 'Creates the playoff channels',
      syntax: 'playoffs',
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    const guild = msg.channel.guild
    const staffRole = guild.roles.find((role) => {
      return role.name === 'Staff'
    })

    let errorMessage = ''

    this.bot.createChannel(guild.id, 'Playoffs', 4).then((category) => {
      // Updates category permissions.
      category.editPermission(guild.id, 0, 1024, 'role').catch((error) => {
        let msg = 'Unable to update @everyone permissions'
        errorMessage += `- ${msg}\n`
        Logger.warn(msg, error)
      })
      category.editPermission(staffRole.id, 1024, 0, 'role').catch((error) => {
        let msg = 'Unable to update @staff permissions'
        errorMessage += `- ${msg}\n`
        Logger.warn(msg, error)
      })

      return heroesloungeApi.getSeasonInfo(3).then(async (seasonInfo) => {
        const seasonTournaments = seasonInfo.playoffs
        let tournaments = []

        for (let tournament in seasonTournaments) {
          const tournamentDetails = await heroesloungeApi.getPlayoffInfo(seasonTournaments[tournament].id)
          seasonTournaments[tournament]['divisions'] = tournamentDetails.divisions
          tournaments.push(seasonTournaments[tournament])
        }
        return tournaments
      }).then((tournaments) => {
        for (let tournament in tournaments) {
          for (let division of tournaments[tournament].divisions) {
            this.bot.createChannel(guild.id, `${tournaments[tournament].title}-${division.slug}`, 0, '', category.id).catch((error) => {
              let msg = `Unable to create channel ${tournaments[tournament].title}-${division.slug}`
              errorMessage += `- ${msg}\n`
              Logger.warn(msg, error)
            })
          }
        }
      }).catch((error) => {
        throw error
      })
    }).then(() => {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.createMessage(`Finished Playoffs creations with errors:\n${errorMessage}`).catch((error) => {
          throw error
        })
      }).catch((error) => {
        Logger.warn('Unable to inform user about Playoff creations', error)
        Logger.warn(`Errors: ${errorMessage}`)
      })
    }).catch((error) => {
      Logger.error('Unable to create playoffs channels', error)
    })
  }
}

module.exports = Playoffs
