const BaseCommand = require('../Classes/BaseCommand.js')

class Rolldice extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: ['devops'],
        roles: [],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'roll',
      aliases: ['rolldice', 'dice'],
      description: 'Rolls dice',
      syntax: 'roll [number of dice] d[number of faces] \nDefaults to 1 die, with 6 faces.'
    }

    super(permissions, options)
  }

  exec (msg) {
    let nDice = (msg.content.match(/\s\d+/i) ? parseInt(msg.content.match(/\d+/i)) : 1)
    let nFaces = (msg.content.match(/[d]\d+/i) ? parseInt(msg.content.match(/[d]\d+/i)[0].substr(1)) : 6)

    let roll = rollDice(nDice, nFaces)
    let total = roll.reduce((total, num) => {
      return total + num
    })

    let output = '```' + 'Dice results: ' + roll + '.\n\n' + 'Total: ' + total + '```'
    if (output.length > 1000) {
      output = '```Total: ' + total + '```'
    }

    msg.channel.createMessage(output).catch((error) => {
      throw error
    })
  }
}

let rollDice = (nDice, nFaces) => {
  let outcomes = []

  for (let i = 0; i < nDice; i++) {
    let roll = Math.floor((Math.random() * nFaces) + 1)
    outcomes.push(roll)
  }
  return outcomes
}

module.exports = Rolldice
