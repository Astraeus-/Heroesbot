const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const heroesloungeApi = require('heroeslounge-api')

class CastsToday extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: [],
        roles: [],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'caststoday',
      aliases: ['casts'],
      description: 'Lists all of today\'s upcoming casts.',
      syntax: 'caststoday',
      cooldown: 30000
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    heroesloungeApi.getMatchesToday()
      .then(async (matches) => {
        if (matches.length === 0) return null

        let castedMatches = matches.filter((match) => {
          return match.casters && match.casters.length > 0
        })

        if (castedMatches.length === 0) return null

        castedMatches.sort((a, b) => {
          return parseInt(a.wbp.slice(-8, -3).replace(':', '')) - parseInt(b.wbp.slice(-8, -3).replace(':', ''))
        })

        let matchDivisions = []
        for (let match in castedMatches) {
          matchDivisions[match] = castedMatches[match].div_id ? heroesloungeApi.getDivisionInfo(castedMatches[match].div_id).catch((error) => {
            Logger.warn('Unable to get division info', error)
          }) : 'No division'
        }

        // Wait for all of the division requests to complete.
        for (let m in matchDivisions) {
          matchDivisions[m] = await matchDivisions[m]
        }

        let response = ''

        for (let match in castedMatches) {
          const casters = castedMatches[match].casters
          let casterMessage = ''

          // Attach all of the casters to the casterMessage.
          casters.forEach((caster) => {
            if (casterMessage.length > 0) casterMessage += ' and '
            casterMessage += `${caster.title}`
          })

          // Attach a division name or tournament + group.
          const division = matchDivisions[match].division
          let divisionName = ''
          if (division.playoff_id !== null) {
            const playoff = await heroesloungeApi.getPlayoffInfo(division.playoff_id)
            divisionName = `Heroes Lounge ${playoff.title} ${division.title.toLowerCase()}`
          } else {
            divisionName = matchDivisions[match].division.title.toLowerCase()
          }

          const time = castedMatches[match].wbp.slice(-8, -3)
          const teams = castedMatches[match].teams
          const channelUrl = castedMatches[match].twitch ? castedMatches[match].twitch.url : ''

          // Group all match statement with the same time together.
          if (match > 0 && castedMatches[match].wbp.slice(-8, -3) > castedMatches[match - 1].wbp.slice(-8, -3)) {
            response += `\nAt ${time}\n`
          } else if (match > 0 && castedMatches[match].wbp.slice(-8, -3) === castedMatches[match - 1].wbp.slice(-8, -3)) {
            response += ''
          } else {
            response += `At ${time}\n`
          }

          response += `${casterMessage} will be bringing you a ${divisionName} match between ${teams[0].title} and ${teams[1].title} on \`${channelUrl}\`\n`
        }

        return response
      })
      .then((response) => {
        return this.bot.getDMChannel(msg.author.id)
          .then((channel) => {
            if (!response) {
              return channel.createMessage('There are no casted matches')
                .catch((error) => {
                  throw error
                })
            } else {
              return channel.createMessage(response)
                .catch((error) => {
                  throw error
                })
            }
          }).catch((error) => {
            throw error
          })
      }).catch(error => Logger.error('Unable to list upcoming casts', error))
  }
}

module.exports = CastsToday
