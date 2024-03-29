import Eris, { Constants, EmbedOptions } from 'eris';
import HP from 'heroesprofile-api';
import BaseInteraction from '../Classes/BaseInteraction';
import MMRCalculator from '../Classes/MMRCalculator';
import { embedDefault, hpApiKey } from '../config';
import { GameDataObject, GameMode, GameModeDataActive } from '../types';
import { Logger, regions } from '../util';

export default class Checkbattletag extends BaseInteraction {
  constructor() {
    const name = 'cbt';
    const description = 'Heroes profile MMR info for a Battletag';
    const global = true;
    const type = Eris.Constants.ApplicationCommandTypes.CHAT_INPUT;
    const options: Eris.ApplicationCommandOptions[] = [
      {
        name: 'region',
        description: 'Region of the Battletag',
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: true,
        choices: [
          {name: 'EU', value: 'eu'},
          {name: 'NA', value: 'na'},
          {name: 'KR', value: 'kr'},
          {name: 'CN', value: 'cn'},
        ],
      },
      {
        name: 'battletag',
        description: 'Battletag to check',
        type: Constants.ApplicationCommandOptionTypes.STRING,
        required: true,
      }
    ];

    super(name, description, options, type, global);
  }

  async execute (interaction: Eris.CommandInteraction) {
    await interaction.acknowledge(Constants.MessageFlags.EPHEMERAL);
    const embed: EmbedOptions = {
      color: embedDefault.color,
      title: '',
    };

    embed.fields = [];

    const specifiedRegion = this.getStringValueFromCommandInteraction('region', interaction);
    const region = specifiedRegion && regions.find(region => region.name === specifiedRegion);
    const battletag = this.getStringValueFromCommandInteraction('battletag', interaction);

    if (!region || !battletag) return interaction.createMessage('Missing region or battletag');
    if (!battletag.match(/[a-zA-Z0-9]{2,11}#[0-9]{1,6}/g)) return interaction.createMessage('Unable to retrieve data: Invalid battletag');
        
    const blizzardRegionID = region.blizzardRegion;

    const HpHandler = new HP(hpApiKey);
    const data = await HpHandler.getPlayerMMR(battletag, blizzardRegionID).catch(() => {
      return undefined;
    });

    if (!data) {
      return interaction.createMessage(`No data for battletag: ${battletag} in region ${specifiedRegion}`);
    }

    embed.title = `${battletag}\nRegion: ${specifiedRegion}`;
    const leaderboardData: GameDataObject = data[battletag];
    const ratings: Map<GameMode, GameModeDataActive> = MMRCalculator.getRatingsHeroesProfile(leaderboardData);
    const averageMMR: number = MMRCalculator.calculateHeroesProfileAverageMMR(ratings);

    const playerProfile = await HpHandler.getPlayer(battletag, blizzardRegionID).catch((error: Error) => Logger.warn('Unable to retrieve Heroes Profile player details', error));
    embed.description = `[Heroes Profile](${playerProfile.profile})`;

    const leaderboardDataKeys = Object.keys(leaderboardData);

    for (const key of leaderboardDataKeys) {
      const gameMode = leaderboardData[key];
      const fieldData = {
        name: key,
        value: `${gameMode.mmr}`,
        inline: true
      };

      embed.fields.push(fieldData);
    }

    if (averageMMR) {
      embed.fields[embed.fields.length] = {
        name: 'Heroes Lounge MMR',
        value: `__***${averageMMR}***__`,
        inline: true
      };
    }

    return interaction.createMessage({embeds: [embed]});
  }
}
