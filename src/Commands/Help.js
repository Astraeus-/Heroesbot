const BaseCommand = require('../Classes/BaseCommand.js');

class Help extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: [],
        roles: [],
        users: []
      }
    };

    const options = {
      prefix: '!',
      command: 'help',
      description: 'Lists all of Heroesbot\'s commands. Specify a command for additional info.',
      syntax: 'help <command>'
    };

    super(permissions, options);
    this.bot = bot;
  }

  exec (msg, args) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
      title: '',
      fields: []
    };

    let helpCommand;

    if (args[0]) {
      const helpArg = args[0].toLowerCase();
      const commands = Array.from(this.bot.commands.values());
      helpCommand = commands.find((c) => c.command === helpArg || c.aliases.includes(helpArg));
    }

    if (helpCommand) {
      let aliases = helpCommand.aliases.join(', ');
      if (aliases.length === 0) aliases = 'No command aliases';
      embed.title = `📖 ${helpCommand.prefix + helpCommand.command} help 📖`;
      embed.fields.push({
        name: 'Aliases',
        value: aliases
      }, {
        name: 'Description',
        value: helpCommand.description
      }, {
        name: 'Syntax',
        value: helpCommand.prefix + helpCommand.syntax
      }, {
        name: 'Cooldown',
        value: `${helpCommand.cooldown}ms`
      }, {
        name: 'DM Invokable',
        value: helpCommand.invokeDM
      });
    } else {
      embed.title = '📖 Heroesbot command list 📖';
      this.bot.commands.forEach((command) => {
        if (command.ignoreInHelp) return;
        if (!command.enabled) return;
        embed.fields.push({
          name: command.prefix + command.command,
          value: command.description
        });
      });
    }

    return this.bot.getDMChannel(msg.author.id).then((channel) => {
      return channel.createMessage({
        embed: embed
      });
    }).catch((error) => {
      throw Error(`Unable to provide ${msg.author.username} with help`);
    });
  }
}

module.exports = Help;
