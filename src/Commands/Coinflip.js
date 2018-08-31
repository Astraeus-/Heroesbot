const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const fs = require('fs')
const path = require('path')

class Coinflip extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: ['match_lounge_1', 'match_lounge_2', 'match_lounge_3', 'match_lounge_4', 'match_lounge_5', 'match_lounge_6', 'match_lounge_7', 'match_lounge_8', 'match_lounge_9', 'match_lounge_10', 'match_lounge_11', 'match_lounge_12', 'match_lounge_13', 'match_lounge_14', 'match_lounge_15', 'match_lounge_16', 'match_lounge_17', 'match_lounge_18', 'match_lounge_19', 'match_lounge_20', 'devops', 'mockdrafts'],
        roles: [],
        users: []
      },
      'HotS - Nexus Brawls': {
        channels: ['match_lounge_1', 'match_lounge_2'],
        roles: [],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'coin',
      aliases: ['flip', 'coinflip', 'flipcoin', 'toss', 'tosscoin', 'cointoss'],
      description: 'Flips a coin.',
      syntax: 'coin'
    }

    super(permissions, options)
  }

  exec (msg) {
    const output = Math.round(Math.random() >= 0.5) ? 'heads' : 'tails'
    const file = fs.readFileSync(path.join(__dirname, `../Data/Images/${output}.png`))
    msg.channel.createMessage({
      content: 'Current bans and rules:\nhttps://heroeslounge.gg/general/ruleset',
      image: {
        url: `attachment://${output}.png`
      }
    },
    {
      file: file,
      name: `${output}.png`
    }).catch(error => Logger.error('Unable to respond with coinflip result', error))
  }
}

module.exports = Coinflip
