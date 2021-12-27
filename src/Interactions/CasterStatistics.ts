import Eris, { Constants } from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';
import HeroesLoungeApi from '../Classes/HeroesLounge';

export default class CasterStatistics extends BaseInteraction {
  constructor() {
    const name = 'Casterstatistics';
    const description = 'Provides you with the casting statistics between two specified dates';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options: Eris.ApplicationCommandOptions[] = [
      {
        name: 'start',
        description: 'Starting datetime <YYYY-MM-DD>',
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: true,
      },
      {
        name: 'end',
        description: 'Ending datetime <YYYY-MM-DD>',
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: true,
      }
    ];

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

  async execute (interaction: Eris.CommandInteraction) {
    await interaction.acknowledge();

    const start = this.getStringValueFromCommandInteraction('start', interaction);
    const end = this.getStringValueFromCommandInteraction('end', interaction);

    if (!start || !end) {
      return interaction.createFollowup({
        content: 'Invalid start or end time specified',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    const matches = await HeroesLoungeApi.getMatchesWithApprovedCastBetween(start, end);
    
    return interaction.createFollowup({
      content: `There were ${Object.keys(matches).length} casted matches between ${start} and ${end}`,
      flags: Constants.MessageFlags.EPHEMERAL,
    });
  }
}
