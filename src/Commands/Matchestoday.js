const BaseCommand = require('../Classes/BaseCommand.js')
const heroesloungeApi = require('heroeslounge-api')
const Logger = require('../util/Logger.js')

class Matchestoday extends BaseCommand {
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
      command: 'matchestoday',
      aliases: ['upcomingmatches', 'today', 'todaymatches'],
      description: 'Lists all of today\'s upcoming matches',
      syntax: 'matchestoday',
      delInvokeMsg: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
      description: '[Matches Today](https://heroeslounge.gg/calendar)',
      fields: [
        {
          name: 'Fixture',
          value: '',
          inline: true
        },
        {
          name: 'Match Details',
          value: '',
          inline: true
        },
        {
          name: 'Cast',
          value: '',
          inline: true
        }
      ]
    }

    if (msg.channel.guild) {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        channel.sendTyping()
      })
    } else {
      msg.channel.sendTyping()
    }

    heroesloungeApi.getMatchesToday().then(async (matches) => {
      if (matches.length === 0) return null

      matches.sort((a, b) => {
        return parseInt(a.wbp.slice(-8, -3).replace(':', '')) - parseInt(b.wbp.slice(-8, -3).replace(':', ''))
      })

      let matchDivisions = []
      for (let match in matches) {
        matchDivisions[match] = matches[match].div_id ? heroesloungeApi.getDivisionInfo(matches[match].div_id) : 'No division'
      }

      // Wait for all of the division requests to complete.
      for (let m in matchDivisions) {
        matchDivisions[m] = await matchDivisions[m]
      }

      for (let match in matches) {
        const matchURL = 'https://heroeslounge.gg/match/view/' + matches[match].id
        embed.fields[0].value += `${matches[match].wbp.slice(-8, -3)} ${matchDivisions[match].division.title}\n`
        embed.fields[1].value += `[${matches[match].teams[0].slug} Vs ${matches[match].teams[1].slug}](${matchURL})\n`
        embed.fields[2].value += `${matches[match].casters ? `[Channel](${matches[match].twitch.url})` : 'No'}\n`
      }

      return embed
    }).then((embed) => {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        if (!embed) return channel.createMessage('There are no upcoming matches')

        channel.createMessage({
          embed: embed
        })
      })
    }).catch((error) => {
      Logger.error('Could not fetch a list of today\'s matches', error)
    })
  }
}

module.exports = Matchestoday
