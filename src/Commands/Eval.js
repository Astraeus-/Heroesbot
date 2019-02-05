const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const util = require('util')

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

  async exec (msg, args) {
    const input = args.join(' ')
    let evalOutput
    try {
      /* eslint-disable */
      evalOutput = await eval(input)
      /* eslint-enable */

      let inspectionDepth = 3
      let inspectedOutput

      do {
        inspectionDepth--
        inspectedOutput = util.inspect(evalOutput, { depth: inspectionDepth })
      } while (inspectedOutput.length > 2000 && inspectionDepth > -1)

      if (inspectedOutput.length > 2000) throw Error(`Eval output is too large: ${inspectedOutput.length}`)

      msg.channel.createMessage(`\`\`\`js\n${inspectedOutput}\`\`\``).catch((error) => {
        Logger.error(`Could not send eval result`, error)
      })
    } catch (error) {
      msg.channel.createMessage(`Could not evaluate input properly\n${error}`).catch((error) => {
        Logger.warn(`Could not notify invalid eval input`, error)
      })
    }
  }
}

module.exports = Eval
