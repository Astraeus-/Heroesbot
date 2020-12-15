
class MMRCalculator {
  static calculateHeroesProfileAverageMMR(ratings) {
    if (ratings.size === 0) return this.defaultMMR;

    if (ratings.has('Storm League') && ratings.get('Storm League').active) {
      return ratings.get('Storm League').mmr;
    }

    if (ratings.has('Unranked Draft') && ratings.get('Unranked Draft').active) {
      return ratings.get('Unranked Draft').mmr;
    }

    if (ratings.has('Quick Match') && ratings.get('Quick Match').active) {
      return ratings.get('Quick Match').mmr;
    }

    return this.defaultMMR;
  }

  static getRatingsHeroesProfile(data) {
    const modes = ['Quick Match', 'Unranked Draft', 'Storm League'];
    const ratings = new Map();
    
    for (let gameMode of modes) {
      const modeData = data[gameMode];
    
      if (gameMode === 'Storm League' && modeData && modeData.games_played >= this.gameModes[gameMode].min_games) {
        modeData.active = true;
        ratings.set(gameMode, modeData);
      } else if (gameMode === 'Unranked Draft' && modeData && modeData.games_played >= this.gameModes[gameMode].min_games) {
        modeData.active = true;
        ratings.set(gameMode, modeData);
      } else if (gameMode === 'Quick Match' && modeData && modeData.games_played >= this.gameModes[gameMode].min_games) {
        modeData.active = true;
        ratings.set(gameMode, modeData);
      }
    }
    
    // None of the game modes met the minimum games played requirement.
    if (ratings.size === 0) {
      for (let gameMode of modes) {
        const modeData = data[gameMode];
        if (modeData) {
          ratings.set(gameMode, modeData);
        }
      }
    }
    
    return ratings;
  }
}

MMRCalculator.defaultMMR = 3000;

MMRCalculator.gameModes = {
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

module.exports = MMRCalculator;
