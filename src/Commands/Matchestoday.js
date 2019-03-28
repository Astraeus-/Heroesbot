const BaseCommand = require('../Classes/BaseCommand.js')
const CacheManager = require('../Classes/CacheManager.js')
const Logger = require('../util/Logger.js')
const heroesloungeApi = require('heroeslounge-api')

const dateformat = require('date-fns/format')

class MatchesToday extends BaseCommand {
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
      cooldown: 10000
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

    let Embeds = []
    let embedCounter = 0

    Embeds[embedCounter] = JSON.parse(JSON.stringify(embed))

    if (msg.channel.guild) {
      this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.sendTyping()
      }).catch((error) => {
        Logger.warn(`Unable to sendTyping to ${msg.author.username}`, error)
      })
    } else {
      msg.channel.sendTyping().catch((error) => {
        Logger.warn(`Unable to sendTyping to ${msg.channel.name}`, error)
      })
    }

    CacheManager.fetchCache('matchesToday', 15 * 60 * 1000).then(async (cache) => {
      const matches = cache.data
      if (matches.length === 0) return null

      matches.sort((a, b) => {
        return parseInt(a.wbp.slice(-8, -3).replace(':', '')) - parseInt(b.wbp.slice(-8, -3).replace(':', ''))
      })

      let matchDivisions = []
      let matchTeams = []

      for (let match in matches) {
        matchDivisions[match] = matches[match].div_id ? heroesloungeApi.getDivision(matches[match].div_id).catch((error) => {
          Logger.warn('Unable to get division info', error)
        }) : ''

        matchTeams[match] = heroesloungeApi.getMatchTeams(matches[match].id).catch((error) => {
          Logger.warn('Unable to get match team info', error)
        })
      }

      for (let match in matches) {
        const teams = await matchTeams[match]
        const division = await matchDivisions[match]
        const matchURL = 'https://heroeslounge.gg/match/view/' + matches[match].id

        let twitchChannel

        // Attach a division name or tournament + group.
        let fixture = ''

        if (division.playoff_id || matches[match].playoff_id) {
          const playoff = matches[match].playoff_id ? await heroesloungeApi.getPlayoff(matches[match].playoff_id).catch((error) => {
            Logger.warn('Unable to get playoff info', error)
          }) : division.playoff_id ? await heroesloungeApi.getPlayoff(division.playoff_id).catch((error) => {
            Logger.warn('Unable to get playoff info', error)
          }) : ''

          switch (playoff.type) {
            case 'playoffv1':
              fixture = `${playoff.title} ${division ? division.title : ''}`
              break
            case 'playoffv2':
            case 'playoffv3':
              fixture = `${playoff.title.split(' ')[0]} ${division ? division.title : ''}`
              break
            case 'se16':
            case 'se32':
            case 'se64':
            case 'se128':
              fixture = `${playoff.title}${division ? ` ${division.title}` : ''}`
              break
            default:
              fixture = `${playoff.title}${division ? ` ${division.title}` : ''}`
          }
        } else {
          fixture = division.title
        }

        if (matches[match].channel_id) {
          twitchChannel = await heroesloungeApi.getTwitchChannel(matches[match].channel_id).catch((error) => {
            Logger.warn('Unable to get Twitch channel info', error)
          })
        }

        if (Embeds[embedCounter].fields[1].value.length >= 950) {
          embedCounter++
          Embeds = addEmbed(embed, Embeds, embedCounter)
        }

        const time = dateformat(new Date(matches[match].wbp), 'HH:mm')
        const leftTeamSlug = teams[0] ? teams[0].slug : 'TBD'
        const rightTeamSlug = teams[1] ? teams[1].slug : 'TBD'

        Embeds[embedCounter].fields[0].value += `${time} ${fixture}\n`
        Embeds[embedCounter].fields[1].value += `[${leftTeamSlug} Vs ${rightTeamSlug}](${matchURL})\n`
        Embeds[embedCounter].fields[2].value += `${twitchChannel ? `[Channel](${twitchChannel.url})` : 'No'}\n`
      }

      return Embeds
    }).then((Embeds) => {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        if (!Embeds) {
          return channel.createMessage('There are no upcoming matches')
        } else {
          return sendMatchesTodayResponse(channel, Embeds)
        }
      })
    }).catch((error) => {
      Logger.error('Unable to list upcoming matches', error)
    })
  }
}

let addEmbed = (embed, Embeds, embedCounter) => {
  Embeds[embedCounter] = JSON.parse(JSON.stringify(embed))
  delete Embeds[embedCounter].description
  return Embeds
}

let sendMatchesTodayResponse = (channel, Embeds) => {
  let response = []

  for (let embed in Embeds) {
    response.push(
      channel.createMessage({ 'embed': Embeds[embed] }).catch((error) => {
        throw error
      }))
  }
  return Promise.all(response)
}

module.exports = MatchesToday
