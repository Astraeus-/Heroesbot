
class MMRCalculator {

  static calculateHeroesProfileAverageMMR(ratings) {
    if (ratings.size === 0) return 2800;

    let totalMMR = 0;
    let divider = 0;

    const weightsMMR = {
      'Storm League': {
        weight: 0.7,
        min_games: 10
      },
      'Unranked Draft': {
        weight: 0.3,
        min_games: 20
      },
      'Quick Match': {
        weight: 1,
        min_games: 25
      }
    };

    const weights = Object.keys(weightsMMR);

    for (let weight of weights) {
      if ((ratings.size === 2 && ratings.has('Quick Match') && divider > 0) || divider === 1) break;

      const modeRating = ratings.get(weight);
      const weightData = weightsMMR[weight];

      if (modeRating && modeRating.games_played > weightData.min_games) {
        totalMMR += modeRating.mmr * weightData.weight;
        divider += weightData.weight;
      }
    }

    if (totalMMR === 0 && divider === 0) {
      for (let weight of weights) {
        if ((ratings.size === 2 && ratings.has('Quick Match') && divider > 0) || divider === 1) break;
        
        const modeRating = ratings.get(weight);
        const weightData = weightsMMR[weight];
        
        if (modeRating) {
          totalMMR += modeRating.mmr * weightData.weight;
          divider += weightData.weight;
        }
      }
    }
    
    return Math.floor(totalMMR / divider);
  }

  static getRatingsHeroesProfile(data) {
    const gameModes = ['Quick Match', 'Unranked Draft', 'Storm League'];
    const ratings = new Map();
    
    for (let gameMode of gameModes) {
      const modeData = data[gameMode];
    
      if (gameMode === 'Storm League' && modeData && modeData.games_played >= 10) {
        modeData.active = true;
        ratings.set(gameMode, modeData);
      } else if (gameMode === 'Unranked Draft' && modeData && modeData.games_played >= 20) {
        modeData.active = true;
        ratings.set(gameMode, modeData);
      } else if (gameMode === 'Quick Match' && modeData && modeData.games_played >= 25) {
        modeData.active = true;
        ratings.set(gameMode, modeData);
      }
    }
    
    // None of the game modes met the minimum games played requirement.
    if (ratings.size === 0) {
      for (let gameMode of gameModes) {
        const modeData = data[gameMode];
        if (modeData) {
          ratings.set(gameMode, modeData);
        }
      }
    }
    
    return ratings;
  }
}

module.exports = MMRCalculator;
