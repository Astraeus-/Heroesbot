import { Message } from 'eris';
import Handler from '../Classes/CommandHandler';
import HeroesbotClient from '../Client';
import { Logger } from '../util';

const errorMessage = {
  invalidArgumentCount: 'Invalid number of arguments',
  onCooldown: 'Command is currently on cooldown',
  invalidPermissions: 'User does not have permission to use command',
  dataRequest: 'Could not request data'
};

export default (client: HeroesbotClient) => {
  const CommandHandler = new Handler();

  client.on('messageCreate', async (message: Message) => {
    if (!client.ready || !message.author || message.author.bot) return; // Ignore webhooks and bot users.
    const commands = message.content.match(/(?:!|#)(\S+)/gim); // regular expression to get anything starting with ! or # and any following characters except the white space.
    let args;

    if (commands) {
      let command;
      for (let i = 0; i < commands.length; i++) {
        const curr = CommandHandler.findCommand(commands[i].slice(1), client.interactionCommands);
        if (curr) {
          command = curr;
          args = CommandHandler.listArguments(commands[i], message);
          break; // Only try to execute the first command we find.
        }
      }

      if (command) {
        if (!command.enabled) return message.author.getDMChannel().then((channel) => channel.createMessage(`Command ${command.prefix + command.command} is disabled`));
        if (!message.guildID && !command.invokeDM) return message.channel.createMessage(`The command ${command.prefix + command.command} is disabled for use in DM's`);
        
        const executionError = {
          hasError: false,
          errorMessage: ''
        };

        try {
          if (args.length < command.min_args) {
            throw Error(errorMessage.invalidArgumentCount);
          }

          const cooldown = CommandHandler.checkCooldown(command, message.channel.id);
          if (cooldown) {
            if (command.prefix === '!') {
              throw Error(errorMessage.onCooldown);
            }
          }

          const hasPermissions = message.guildID ? CommandHandler.checkPermissions(command, message) : CommandHandler.checkUsersPermission(command, message);
          if (!hasPermissions) {
            if (command.prefix === '!') {
              throw Error(errorMessage.invalidPermissions);
            }
          }

          await command.exec(message, args);
          CommandHandler.addCooldown(command, message.channel.id);
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
            responseMessage = `Error executing command ${command.prefix + command.command} please try again later`;
            Logger.error(`Error executing command: ${command.command}`, error);
          }

          message.author.getDMChannel().then((channel) => {
            return channel.createMessage(responseMessage);
          }).catch((error) => {
            Logger.warn(`Could not inform about errors for ${command.prefix + command.command}`, error);
          });
        }
      }
    }
  });
};
