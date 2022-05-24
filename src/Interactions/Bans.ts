import Eris, { Constants, EmbedOptions } from 'eris';
import BaseInteraction from '../Classes/BaseInteraction';
import HeroesLoungeApi from '../Classes/HeroesLounge';
import { embedDefault } from '../config';
import { Logger } from '../util';

export default class Bans extends BaseInteraction {
  constructor() {
    const name = 'Bans';
    const description = 'Lists all of the current bans and bugs for the Amateur League';
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options = new Array<Eris.ApplicationCommandOptions>();

    super(name, description, options, type);
  }

  async execute (interaction: Eris.CommandInteraction) {
    await interaction.acknowledge();

    const embed: EmbedOptions = {
      title: 'Heroes Lounge Amateur League',
      color: embedDefault.color,
      description: '[Current bans and known bugs](https://heroeslounge.gg/general/ruleset)',
      fields: [
        {
          name: 'Banned Heroes',
          value: '',
          inline: true
        },
        {
          name: 'Banned Bugs',
          value: '',
          inline: true
        },
        {
          name: 'Banned Talents',
          value: '',
          inline: true
        }
      ]
    };

    if (!embed.fields) return;

    const bans = await HeroesLoungeApi.getBans();

    if (bans.length === 0) {
      return interaction.createFollowup({
        content: 'No additional bans',
        flags: Constants.MessageFlags.EPHEMERAL,
      });
    }

    for (const ban of bans) {
      if (ban.literal) {
        embed.fields[1].value += `-${ban.literal}\n`;
      } else {
        if (ban.talent_id && ban.hero_id) {
          const talent = await HeroesLoungeApi.getTalent(ban.talent_id).catch((error) => {
            Logger.warn('Unable to get talent info', error);
          });
          const hero = await HeroesLoungeApi.getHero(ban.hero_id).catch((error) => {
            Logger.warn('Unable to get hero info', error);
          });
          if (hero && talent) {
            embed.fields[2].value += `-${hero.title}- ${talent.title}\n`;
          }
        } else if (ban.hero_id) {
          const hero = await HeroesLoungeApi.getHero(ban.hero_id).catch((error) => {
            Logger.warn('Unable to get hero info', error);
          });

          if (hero) {
            let roundInfo = '';

            if (ban.round_start && ban.round_length) {
              roundInfo = `Rounds[${ban.round_start}-${ban.round_start + ban.round_length}]`;
            }
            embed.fields[0].value += `-${hero.title} ${roundInfo}\n`;
          }
        }
      }
    }

    for (const field in embed.fields) {
      if (embed.fields[field].value.length === 0) embed.fields[field].value += '-None';
    }

    return interaction.createFollowup({embeds: [embed]});
  }
}
