
const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');
const MMRCalc = require('../Classes/MMRCalculator.js');

const regions = require('../util.js').blizzardRegion;
const { embedDefault, hpApiKey} = require('../config.js');
const hp = require('heroesprofile-api');
const hpHandler = new hp(hpApiKey);

class CheckBattleTag extends BaseCommand {
  constructor () {
    const permissions = {
      'Test-Server': {
        'channels': ['robotchannel'],
        'roles': ['Admin'],
        'users': []
      },
      'Heroes Lounge': {
        'channels': ['devops'],
        'roles': ['Lounge Master', 'Board', 'Managers', 'Moderators'],
        'users': []
      }
    };

    const options = {
      'prefix': '!',
      'command': 'checkbattletag',
      'category': 'competition',
      'aliases': ['cbt', 'mmr'],
      'description': 'Heroes Profile MMR info for a Battletag.',
      'syntax': 'checkbattletag <region> <name#12345>',
      'min_args': 2
    };
    
    super(permissions, options);
  }

  async exec (msg, args) {
    const embed = {
      color: embedDefault.color,
      footer: embedDefault.footer,
      title: '',
      fields: [
      ]
    };

    const specifiedRegion = args[0].toLowerCase();
    const region = regions.find(region => region.name === specifiedRegion);
    const blizzardRegionId = region && region.blizzardRegion ? region.blizzardRegion : null;
    const battletag = args[1];

    if (!blizzardRegionId || !battletag.match(/[a-zA-Z0-9]{2,11}#[0-9]{1,6}/g)) {
      return msg.author.getDMChannel().then((channel) => {
        return channel.createMessage('Unable to retrieve data: Invalid region or battletag specified');
      });
    }

    return msg.author.getDMChannel().then(async (channel) => {
      const data = await hpHandler.getPlayerMMR(battletag, blizzardRegionId).catch(() => {
        return undefined;
      });

      if (!data) {
        return channel.createMessage(`No data for battletag: ${battletag} in region ${specifiedRegion}`);
      }

      embed.title = `${battletag}\nRegion: ${specifiedRegion}`;
      let leaderboardData;
      let averageMMR;
      let ratings;

      const playerProfile = await hpHandler.getPlayer(battletag, blizzardRegionId).catch((error) => Logger.warn('Unable to retrieve Heroes Profile player details', error));
      leaderboardData = data[battletag];
      ratings = MMRCalc.getRatingsHeroesProfile(leaderboardData);
      embed.description = `[Heroes Profile](${playerProfile.profile})`;

      const leaderboardDataKeys = Object.keys(leaderboardData);

      for (const key of leaderboardDataKeys) {
        const gameMode = leaderboardData[key];
        const fieldData = {
          name: key,
          value: '',
          inline: true
        };

        if (ratings.has(key) && ratings.get(key).active) {
          fieldData.value = `__*** ${gameMode.mmr}***__`;
        } else {
          fieldData.value = `${gameMode.mmr}`;
        }

        embed.fields.push(fieldData);
      }

      averageMMR = MMRCalc.calculateHeroesProfileAverageMMR(ratings);

      if (averageMMR) {
        embed.fields[embed.fields.length] = {
          name: 'Average MMR',
          value: `__***${averageMMR}***__`,
          inline: true
        };
      }

      return channel.createMessage({ embed: embed });
      
    });
  }
}

module.exports = CheckBattleTag;
