const permissions = require('./permissions.json');
const options = require('./options.json');
const BaseCommand = require('../../Classes/BaseCommand.js');
const { Logger } = require('../../util.js');

const heroesloungeApi = require('heroeslounge-api');
const regions = require('../../util.js').heroesloungeId;

class Playoffs extends BaseCommand {
  constructor (bot) {
    super(permissions, options);
    this.bot = bot;
  }

  exec (msg, args) {
    const specifiedRegion = args[0].toLowerCase();
    const regionSearch = regions.find(region => region.name === specifiedRegion);
    const region = regionSearch && regionSearch.heroesloungeId ? regionSearch.heroesloungeId : null;
    const guild = msg.channel.guild;
    const modRole = guild.roles.find((role) => {
      return role.name === 'Moderators';
    });

    const errorMessage = [];

    const manageChannelPermission = guild.members.get(this.bot.user.id).permission.has('manageChannels');

    if (manageChannelPermission) {
      heroesloungeApi.getSeasons().then((seasons) => {
        const seasonsArray = seasons;
        let playoffSeason;

        for (let i = seasonsArray.length - 1; i >= 0; i--) {
          if (seasonsArray[i].type === 1 && seasonsArray[i].region_id === region && seasonsArray[i].current_round === seasonsArray[i].round_length) {
            playoffSeason = seasonsArray[i];
            break;
          }
        }

        if (!playoffSeason) throw Error(`No playoff season for region: ${args[0]}`);
 
        return playoffSeason;
      }).then((playoffSeason) => {
        return heroesloungeApi.getSeasonPlayoffs(playoffSeason.id);
      }).then(async (seasonPlayoffs) => {
        const seasonTournaments = seasonPlayoffs;
        const tournaments = [];

        for (const tournament in seasonTournaments) {
          const tournamentDivisions = await heroesloungeApi.getPlayoffDivisions(seasonTournaments[tournament].id)
            .catch((error) => {
              Logger.error(`Unable to get playoff details for playoff with id: ${seasonTournaments[tournament].id}`, error);
            });

          tournaments.push(seasonTournaments[tournament]);
          tournaments[tournament]['divisions'] = tournamentDivisions;
        }
        
        return seasonTournaments;
      }).then(async (tournaments) => {
        const playoffCategory = await guild.createChannel(`Playoffs-${args[0].toUpperCase()}`, 4).catch((error) => {
          throw error;
        });

        /* Updates main category permissions */
        playoffCategory.editPermission(guild.id, 0, 1024, 'role').catch((error) => {
          const msg = 'Unable to update @everyone permissions';
          errorMessage.push(msg);
          Logger.warn(msg, error);
        });
        playoffCategory.editPermission(modRole.id, 1024, 0, 'role').catch((error) => {
          const msg = 'Unable to update @Moderators permissions';
          errorMessage.push(msg);
          Logger.warn(msg, error);
        });

        return { playoffCategory, tournaments };
      }).then(async (playoffs) => {
        const tournaments = playoffs.tournaments;
        const category = playoffs.playoffCategory;
        const captainPermissionUpdates = [];

        for (const tournament in tournaments) {
          for (const division of tournaments[tournament].divisions) {
            const divisionTeams = await heroesloungeApi.getDivisionTeams(division.id).catch((error) => {
              Logger.error(`Unable to get division teams for division with id: ${division.id}`, error);
            });

            const channel = await guild.createChannel(`${tournaments[tournament].title}-${division.slug}`, 0, '', category.id).catch((error) => {
              const msg = `Unable to create channel ${tournaments[tournament].title}-${division.slug}`;
              errorMessage.push(msg);
              Logger.warn(msg, error);
            });

            /* Grants access to the playoff channel to the team's captain */
            for (const team of divisionTeams) {
              const divisionTeamSloths = team.sloths;

              for (const sloth of divisionTeamSloths) {
                if (sloth.pivot.is_captain === 1) {
                  if (!sloth.discord_id) {
                    const msg = `Unable to add ${sloth.title} of ${team.title} to ${channel.name}`;
                    errorMessage.push(msg);
                  } else {
                    captainPermissionUpdates.push(
                      channel.editPermission(sloth.discord_id, 1024, 0, 'member').catch((error) => {
                        const msg = `Error adding ${sloth.title} of ${team.title} to ${channel.name}`;
                        errorMessage.push(msg);
                        Logger.warn(msg, error);
                      })
                    );
                  }
                  break;
                }
              }
            }
          }
        }

        return captainPermissionUpdates;
      }).then((captainPermissionUpdates) => {
        return Promise.all(captainPermissionUpdates);
      }).then(() => {
        return msg.author.getDMChannel().then((channel) => {
          return sendErrorResponse(channel, errorMessage);
        }).catch((error) => {
          Logger.warn('Unable to inform user about Playoff creations', error);
          Logger.warn(`Errors: ${errorMessage}`);
        });
      }).catch((error) => {
        Logger.error('Unable to create playoffs channels', error);
      });
    } else {
      return msg.author.getDMChannel().then((channel) => {
        return channel.createMessage('Unable to create playoff channels.\nMissing permission: manageChannels');
      });
    }
  }
}

const sendErrorResponse = (channel, errorMessage) => {
  let errorResponse = 'Finished Playoffs creations with errors:\n';
  for (const error of errorMessage) {
    errorResponse += `${error}\n`;

    if (errorResponse.length >= 1750) {
      channel.createMessage(errorResponse).catch((error) => {
        Logger.warn('Unable to send playoff error message', error);
      });
      errorResponse = '';
    }
  }

  return channel.createMessage(errorResponse).catch((error) => {
    Logger.warn('Unable to send playoff error message', error);
  });
};

module.exports = Playoffs;

