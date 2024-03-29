import Eris from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';

export default class Time extends BaseInteraction {
  constructor() {
    const name = 'Time';
    const description = 'Outputs the time of the invokers message';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options = new Array<Eris.ApplicationCommandOptions>();

    super(name, description, options, type);
  }

  execute (interaction: Eris.CommandInteraction) {
    const timestamp = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: 'numeric',
      second: 'numeric',
    }).format(Date.now());
        
    return interaction.createMessage(`The current time is ${timestamp}`);
  }
}
