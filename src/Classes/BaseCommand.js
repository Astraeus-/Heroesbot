
class BaseCommand {
  constructor (permissions, options) {
    /* eslint-disable */
    this.permissions  = permissions
    this.prefix       = options.prefix
    this.command      = options.command
    this.category     = typeof options.category     != 'undefined' ? options.category     : ''
    this.aliases      = typeof options.aliases      != 'undefined' ? options.aliases      : []
    this.min_args     = typeof options.min_args     != 'undefined' ? options.min_args     : 0
    this.description  = typeof options.description  != 'undefined' ? options.description  : 'No description'
    this.syntax       = typeof options.syntax       != 'undefined' ? options.syntax       : options.command
    this.cooldown     = typeof options.cooldown     != 'undefined' ? options.cooldown     : 0
    this.invokeDM     = typeof options.invokeDM     != 'undefined' ? options.invokeDM     : true
    this.enabled      = typeof options.enabled      != 'undefined' ? options.enabled      : true
    this.delInvokeMsg = typeof options.delInvokeMsg != 'undefined' ? options.delInvokeMsg : false
    this.ignoreInHelp = typeof options.ignoreInHelp != 'undefined' ? options.ignoreInHelp : false
    /* eslint-enable */
  }
}

module.exports = BaseCommand;
