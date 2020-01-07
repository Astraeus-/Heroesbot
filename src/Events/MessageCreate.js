const Handler = require('../Classes/CommandHandler.js');
const { Logger } = require('../util.js');
const { webhooks, env, embedDefault } = require('../config.js');
const WebhookClient = require('../Classes/WebhookClient.js');
const webhook = new WebhookClient(webhooks.commandLogs.id, webhooks.commandLogs.token);

const errorMessage = {
  invalidArgumentCount: 'Invalid number of arguments',
  onCooldown: 'Command is currently on cooldown',
  invalidPermissions: 'User does not have permission to use command',
  dataRequest: 'Could not request data'
};

module.exports = (bot) => {
  const CommandHandler = new Handler(bot);
  bot.on('messageCreate', async (msg) => {
    if (!bot.ready || !msg.author || msg.author.bot) return; // Ignore webhooks and bot users.
    const commands = msg.content.match(/(?:!|#)(\S+)/gim); // regular expression to get anything starting with ! or # and any following characters except the white space.
    let args;

    if (commands) {
      let command;
      for (let i = 0; i < commands.length; i++) {
        const curr = CommandHandler.findCommand(commands[i].slice(1), bot.commands);
        if (curr) {
          command = curr;
          args = CommandHandler.listArguments(commands[i], msg);
          break; // Only try to execute the first command we find.
        }
      }

      if (command) {
        if (!command.enabled) return msg.author.getDMChannel().then((channel) => channel.createMessage(`Command ${command.prefix + command.command} is disabled`));
        if (!msg.channel.guild && !command.invokeDM) return msg.channel.createMessage(`The command ${command.prefix + command.command} is disabled for use in DM's`);
        
        let executionError = {
          hasError: false,
          errorMessage: ''
        };

        try {
          if (args.length < command.min_args) {
            throw Error(errorMessage.invalidArgumentCount);
          }

          const cooldown = CommandHandler.checkCooldown(command, msg.channel.id);
          if (cooldown) {
            if (command.prefix === '!') {
              throw Error(errorMessage.onCooldown);
            }
          }

          const hasPermissions = msg.channel.guild ? CommandHandler.checkPermissions(command, msg) : CommandHandler.checkUsersPermission(command, msg);
          if (!hasPermissions) {
            if (command.prefix === '!') {
              throw Error(errorMessage.invalidPermissions);
            }
          }

          await command.exec(msg, args);
          CommandHandler.addCooldown(command, msg.channel.id);
        } catch (error) {
          let responseMessage = '';
          executionError.hasError = true;
          executionError.errorMessage = error.message;

          if (error.message === errorMessage.invalidPermissions) {
            responseMessage = `You do not have permission to use ${command.prefix + command.command}`;
          } else if (error.message === errorMessage.invalidArgumentCount) {
            responseMessage = `**Invalid number of arguments**\n\nCommand usage: ${command.prefix}${command.syntax}`;
          } else if (error.message === errorMessage.onCooldown) {
            responseMessage = `The command ${command.prefix + command.command} is on cooldown`;
          } else if (error.message === errorMessage.dataRequest) {
            responseMessage = `The command ${command.prefix + command.command} is currently unavailable`;
          } else {
            /*
                Commands handle sending responses for other errors themselves.
                This is just the catch all for our logger.
              */
            responseMessage = `Error executing command ${command.prefix + command.command} please try again later or contact Astraeus`;
            Logger.error(`Error executing command: ${command.command}`, error);
          }

          msg.author.getDMChannel().then((channel) => {
            return channel.createMessage(responseMessage);
          }).catch((error) => {
            Logger.warn(`Could not inform about errors for ${command.prefix + command.command}`, error);
          });
        } finally {
          if (env === 'production') {
            const commandAuthor = `${msg.author.username}#${msg.author.discriminator}`;
            const invokeChannel = msg.channel.guild ? `${msg.channel.name}` : 'DM Channel';
            const commandArgs = command.prefix === '!' ? args : '';

            const embeds = [];
            const webhookMessage = {
              title: `Command: ${command.prefix}${command.command}`,
              color: embedDefault.color,
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
