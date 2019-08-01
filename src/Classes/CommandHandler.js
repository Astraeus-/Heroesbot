
class CommandHandler {
  constructor (bot) {
    this.bot = bot
    this.commandCooldowns = []
  }

  findCommand (command) {
    command = command.toLowerCase()
    const commands = Array.from(this.bot.commands.values())
    return commands.find((c) => c.command === command || c.aliases.includes(command))
  }

  addCooldown (command, channelID, cooldown) {
    if (cooldown === 0) return // Do not need to add cooldowns for 0 cooldown commands.
    this.commandCooldowns.push({
      command: command.command,
      channelID: channelID,
      cooldown: new Date(Date.now() + cooldown)
    })
  }

  checkCooldown (command, channelID) {
    const cooldown = this.commandCooldowns.findIndex((c) => {
      if (c) return (c.channelID === channelID && c.command === command.command)
    })
    let cooldownRemaining

    if (cooldown >= 0) {
      const endCooldown = new Date(this.commandCooldowns[cooldown].cooldown)
      const date = Date.now()
      if (date < endCooldown) {
        cooldownRemaining = endCooldown - date
      } else {
        delete this.commandCooldowns[cooldown]
      }
    }

    return cooldownRemaining
  }

  checkPermissions (command, msg) {
    const permissions = command.permissions
    const guildName = msg.channel.guild.name
    const channels = permissions[guildName].channels
    const roles = permissions[guildName].roles
    const guildRoles = this.bot.guilds.get(msg.channel.guild.id).roles
    const users = permissions[guildName].users

    let memberRoles = this.bot.guilds.get(msg.channel.guild.id).members.get(msg.author.id).roles
    memberRoles = memberRoles.map((r) => {
      return guildRoles.get(r).name
    })

    const permits = {
      server: Object.keys(permissions).includes(guildName),
      channel: channels.includes(msg.channel.name) || channels.length === 0,
      role: roles.some((r) => memberRoles.includes(r)) || roles.length === 0,
      user: users.includes(msg.author.id) || users.length === 0
    }
    const memberPermits = roles.length > 0 && users.length > 0 ? permits.role || permits.user : permits.role && permits.user
    const hasPermission = permits.server && permits.channel && memberPermits

    return hasPermission
  }

  checkUsersPermission (command, msg) {
    const permissions = command.permissions
    const invokerId = msg.author.id
    let usersArray = []
    let hasPermission = false

    for (const server in permissions) {
      usersArray = usersArray.concat(permissions[server].users)
    }

    if (usersArray.length === 0 || usersArray.includes(invokerId)) {
      hasPermission = true
    } else {
      hasPermission = false
    }

    return hasPermission
  }

  listArguments (invoke, msg) {
    const startPos = msg.content.indexOf(invoke)
    const commandArgs = msg.content.slice(startPos + invoke.length + 1, msg.content.length)
    let parameters

    if (commandArgs) {
      parameters = commandArgs.split(' ')
    } else {
      parameters = []
    }
    return parameters
  }
}

module.exports = CommandHandler
