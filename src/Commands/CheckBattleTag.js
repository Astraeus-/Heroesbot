const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')

const https = require('https')

class CheckBattleTag extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: ['devops'],
        roles: ['Lounge Master', 'Board', 'Managers', 'Moderators'],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'checkbattletag',
      aliases: ['cbt'],
      description: 'Queries the HotsLogs Api for data on a Battletag.',
      syntax: 'checkbattletag <region> <name#12345>'
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg, args) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
      title: '',
      fields: [
      ]
    }

    const regions = {
      'US': 1,
      'EU': 2,
      'KR': 3,
      'CN': 5
    }

    const region = args[0]
    const battletag = args[1]

    if (!regions[region] || !battletag.match(/[a-zA-Z0-9]{2,11}#[0-9]{1,6}/g)) {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.createMessage(`Unable to retrieve data: Invalid region or battletag specified`)
      })
    }

    const formattedBattletag = battletag.replace('#', '_')

    getHotsLogsDetails(regions[region], formattedBattletag).then((HotsLogsInfo) => {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        if (HotsLogsInfo) {
          const leaderboardData = HotsLogsInfo.LeaderboardRankings
          embed.title = `${battletag}\nRegion: ${region}`
          for (let i = 0; i < leaderboardData.length; i++) {
            embed.fields[i] = {
              name: leaderboardData[i].GameMode,
              value: leaderboardData[i].CurrentMMR,
              inline: true
            }
          }
          return channel.createMessage({ 'embed': embed })
        } else {
          return channel.createMessage(`No data for battletag: ${battletag} in region ${region}`)
        }
      })
    }).catch((error) => {
      Logger.error('Unable to retrieve data', error)
    })
  }
}

let getHotsLogsDetails = (regionId, formattedBattletag) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.hotslogs.com',
      path: `/Public/Players/${regionId}/${formattedBattletag}`,
      method: 'GET'
    }

    const req = https.request(options, (res) => {
      let rawResponse = ''
      res.setEncoding('utf8')

      res.on('data', (d) => {
        rawResponse += d
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            let response = JSON.parse(rawResponse)
            resolve(response)
          } catch (err) {
            reject(Error('Parse JSON response'))
          }
        } else {
          reject(Error(`status Code ${res.statusCode} : Invalid request`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.end()
  })
}

module.exports = CheckBattleTag
