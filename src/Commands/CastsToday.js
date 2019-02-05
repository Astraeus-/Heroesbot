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
        channels: ['casters_lounge'],
        roles: ['Lounge Master', 'Board', 'Managers', 'Moderators', 'Casters', 'CoCasters', 'External Casters', 'Trial Casters'],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'caststoday',
      aliases: ['casts'],
      description: 'Lists all of today\'s upcoming casts.',
      syntax: 'caststoday',
      cooldown: 30000,
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    heroesloungeApi.getMatchesToday()
      .then(async (matches) => {
        if (matches.length === 0) return null

        let castedMatches = matches.filter((match) => {
          return match.channel_id
        })

        if (castedMatches.length === 0) return null

        castedMatches.sort((a, b) => {
          return parseInt(a.wbp.slice(-8, -3).replace(':', '')) - parseInt(b.wbp.slice(-8, -3).replace(':', ''))
        })

        let matchDivisions = []
        let matchTeams = []
        let matchCasters = []

        for (let match in castedMatches) {
          matchDivisions[match] = castedMatches[match].div_id ? heroesloungeApi.getDivision(castedMatches[match].div_id).catch((error) => {
            Logger.warn('Unable to get division info', error)
          }) : ''

          matchTeams[match] = heroesloungeApi.getMatchTeams(matches[match].id).catch((error) => {
            Logger.warn('Unable to get match team info', error)
          })

          matchCasters[match] = heroesloungeApi.getMatchCasters(castedMatches[match].id).catch((error) => {
            Logger.warn('Unable to get caster info', error)
          })
        }

        let response = ''

        for (let match in castedMatches) {
          const division = await matchDivisions[match]
          const casters = await matchCasters[match]
          const teams = await matchTeams[match]

          let casterMessage = ''

          // Attach all of the casters to the casterMessage.
          casters.forEach((caster) => {
            if (casterMessage.length > 0) casterMessage += ' and '
            casterMessage += `${caster.title}`
          })

          // Attach a division name or tournament + group.
          let fixture = ''

          if (division.playoff_id || castedMatches[match].playoff_id) {
            const playoff = castedMatches[match].playoff_id ? await heroesloungeApi.getPlayoff(castedMatches[match].playoff_id).catch((error) => {
              Logger.warn('Unable to get playoff info', error)
            }) : division.playoff_id ? await heroesloungeApi.getPlayoff(division.playoff_id).catch((error) => {
              Logger.warn('Unable to get playoff info', error)
            }) : ''

            fixture = `Heroes Lounge ${playoff.title}${division ? ` ${division.title}` : ''}`
          } else {
            fixture = division.title
          }

          const time = castedMatches[match].wbp.slice(-8, -3)
          let twitchChannel

          if (castedMatches[match].channel_id) {
            twitchChannel = await heroesloungeApi.getTwitchChannel(castedMatches[match].channel_id).catch((error) => {
              Logger.warn('Unable to get twitch channel info', error)
            })
          }

          // Group all match statement with the same time together.
          if (match > 0 && castedMatches[match].wbp.slice(-8, -3) > castedMatches[match - 1].wbp.slice(-8, -3)) {
            response += `\nAt ${time}\n`
          } else if (match > 0 && castedMatches[match].wbp.slice(-8, -3) === castedMatches[match - 1].wbp.slice(-8, -3)) {
            response += ''
          } else {
            response += `At ${time}\n`
          }

          response += `${casterMessage} will be bringing you a ${fixture} match between ${teams[0].title} and ${teams[1].title} on \`${twitchChannel.url}\`\n`
        }

        return response
      })
      .then((response) => {
        return this.bot.getDMChannel(msg.author.id).then((channel) => {
          if (!response) {
            return channel.createMessage('There are no casted matches')
          } else {
            return channel.createMessage(response)
          }
        })
      }).catch((error) => {
        Logger.error('Unable to list upcoming casts', error)
      })
  }
}

module.exports = CastsToday
