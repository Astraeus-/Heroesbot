import Eris, { Constants } from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';

export default class Ping extends BaseInteraction {
  constructor() {
    const name = 'Ping';
    const description = 'Pings heroesbot';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options = new Array<Eris.ApplicationCommandOptions>();
    const permissions: Eris.ApplicationCommandPermissions[] = [
      {
        id: '200988760027037698', // Lounge master
        type: Constants.ApplicationCommandPermissionTypes.ROLE,
        permission: true,
      },
      {
        id: '386451356908781568', // Board
        type: Constants.ApplicationCommandPermissionTypes.ROLE,
        permission: true,
      },
      {
        id: '494793884942073856', // Managers
        type: Constants.ApplicationCommandPermissionTypes.ROLE,
        permission: true,
      },
    ];

    super(name, description, options, type, permissions);
  }

  execute (interaction: Eris.CommandInteraction) {
    interaction.createMessage({content: 'Pong', flags: Constants.MessageFlags.EPHEMERAL});
  }
}
