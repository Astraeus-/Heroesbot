const BaseCommand = require('../Classes/BaseCommand')
const Logger = require('../util/Logger.js')

const http = require('http')

class Draft extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: ['mockdrafts'],
        roles: [],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'draft',
      aliases: ['mock', 'mockdraft'],
      description: 'Creates a Heroes of the Storm mockdraft.',
      syntax: 'draft <map> <team 1> <team 2> [-nt]\nThe map is specialised by all first letters e.g.: Battlefield of Eternity = BOE.\nteam 1 has first pick by default.\nAdding optional flag "-nt" creates a draft with no pick timer.',
      min_args: 3
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
        {
          name: 'Team One',
          value: '',
          inline: true
        },
        {
          name: 'Team Two',
          value: '',
          inline: true
        },
        {
          name: 'Observer',
          value: ''
        }
      ]
    }

    const map = args[0].toUpperCase()
    const teamA = args[1]
    const teamB = args[2]
    const timerOff = !!(args[3] && args[3].search('-nt') !== -1)

    // Check that the map input actually exists.
    if (!checkMap(map)) {
      return this.bot.getDMChannel(msg.author.id)
        .then((channel) => channel.createMessage(`Channel with abbreviation: ${map} does not exist`))
        .catch((error) => {
          Logger.warn('Could not inform about invalid map syntax', error)
        })
    }

    createDraft(map, teamA, teamB, timerOff).then((draft) => {
      const battleground = draft.map.toLowerCase().replace(/\s/g, '-')

      embed.title += `${draft.map}`
      embed.description = timerOff ? 'Pick timer disabled' : 'Pick timer enabled'
      embed.fields[0].value = `[${draft.teams[0].name}](${draft.teams[0].url})`
      embed.fields[1].value = `[${draft.teams[1].name}](${draft.teams[1].url})`
      embed.fields[2].value = `[Observer](${draft.viewer.url})`
      embed.thumbnail = {
        'url': `https://heroeslounge.gg/themes/HeroesLounge-Theme/assets/img/maps/bg_${battleground}.jpg`
      }

      return embed
    }).then((embed) => {
      return msg.channel.createMessage({embed: embed}).catch((error) => {
        throw error
      })
    }).catch((error) => {
      Logger.error('Unable to create mockdraft', error)
    })
  }
}

let checkMap = (map) => {
  // Heroes of the Storm map list.
  /* eslint-disable */
  const maps = [
    'AP',     // Alterac Pass
    'BOE',    // Battlefield of Eternity
    'BB',     // Blackheart's Bay
    'BH',     // Braxis Holdout
    'CH',     // Cursed Hollow
    'DS',     // Dragon Shire
    'GOT',    // Garden of Terror
    'H',      // Hanamura
    'HM',     // Haunted Mines
    'IS',     // Infernal Shrines
    'ST',     // Sky Temple
    'TOTSQ',  // Tomb of the Spider Queen
    'TOD',    // Towers of Doom
    'VF',     // Volskaya Foundry
    'WJ'      // Warhead Junction
  ]
  /* eslint-enable */

  return maps.includes(map)
}

let createDraft = (map, teamA, teamB, timerOff) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nexus-brawls.com',
      port: 1338,
      path: '/draft',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const requestData = {
      'team1': teamA,
      'team2': teamB,
      'map': map,
      'timerOff': timerOff
    }

    const req = http.request(options, (res) => {
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

    req.write(JSON.stringify(requestData))
    req.end()
  })
}

module.exports = Draft
