const BaseCommand = require('../Classes/BaseCommand.js')
const config = require('../config.json')

class Robblove extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: [],
        roles: ['Lounge Master', 'Manager', 'Moderators', 'Staff', 'VIP'],
        users: ['108153813143126016']
      }
    }

    const options = {
      prefix: '#',
      command: 'robblove',
      description: 'Responds loving Robb',
      cooldown: config.memeCooldown,
      invokeDM: false,
      ignoreInHelp: true
    }

    super(permissions, options)
  }

  exec (msg) {
    const emojisArray = [
      '#⃣',
      '🇷',
      '🇴',
      '🇧',
      ':b_:369122821600968705',
      '🇱',
      ':o_:369122792861597697',
      '🇻',
      '🇪',
      '❤'
    ]

    for (let emoji of emojisArray) {
      msg.addReaction(emoji)
    }
  }
}

module.exports = Robblove
