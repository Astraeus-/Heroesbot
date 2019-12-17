
const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');
const MMRCalc = require('../Classes/MMRCalculator.js');

const regions = require('../util.js').blizzardRegion;
const { embedDefault, hpApiKey} = require('../config.js');
const hp = require('heroesprofile-api');
const hpHandler = new hp(hpApiKey);
const https = require('https');

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
      'description': 'Queries the HotsLogs or Heroes Profile Api for data on a Battletag.',
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
    const type = 'Heroes Profile';

    if (!blizzardRegionId || !battletag.match(/[a-zA-Z0-9]{2,11}#[0-9]{1,6}/g)) {
      return msg.author.getDMChannel().then((channel) => {
        return channel.createMessage('Unable to retrieve data: Invalid region or battletag specified');
      });
    }

    return msg.author.getDMChannel().then(async (channel) => {
      let data;

      if (type === 'Heroes Profile') {
        data = await getHeroesProfileMMR(battletag, blizzardRegionId).catch(() => {
          data = undefined;
        });
      } else {
        data = await getHotsLogsDetails(blizzardRegionId, battletag);
      }

      if (data) {
        embed.title = `${battletag}\nRegion: ${specifiedRegion}`;
        let leaderboardData;
        let averageMMR;
        let ratings;

        if (type === 'Heroes Profile') {
          const playerProfile = await getHeroesProfilePlayer(battletag, blizzardRegionId).catch((error) => Logger.warn('Unable to retrieve Heroes Profile player details', error));
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
        } else if (type === 'HotsLogs') {
          leaderboardData = data.LeaderboardRankings;
          ratings = MMRCalc.getRatingsHotsLogs(leaderboardData);

          embed.description = `[HotsLogs](https://www.hotslogs.com/Player/Profile?PlayerID=${data.PlayerID})`;

          for (let i = 0; i < leaderboardData.length; i++) {
            embed.fields[i] = {
              name: leaderboardData[i].GameMode,
              value: leaderboardData[i].LeagueRank !== null ? `__***${leaderboardData[i].CurrentMMR}***__` : `_${leaderboardData[i].CurrentMMR}_`,
              inline: true
            };
          }

          averageMMR = MMRCalc.calculateHotsLogsAverageMMR(ratings);
        }

        if (averageMMR) {
          embed.fields[embed.fields.length] = {
            name: 'Average MMR',
            value: `__***${averageMMR}***__`,
            inline: true
          };
        }

        return channel.createMessage({ embed: embed });
      } else {
        return channel.createMessage(`No data for battletag: ${battletag} in region ${specifiedRegion}`);
      }
    });
  }
}

const getHeroesProfilePlayer = (battletag, region) => {
  return hpHandler.getPlayer(battletag, region);
};

const getHeroesProfileMMR = (battletag, region) => {
  return hpHandler.getPlayerMMR(battletag, region);
};

const getHotsLogsDetails = (regionId, battletag) => {
  const formattedBattletag = battletag.replace('#', '_');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.hotslogs.com',
      path: `/Public/Players/${regionId}/${formattedBattletag}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let rawResponse = '';
      res.setEncoding('utf8');

      res.on('data', (d) => {
        rawResponse += d;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(rawResponse);
            resolve(response);
          } catch (err) {
            reject(Error('Parse JSON response'));
          }
        } else {
          reject(Error(`status Code ${res.statusCode} : Invalid request`));
        }
      });
    });

    req.on('error', (error) => {
      Logger.error('Could not request HotsLogs data', error);
      reject(Error('Could not request data'));
    });

    req.end();
  });
};

module.exports = CheckBattleTag;
