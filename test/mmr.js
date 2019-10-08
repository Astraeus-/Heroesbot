/* eslint-env mocha */
const MMRCalc = require('../src/Classes/MMRCalculator.js');
const expect = require('chai').expect;

describe('Heroes Profile MMR', () => {
  context('Storm League and Unranked draft have min games', () => {
    it('Should equal', () => {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': 2787,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': 151,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': 51,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2649);
    });
  });

  context('Storm League has min games', () => {
    it('Should equal', () => {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': 1,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': 51,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2572);
    });
  });

  context('Unranked Draft has min games', () => {
    it('Should equal', () => {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': 151,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2830);
    });
  });

  context('Quick Match has min games', () => {
    it('Should equal', () => {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': 2787,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': 1,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2881);
    });
  });

  context('Storm League and Unranked draft no min games', () => {
    it('Should equal', () => {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': 1,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2649);
    });
  });

  context('Storm League no min games, no Unranked Draft data', () => {
    it('Should equal', () => {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': 1,
          'league_tier': 'master'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2572);
    });
  });

  context('Unranked Draft no min games, no Storm League data', () => {
    it('Should equal', () => {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': 1,
          'league_tier': 'diamond'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2830);
    });
  });

  context('Quick Match no min games, no Storm League and Unranked Draft data', () => {
    it('Should equal', () => {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': 2787,
          'league_tier': 'master'
        }
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2881);
    });
  });

  context('No data at all', () => {
    it('Should equal', () => {
      const data = {
      };

      expect(MMRCalc.calculateHeroesProfileAverageMMR(MMRCalc.getRatingsHeroesProfile(data))).to.equal(2800);
    });
  });
});
