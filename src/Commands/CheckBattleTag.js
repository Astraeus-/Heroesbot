const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')

const https = require('https')
const regions = require('../util/Regions.js').hotslogsId

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
      syntax: 'checkbattletag <region> <name#12345>',
      min_args: 2
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

    const specifiedRegion = args[0]
    const region = regions.find(region => region.name === specifiedRegion)
    const hotslogsRegionId = region && region.hotslogsId ? region.hotslogsId : null
    const battletag = args[1]

    if (!hotslogsRegionId || !battletag.match(/[a-zA-Z0-9]{2,11}#[0-9]{1,6}/g)) {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.createMessage(`Unable to retrieve data: Invalid region or battletag specified`)
      })
    }

    const formattedBattletag = battletag.replace('#', '_')

    getHotsLogsDetails(hotslogsRegionId, formattedBattletag).then((HotsLogsInfo) => {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        if (HotsLogsInfo) {
          const leaderboardData = HotsLogsInfo.LeaderboardRankings
          embed.title = `${battletag}\nRegion: ${specifiedRegion}`
          for (let i = 0; i < leaderboardData.length; i++) {
            embed.fields[i] = {
              name: leaderboardData[i].GameMode,
              value: leaderboardData[i].CurrentMMR,
              inline: true
            }
          }
          return channel.createMessage({ 'embed': embed })
        } else {
          return channel.createMessage(`No data for battletag: ${battletag} in region ${specifiedRegion}`)
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
