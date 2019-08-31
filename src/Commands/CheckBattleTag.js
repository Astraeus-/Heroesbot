const BaseCommand = require('../Classes/BaseCommand.js');

const https = require('https');
const regions = require('../util.js').hotslogsId;

class CheckBattleTag extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: ['devops'],
        roles: ['Lounge Master', 'Board', 'Managers', 'Moderators'],
        users: []
      }
    };

    const options = {
      prefix: '!',
      command: 'checkbattletag',
      aliases: ['cbt'],
      description: 'Queries the HotsLogs Api for data on a Battletag.',
      syntax: 'checkbattletag <region> <name#12345>',
      min_args: 2
    };

    super(permissions, options);
    this.bot = bot;
  }

  exec (msg, args) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
      title: '',
      fields: [
      ]
    };

    const specifiedRegion = args[0].toLowerCase();
    const region = regions.find(region => region.name === specifiedRegion);
    const hotslogsRegionId = region && region.hotslogsId ? region.hotslogsId : null;
    const battletag = args[1];

    if (!hotslogsRegionId || !battletag.match(/[a-zA-Z0-9]{2,11}#[0-9]{1,6}/g)) {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.createMessage('Unable to retrieve data: Invalid region or battletag specified');
      });
    }

    const formattedBattletag = battletag.replace('#', '_');

    return getHotsLogsDetails(hotslogsRegionId, formattedBattletag).then((HotsLogsInfo) => {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        if (HotsLogsInfo) {
          const leaderboardData = HotsLogsInfo.LeaderboardRankings;
          const averageMMR = calculateAverage(leaderboardData);
          embed.title = `${battletag}\nRegion: ${specifiedRegion}`;
          embed.description = `[HotsLogs](https://www.hotslogs.com/Player/Profile?PlayerID=${HotsLogsInfo.PlayerID})`;
          for (let i = 0; i < leaderboardData.length; i++) {
            embed.fields[i] = {
              name: leaderboardData[i].GameMode,
              value: leaderboardData[i].LeagueRank !== null ? `__***${leaderboardData[i].CurrentMMR}***__` : `_${leaderboardData[i].CurrentMMR}_`,
              inline: true
            };
          }

          if (averageMMR) {
            embed.fields[leaderboardData.length] = {
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
    });
  }
}

const getHotsLogsDetails = (regionId, formattedBattletag) => {
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
      reject(error);
    });

    req.end();
  });
};

const calculateAverage = (LeaderBoardInfo) => {
  const ratings = getModes(LeaderBoardInfo);

  if (ratings.size === 0) return null;

  let totalMMR = 0;
  let divider = 0;

  ratings.forEach((rating, key) => {
    switch (key) {
    case 'StormLeague':
      totalMMR += rating * 0.7;
      divider += 0.7;
      break;
      // case 'HeroLeague':
      //   totalMMR += rating * 0.5
      //   divider += 0.5
      //   break
      // case 'TeamLeague':
      //   totalMMR += rating * 0.3
      //   divider += 0.3
      //   break
    case 'UnrankedDraft':
      totalMMR += rating * 0.3;
      divider += 0.3;
      break;
    }
  });

  return Math.floor(totalMMR / divider);
};

const getModes = (LeaderBoardInfo) => {
  const ratings = new Map();

  for (let i = 0; i < LeaderBoardInfo.length; i++) {
    if (LeaderBoardInfo[i].GameMode === 'UnrankedDraft' || LeaderBoardInfo[i].GameMode === 'StormLeague') {
      if (LeaderBoardInfo[i].LeagueRank !== null) {
        ratings.set(LeaderBoardInfo[i].GameMode, LeaderBoardInfo[i].CurrentMMR);
      }
    }
  }

  if (ratings.size === 0) {
    for (let i = 0; i < LeaderBoardInfo.length; i++) {
      ratings.set(LeaderBoardInfo[i].GameMode, LeaderBoardInfo[i].CurrentMMR);
    }
  }

  return ratings;
};

module.exports = CheckBattleTag;
