import { CommandInteraction } from 'eris';
import HeroesbotClient from '../Client';
import { Logger } from '../util';

export default (client: HeroesbotClient) => {
  client.on('interactionCreate', (interaction) => {        
    if (!client.ready) return;

    if (interaction instanceof CommandInteraction) {
      Logger.debug('Interaction to execute', interaction.data);

      const interactionName = interaction.data.name;

      const interactionToExecute = client.guildInteractionCommands.get(interactionName) || client.globalInteractionCommands.get(interactionName);

      if (interactionToExecute) {
        try {
          interactionToExecute.execute(interaction);
        } catch (error) {
          Logger.error(`Could not execute interaction ${interaction.data.name}`, error);
        }
      }
    } else {
      Logger.warn('Unknown interaction', interaction);
    }
  });
};
