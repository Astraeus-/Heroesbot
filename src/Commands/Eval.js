const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')

class Eval extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: ['108153813143126016']
      }
    }

    const options = {
      prefix: '!',
      command: 'eval',
      invokeDM: false,
      ignoreInHelp: true
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg, args) {
    const input = args.join(' ')
    let evalOutput
    try {
      /* eslint-disable */
      evalOutput = eval(input)
      /* eslint-enable */
      if (evalOutput.toString().length > 2000) throw Error(`Eval output is too large: ${evalOutput.toString().length}`)

      msg.channel.createMessage(`\`\`\`js\n${evalOutput}\`\`\``).catch((error) => {
        Logger.warn(`Sending eval result`, error)
      })
    } catch (error) {
      msg.channel.createMessage(`Could not evaluate input properly\n${error}`).catch((error) => {
        Logger.error(`Error eval'ing input:\n${input}`, error)
      })
    }
  }
}

module.exports = Eval
