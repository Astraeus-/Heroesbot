
class CommandHandler {
  constructor () {
    this.commandCooldowns = [];
  }

  findCommand (command, commandList) {
    command = command.toLowerCase();
    const commands = Array.from(commandList.values());
    return commands.find((c) => c.command === command || c.aliases.includes(command));
  }

  addCooldown (command, channelID) {
    if (command.cooldown === 0) return; // Do not need to add cooldowns for 0 cooldown commands.
    this.commandCooldowns.push({
      command: command.command,
      channelID: channelID,
      cooldown: new Date(Date.now() + command.cooldown)
    });
  }

  checkCooldown (command, channelID) {
    const cooldown = this.commandCooldowns.findIndex((c) => {
      if (c) return (c.channelID === channelID && c.command === command.command);
    });
    let cooldownRemaining;

    if (cooldown >= 0) {
      const endCooldown = new Date(this.commandCooldowns[cooldown].cooldown);
      const date = Date.now();
      if (date < endCooldown) {
        cooldownRemaining = endCooldown - date;
      } else {
        delete this.commandCooldowns[cooldown];
      }
    }

    return cooldownRemaining;
  }

  checkPermissions (command, msg) {
    const guild = msg.channel.guild;
    const permissions = command.permissions;
    const guildPermissions = permissions[guild.name];

    if (!guildPermissions || !(guildPermissions.channels.includes(msg.channel.name) || guildPermissions.channels.length === 0)) return false;
    if (guildPermissions.roles.length === 0 && guildPermissions.users.length === 0) return true;

    const member = guild.members.get(msg.author.id);
    const memberRoleNames = member.roles.map((r) => guild.roles.get(r).name);
    const rolePermission = guildPermissions.roles.some((r) => memberRoleNames.includes(r));
    const userPermission = guildPermissions.users.includes(msg.author.id);

    if (guildPermissions.roles.length > 0 && guildPermissions.users.length > 0) {
      return rolePermission || userPermission;
    }

    if ((guildPermissions.roles.length > 0 && rolePermission) || (guildPermissions.users.length > 0 && userPermission)) {
      return true;
    }

    return false;
  }

  checkUsersPermission (command, msg) {
    const permissions = command.permissions;
    let usersArray = [];

    for (const server in permissions) {
      usersArray = usersArray.concat(permissions[server].users);
    }

    return usersArray.length === 0 || usersArray.includes(msg.author.id);
  }

  listArguments (command, msg) {
    const startPos = msg.content.indexOf(command);
    const commandArgs = msg.content.slice(startPos + command.length + 1, msg.content.length);
    let parameters;

    if (commandArgs) {
      parameters = commandArgs.split(' ');
    } else {
      parameters = [];
    }

    return parameters;
  }
}

module.exports = CommandHandler;
