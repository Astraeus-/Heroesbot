const Handler = require('../Classes/CommandHandler.js');
const { Logger } = require('../util.js');
const { webhooks, environment } = require('../config.js');
const WebhookClient = require('../Classes/WebhookClient.js');
const webhook = new WebhookClient(webhooks.commandLogs.id, webhooks.commandLogs.token);

module.exports = (bot) => {
  const CommandHandler = new Handler(bot);
  bot.on('messageCreate', async (msg) => {
    if (!bot.ready || !msg.author || msg.author.bot) return; // Ignore webhooks and bot users.
    const commands = msg.content.match(/(?:!|#)(\S+)/gim); // regular expression to get anything starting with ! or # and any following characters except the white space.
    let args;

    if (commands) {
      let command;
      for (let i = 0; i < commands.length; i++) {
        const curr = CommandHandler.findCommand(commands[i].slice(1));
        if (curr) {
          command = curr;
          args = CommandHandler.listArguments(commands[i], msg);
          break; // Only try to execute the first command we find.
        }
      }

      if (command) {
        if (!command.enabled) return bot.getDMChannel(msg.author.id).then((channel) => channel.createMessage(`Command ${command.prefix + command.command} is disabled`));
        if (!msg.channel.guild && !command.invokeDM) return msg.channel.createMessage(`The command ${command.prefix + command.command} is disabled for use in DM's`);
        
        let executionError = {
          hasError: false,
          errorMessage: ''
        };

        try {
          if (args.length < command.min_args) {
            throw Error('Invalid number of arguments');
          }

          const cooldown = CommandHandler.checkCooldown(command, msg.channel.id);
          if (cooldown) {
            if (command.prefix === '!') {
              throw Error('Command is current on cooldown');
            }
          }

          const hasPermissions = msg.channel.guild ? CommandHandler.checkPermissions(command, msg) : CommandHandler.checkUsersPermission(command, msg);
          if (!hasPermissions) {
            if (command.prefix === '!') {
              throw Error('User does not have permission to use command');
            }
          }

          await command.exec(msg, args);
          CommandHandler.addCooldown(command, msg.channel.id, command.cooldown);
        } catch (error) {
          executionError.hasError = true;
          executionError.errorMessage = error.message;

          if (error.message === 'User does not have permission to use command') {
            bot.getDMChannel(msg.author.id).then((channel) => {
              return channel.createMessage(`You do not have permission to use ${command.prefix + command.command}`);
            }).catch((error) => {
              Logger.warn(`Could not inform about no permission for ${command.prefix + command.command}`, error);
            });
          } else if (error.message === 'Invalid number of arguments') {
            bot.getDMChannel(msg.author.id).then((channel) => {
              channel.createMessage(`**Invalid number of arguments**\n\nCommand usage: ${command.prefix}${command.syntax}`);
            }).catch((error) => {
              Logger.warn(`Could not inform invalid number of arguments for ${command.command}`, error);
            });
          } else if (error.message === 'Command is current on cooldown') {
            bot.getDMChannel(msg.author.id).then((channel) => {
              return channel.createMessage(`The command ${command.prefix + command.command} is on cooldown`);
            }).catch((error) => {
              Logger.warn(`Could not inform about ${command.prefix + command.command} being on cooldown`, error);
            });
          } else {
            /*
                Commands handle sending responses for other errors themselves.
                This is just the catch all for our logger.
              */
            Logger.error('Command execution', error);
          }
        } finally {
          if (environment === 'production') {
            const commandAuthor = `${msg.author.username}#${msg.author.discriminator}`;
            const invokeChannel = msg.channel.guild ? `${msg.channel.name}` : 'DM Channel';
            const commandArgs = command.prefix === '!' ? args : '';

            const embeds = [];
            const webhookMessage = {
              title: `Command: ${command.prefix}${command.command}`,
              color: bot.embed.color,
              description: `Arguments: ${commandArgs} \nChannel: ${invokeChannel} \nUser: ${commandAuthor}`
            };

            if (executionError.hasError) {
              webhookMessage.color = 16711680;
              embeds.push({
                title: 'Error',
                color: 16711680,
                description: `Message: ${executionError.errorMessage}`
              });
            }

            webhook.send(webhookMessage, embeds);
          }
        }
      }
    } else {
      if (msg.channel.type === 1) {
        const author = `${msg.author.username}#${msg.author.discriminator}`;
        const info = `User: ${author}\n${msg.content}`;
        webhook.send({
          title: 'DM suggestion message',
          color: 123456,
          description: info
        });
      }
    }
  });
};
