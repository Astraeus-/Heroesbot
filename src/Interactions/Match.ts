import Eris from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';
import { embedDefault } from '../config';

export default class Match extends BaseInteraction {
  constructor() {
    const name = 'Match';
    const description = 'Determines whether you have map pick or first pick';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options = new Array<Eris.ApplicationCommandOptions>();

    super(name, description, options, type);
  }

  execute (interaction: Eris.CommandInteraction) {
    const embed : Eris.EmbedOptions = {
      color: embedDefault.color,
      footer: {
        text: 'If you require further assistance, contact one of our moderators',
      },
      description: '[Amateur series rules](https://heroeslounge.gg/general/ruleset)\nAmateur Series teams ban two maps each, as according to their ruleset\nThese maps are currently in the pool:\n\n-Alterac Pass\n-Battlefield of Eternity\n-Braxis Holdout\n-Cursed Hollow\n-Dragon Shire\n-Garden of Terror\n-Infernal Shrines\n-Sky Temple\n-Tomb of the Spider Queen\n-Towers of Doom\n-Volskaya Foundry\n',
    };

    const author = interaction.guildID ? interaction.member : interaction.user;

    if (!author)
      return interaction.createFollowup('Unknown caller');

    const map = '```\n' + author.username + ': Map pick \nOpponent: First pick \n```\n' + author.username + ', please ban a map first.';
    const pick = '```\n' + author.username + ': First pick \nOpponent: Map pick \n```\nOpponent, please ban a map first.';
    
    embed.description += 'The draft order has been randomly determined:\n';
    embed.description += Math.random() >= 0.5 ? map : pick;

    return interaction.createMessage({embeds: [embed]});
  }
}
