/* eslint-env mocha */
const MMRCalc = require('../src/Classes/MMRCalculator.js');
const expect = require('chai').expect;

const {defaultMMR, gameModes} = MMRCalc;

describe('Heroes Profile MMR', function() {
  context('Storm League and Unranked draft have min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': gameModes['Quick Match'].min_games,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': gameModes['Unranked Draft'].min_games,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': gameModes['Storm League'].min_games,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2649);
    });
  });

  context('Storm League has min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': gameModes['Unranked Draft'].min_games - 1,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': gameModes['Storm League'].min_games,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2572);
    });
  });

  context('Unranked Draft has min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played':  gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': gameModes['Unranked Draft'].min_games,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': gameModes['Storm League'].min_games - 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2830);
    });
  });

  context('Quick Match has min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': gameModes['Quick Match'].min_games,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': gameModes['Unranked Draft'].min_games - 1,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': gameModes['Storm League'].min_games - 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2881);
    });
  });

  context('Storm League and Unranked draft no min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': gameModes['Unranked Draft'].min_games - 1,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': gameModes['Storm League'].min_games - 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2649);
    });
  });

  context('Storm League no min games, no Unranked Draft data', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': gameModes['Storm League'].min_games - 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2572);
    });
  });

  context('Unranked Draft no min games, no Storm League data', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': gameModes['Unranked Draft'].min_games - 1,
          'league_tier': 'diamond'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2830);
    });
  });

  context('Quick Match no min games, no Storm League and Unranked Draft data', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2881);
    });
  });

  context('No data at all', function() {
    it('Should equal', function() {
      const data = {
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(defaultMMR);
    });
  });
});
