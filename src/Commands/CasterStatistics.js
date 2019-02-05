const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const heroesloungeApi = require('heroeslounge-api')

class CasterStatistics extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: ['bot_commands'],
        roles: ['Lounge Master', 'Board', 'Managers', 'Moderators', 'Casters'],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'casterstatisticss',
      aliases: ['caststats', 'casterstats'],
      description: 'Provides you with the casting statistics of the specified season.',
      syntax: 'casterstats <season>',
      enabled: false,
      min_args: 1,
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg, args) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
      description: 'Overall casting statistics for season ',
      fields: [
        {
          name: 'Round matches',
          value: '',
          inline: true
        },
        {
          name: 'Casts',
          value: '',
          inline: true
        },
        {
          name: 'Coverage',
          value: '',
          inline: true
        }
      ]
    }

    const season = parseInt(args[0])
    const seasonId = season - 3 // Id 1 belong to season 4.

    heroesloungeApi.getSeasonCasterStatistics(seasonId).then((stats) => {
      embed.description += season
      const roundData = stats.dataByRound

      for (let entry in roundData) {
        if (parseInt(entry) > 0) {
          embed.fields[0].value += `Round ${entry}: ${roundData[entry].matches} matches\n`
          embed.fields[1].value += `${roundData[entry].casts}\n`
          embed.fields[2].value += `${roundData[entry].coverage !== 'undefined' ? roundData[entry].coverage : 0}%\n`
        }
      }

      msg.channel.createMessage({ embed: embed }).catch((error) => {
        Logger.warn(`Could not notify casterstatistics`, error)
      })
    }).catch((error) => {
      Logger.error(`Unable to get casterstatistics for season: ${season}`, error)
    })
  }
}

module.exports = CasterStatistics
