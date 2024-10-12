import { GameDataObject, GameMode, GameModeDataActive } from '../types';

export default class MMRCalculator {
  static defaultMMR = 3100;
  static gameModes = {
    'Storm League': {
      weight: 0.7,
      min_games: 150
    },
    'Unranked Draft': {
      weight: 0.3,
      min_games: 150
    },
    'Quick Match': {
      weight: 1,
      min_games: 150
    }
  };

  static calculateHeroesProfileAverageMMR(ratings: Map<GameMode, GameModeDataActive>): number {
    if (ratings.size === 0) return this.defaultMMR;

    /* eslint-disable  @typescript-eslint/no-non-null-assertion */
    if (ratings.has('Storm League') && ratings.get('Storm League')!.active) {
      return ratings.get('Storm League')!.mmr;
    }

    if (ratings.has('Unranked Draft') && ratings.get('Unranked Draft')!.active) {
      return ratings.get('Unranked Draft')!.mmr;
    }

    if (ratings.has('Quick Match') && ratings.get('Quick Match')!.active) {
      return ratings.get('Quick Match')!.mmr;
    }
    /* eslint-enable  @typescript-eslint/no-non-null-assertion */

    return this.defaultMMR;
  }

  static getRatingsHeroesProfile(data: GameDataObject): Map<GameMode, GameModeDataActive> {
    const modes: GameMode[] = ['Quick Match', 'Unranked Draft', 'Storm League'];
    const ratings = new Map<GameMode, GameModeDataActive>();
    
    for (const gameMode of modes) {
      const modeData: GameModeDataActive = Object.assign({}, data[gameMode], {
        active: false,
      });
    
      if (gameMode === 'Storm League' && modeData && modeData.games_played >= this.gameModes[gameMode].min_games) {
        modeData.active = true;
      } else if (gameMode === 'Unranked Draft' && modeData && modeData.games_played >= this.gameModes[gameMode].min_games) {
        modeData.active = true;
      } else if (gameMode === 'Quick Match' && modeData && modeData.games_played >= this.gameModes[gameMode].min_games) {
        modeData.active = true;
      }

      ratings.set(gameMode, modeData);
    }

    return ratings;
  }
}
