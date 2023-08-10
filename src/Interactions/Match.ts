import Eris, { Constants } from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';
import { embedDefault } from '../config';

export default class Match extends BaseInteraction {
  constructor() {
    const name = 'Match';
    const description = 'Determines whether you have map pick or first pick';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options: Eris.ApplicationCommandOptions[] = [
      {
        name: 'format',
        description: 'Tournament format',
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: false,
        choices: [
          {name: 'Seaon', value: 'season'},
          {name: 'Meta Madness', value: 'madness'},
        ]
      }
    ];

    super(name, description, options, type);
  }

  execute (interaction: Eris.CommandInteraction) {
    const embed : Eris.EmbedOptions = {
      color: embedDefault.color,
      footer: {
        text: 'If you require further assistance, contact one of our moderators',
      },
    };

    const author = interaction.guildID ? interaction.member : interaction.user;

    if (!author)
      return interaction.createFollowup('Unknown caller');

    const format = this.getStringValueFromCommandInteraction('format', interaction) ?? 'season';

    switch (format) {
    case 'madness':
      this.madness(embed, author);
      break;
    case 'season':
    default:
      this.season(embed, author);
      break;
    }

    return interaction.createMessage({embeds: [embed]});
  }

  madness(embed: Eris.EmbedOptions, author: Eris.Member | Eris.User) {
    const map = '```\n' + author.username + ': Map pick \nOpponent: First pick \n```\n' + author.username + ', please ban a hero first.';
    const pick = '```\n' + author.username + ': First pick \nOpponent: Map pick \n```\nOpponent, please ban a hero first.';

    embed.description = '[Meta Madness rules](https://heroeslounge.gg/meta-madness-ruleset)\nTeams ban five heroes each, two maps each, as according to their ruleset\n\nThe prebanned heroes are:\nAnduin\nBlaze\nBrightwing\nChromie\nDehaka\nHanzo\nHogger\nJohanna\nSylvanas\nValla\n\nThese maps are currently in the pool:\n-Alterac Pass\n-Battlefield of Eternity\n-Braxis Holdout\n-Cursed Hollow\n-Dragon Shire\n-Garden of Terror\n-Infernal Shrines\n-Sky Temple\n-Tomb of the Spider Queen\n-Towers of Doom\n-Volskaya Foundry\n\n';
    embed.description += 'The draft order has been randomly determined:\n';
    embed.description += Math.random() >= 0.5 ? map : pick;
  }

  season(embed: Eris.EmbedOptions, author: Eris.Member | Eris.User) {
    const map = '```\n' + author.username + ': Map pick \nOpponent: First pick \n```\n' + author.username + ', please ban a map first.';
    const pick = '```\n' + author.username + ': First pick \nOpponent: Map pick \n```\nOpponent, please ban a map first.';
    
    embed.description = '[Amateur Series Season rules](https://heroeslounge.gg/general/ruleset)\nAmateur Series teams ban two maps each, as according to their ruleset\n\nThese maps are currently in the pool:\n-Alterac Pass\n-Battlefield of Eternity\n-Braxis Holdout\n-Cursed Hollow\n-Dragon Shire\n-Garden of Terror\n-Infernal Shrines\n-Sky Temple\n-Tomb of the Spider Queen\n-Towers of Doom\n-Volskaya Foundry\n\n';
    embed.description += 'The draft order has been randomly determined:\n';
    embed.description += Math.random() >= 0.5 ? map : pick;

    return embed;
  }
}
