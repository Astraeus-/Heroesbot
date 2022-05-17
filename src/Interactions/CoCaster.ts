import Eris, { Constants, GuildChannel } from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';
import { defaultServer } from '../config';

export default class CoCaster extends BaseInteraction {
  constructor() {
    const name = 'CoCaster';
    const description = 'Add or remove yourself from the CoCaster group';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options = new Array<Eris.ApplicationCommandOptions>();

    super(name, description, options, type);
  }

  execute (interaction: Eris.CommandInteraction) {    
    if (!(interaction.channel instanceof GuildChannel) || interaction.channel.guild.id !== defaultServer) {
      return interaction.createMessage({
        content: 'Invalid guild',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    const guild = interaction.channel.guild;
    const role = guild.roles.find(role => role.name === 'CoCasters');

    if (!role) {
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
    if (interaction.member.roles.includes(role.id)) {
      interaction.member.removeRole(role.id);
      status = 'Removed';
    } else {
      interaction.member.addRole(role.id);
      status = 'Added';
    }

    return interaction.createMessage({
      content: `${status} ${role.name} role`,
      flags: Constants.MessageFlags.EPHEMERAL,
    }); 
  }
}
