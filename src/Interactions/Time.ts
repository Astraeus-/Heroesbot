import Eris from 'eris';
import dateformat from 'date-fns/format';
import BaseInteraction from '../Classes/BaseInteraction';

export default class Time extends BaseInteraction {
  constructor() {
    const name = 'Time';
    const description = 'Outputs the time of the invokers message';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options = new Array<Eris.ApplicationCommandOptions>();
    const permissions = new Array<Eris.ApplicationCommandPermissions>();

    super(name, description, options, type, permissions);
  }

  execute (interaction: Eris.CommandInteraction) {
    const timestamp = dateformat(Date.now(), 'hh:mm:ss a');
        
    interaction.createMessage(`The current time is ${timestamp}`);
  }
}
