import Eris, { Constants, GuildChannel } from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';
import { defaultServer } from '../config';

export default class Sub extends BaseInteraction {
  constructor() {
    const name = 'Sub';
    const description = 'Add or remove yourself from a sub player group';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options: Eris.ApplicationCommandOptions[] = [
      {
        name: 'group',
        description: 'Group to update participation',
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: true,
        choices: [
          {name: 'Division 1', value: 'Sub Division 1'},
          {name: 'Division 2', value: 'Sub Division 2'},
          {name: 'Division 3', value: 'Sub Division 3'},
          {name: 'Division 4', value: 'Sub Division 4'},
          {name: 'Division 5', value: 'Sub Division 5'},
        ],
      },
    ];

    super(name, description, options, type);
  }

  execute (interaction: Eris.CommandInteraction) {
    const specifiedSubRole = this.getStringValueFromCommandInteraction('group', interaction);

    if (!specifiedSubRole) {
      return interaction.createMessage({
        content: 'Invalid role',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }
    
    if (!(interaction.channel instanceof GuildChannel) || interaction.channel.guild.id !== defaultServer) {
      return interaction.createMessage({
        content: 'Invalid guild',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    const guild = interaction.channel.guild;
    const specifiedRole = guild.roles.find(role => role.name === specifiedSubRole);

    if (!specifiedRole) {
      return interaction.createMessage({
        content: 'Invalid role',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    if (!interaction.member) {
      return interaction.createMessage({
        content: 'Could not retrieve member data',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    let status = '';
    if (interaction.member.roles.includes(specifiedRole.id)) {
      interaction.member.removeRole(specifiedRole.id);
      status = 'Removed';
    } else {
      interaction.member.addRole(specifiedRole.id);
      status = 'Added';
    }

    return interaction.createMessage({
      content: `${status} ${specifiedSubRole}`,
      flags: Constants.MessageFlags.EPHEMERAL,
    }); 
  }
}
