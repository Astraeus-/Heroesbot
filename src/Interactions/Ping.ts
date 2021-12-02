import Eris, { Constants } from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';

export default class Ping extends BaseInteraction {
  constructor() {
    const name = 'Ping';
    const description = 'Pings heroesbot';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options = new Array<Eris.ApplicationCommandOptions>();
    const enabled = false;

    super(name, description, options, type, enabled);
  }

  execute (interaction: Eris.CommandInteraction) {
    interaction.createMessage({content: 'Pong', flags: Constants.MessageFlags.EPHEMERAL});
  }
}
