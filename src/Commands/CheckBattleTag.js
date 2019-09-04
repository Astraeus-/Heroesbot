const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');
const regions = require('../util.js').blizzardRegion;

const {hpApiKey} = require('../config.js');
const https = require('https');

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
      description: 'Queries the HotsLogs or Heroes Profile Api for data on a Battletag.',
      syntax: 'checkbattletag <region> <name#12345>',
      min_args: 2
    };

    super(permissions, options);
    this.bot = bot;
  }

  async exec (msg, args) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
      title: '',
      fields: [
      ]
    };

    const specifiedRegion = args[0].toLowerCase();
    const region = regions.find(region => region.name === specifiedRegion);
    const regionId = region && region.blizzardRegion ? region.blizzardRegion : null;
    const battletag = args[1];
    const type = 'Heroes Profile';

    if (!regionId || !battletag.match(/[a-zA-Z0-9]{2,11}#[0-9]{1,6}/g)) {
      return this.bot.getDMChannel(msg.author.id).then((channel) => {
        return channel.createMessage('Unable to retrieve data: Invalid region or battletag specified');
      });
    }

    const data = type === 'Heroes Profile' ? await getHeroesProfileDetails(regionId, battletag) : await getHotsLogsDetails(regionId, battletag);

    return this.bot.getDMChannel(msg.author.id).then(async (channel) => {
      if (data) {
        embed.title = `${battletag}\nRegion: ${specifiedRegion}`;
        let leaderboardData;
        let ratings;

        if (type === 'Heroes Profile') {
          const profileLink = await getHeroesProfileId(regionId, battletag).catch((error) => Logger.warn('Unable to retrieve profile Id', error));
          leaderboardData = data[battletag];
          ratings = getRatingsHeroesProfile(leaderboardData);
          embed.description = `[Heroes Profile](https://www.heroesprofile.com/Profile/?blizz_id=${profileLink[0].blizz_id}&battletag=${battletag.match(/^[a-zA-Z0-9]{2,11}/g)}&region=${regionId})`;

          const leaderboardDataKeys = Object.keys(leaderboardData);
          for (const mode in leaderboardDataKeys) {
            const gameMode = leaderboardData[leaderboardDataKeys[mode]];
            embed.fields[mode] = {
              name: leaderboardDataKeys[mode],
              value: `__*** ${gameMode.mmr}***__`,
              inline: true
            };
          }
        } else if (type === 'HotsLogs') {
          leaderboardData = data.LeaderboardRankings;
          ratings = getRatingsHotsLogs(leaderboardData);

          embed.description = `[HotsLogs](https://www.hotslogs.com/Player/Profile?PlayerID=${data.PlayerID})`;

          for (let i = 0; i < leaderboardData.length; i++) {
            embed.fields[i] = {
              name: leaderboardData[i].GameMode,
              value: leaderboardData[i].LeagueRank !== null ? `__***${leaderboardData[i].CurrentMMR}***__` : `_${leaderboardData[i].CurrentMMR}_`,
              inline: true
            };
          }
        }

        const averageMMR = calculateAverageMMR(ratings);

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

const getHeroesProfileId = (regionId, battletag) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'heroesprofile.com',
      path: `/API/Profile/?api_key=${hpApiKey}&battletag=${encodeURIComponent(battletag)}&region=${regionId}`,
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
      Logger.error('Could not request Heroes Profile data', error);
      reject(Error('Could not request data'));
    });

    req.end();
  });
};

const getHeroesProfileDetails = (regionId, battletag) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'heroesprofile.com',
      path: `/API/MMR/Player/?api_key=${hpApiKey}&p_b=${encodeURIComponent(battletag)}&region=${regionId}`,
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
      Logger.error('Could not request Heroes Profile data', error);
      reject(Error('Could not request data'));
    });

    req.end();
  });
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

const calculateAverageMMR = (ratings) => {
  if (ratings.size === 0) return null;

  let totalMMR = 0;
  let divider = 0;

  ratings.forEach((rating, key) => {
    switch (key) {
    case 'Storm League':
    case 'StormLeague':
      totalMMR += rating * 0.7;
      divider += 0.7;
      break;
      // case 'Hero League':
      // case 'HeroLeague':
      //   totalMMR += rating * 0.5
      //   divider += 0.5
      //   break
      // case 'Team League':
      // case 'TeamLeague':
      //   totalMMR += rating * 0.3
      //   divider += 0.3
      //   break
    case 'Unranked Draft':
    case 'UnrankedDraft':
      totalMMR += rating * 0.3;
      divider += 0.3;
      break;
    }
  });

  return Math.floor(totalMMR / divider);
};

const getRatingsHotsLogs = (leaderBoard) => {
  const ratings = new Map();

  for (let i = 0; i < leaderBoard.length; i++) {
    if (leaderBoard[i].GameMode === 'UnrankedDraft' || leaderBoard[i].GameMode === 'StormLeague') {
      if (leaderBoard[i].LeagueRank !== null) {
        ratings.set(leaderBoard[i].GameMode, leaderBoard[i].CurrentMMR);
      }
    }
  }

  if (ratings.size === 0) {
    for (let i = 0; i < leaderBoard.length; i++) {
      ratings.set(leaderBoard[i].GameMode, leaderBoard[i].CurrentMMR);
    }
  }

  return ratings;
};

const getRatingsHeroesProfile = (leaderBoard) => {
  const leaderboardModes = ['Quick Match', 'Unranked Draft', 'Storm League', 'Team League', 'Hero League'];
  const ratings = new Map();

  for (let gameMode of leaderboardModes) {
    const modeData = leaderBoard[gameMode];

    if (gameMode === 'Unranked Draft' || gameMode === 'Storm League') {
      if (modeData && modeData.mmr != null) {
        ratings.set(gameMode, modeData.mmr);
      }
    }
  }

  if (ratings.size === 0) {
    for (let gameMode of leaderboardModes) {
      const modeData = leaderBoard[gameMode];

      if (modeData && modeData.mmr) {
        ratings.set(gameMode, modeData.mmr);
      }
    }
  }

  return ratings;
};

module.exports = CheckBattleTag;
