/* eslint-env mocha */
import { expect } from 'chai';
import { Context, describe, it } from 'mocha';

import MMRCalculator from '../src/Classes/MMRCalculator';

describe('Heroes Profile MMR', function() {
  context('Storm League and Unranked draft have min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': MMRCalculator.gameModes['Quick Match'].min_games,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': MMRCalculator.gameModes['Unranked Draft'].min_games,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': MMRCalculator.gameModes['Storm League'].min_games,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(2572);
    });
  });

  context('Storm League and Quick Match have min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': MMRCalculator.gameModes['Quick Match'].min_games,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': MMRCalculator.gameModes['Unranked Draft'].min_games - 1,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': MMRCalculator.gameModes['Storm League'].min_games,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(2572);
    });
  });

  context('Unranked Draft and Quick Match have min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': MMRCalculator.gameModes['Quick Match'].min_games,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': MMRCalculator.gameModes['Unranked Draft'].min_games,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': MMRCalculator.gameModes['Storm League'].min_games - 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(2830);
    });
  });

  context('Storm League has min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': MMRCalculator.gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': MMRCalculator.gameModes['Unranked Draft'].min_games - 1,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': MMRCalculator.gameModes['Storm League'].min_games,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(2572);
    });
  });

  context('Unranked Draft has min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played':  MMRCalculator.gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': MMRCalculator.gameModes['Unranked Draft'].min_games,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': MMRCalculator.gameModes['Storm League'].min_games - 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(2830);
    });
  });

  context('Quick Match has min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': MMRCalculator.gameModes['Quick Match'].min_games,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': MMRCalculator.gameModes['Unranked Draft'].min_games - 1,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': MMRCalculator.gameModes['Storm League'].min_games - 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(2881);
    });
  });

  context('Storm League, Unranked draft and Quick Match no min games', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': MMRCalculator.gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': MMRCalculator.gameModes['Unranked Draft'].min_games - 1,
          'league_tier': 'diamond'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': MMRCalculator.gameModes['Storm League'].min_games - 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(MMRCalculator.defaultMMR);
    });
  });

  context('Storm League no min games, no Unranked Draft data', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': MMRCalculator.gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        },
        'Storm League': {
          'mmr': 2572,
          'games_played': MMRCalculator.gameModes['Storm League'].min_games - 1,
          'league_tier': 'platinum'
        }
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(MMRCalculator.defaultMMR);
    });
  });

  context('Unranked Draft no min games, no Storm League data', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': MMRCalculator.gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        },
        'Unranked Draft': {
          'mmr': 2830,
          'games_played': MMRCalculator.gameModes['Unranked Draft'].min_games - 1,
          'league_tier': 'diamond'
        }
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(MMRCalculator.defaultMMR);
    });
  });

  context('Quick Match no min games, no Storm League and Unranked Draft data', function() {
    it('Should equal', function() {
      const data = {
        'Quick Match': {
          'mmr': 2881,
          'games_played': MMRCalculator.gameModes['Quick Match'].min_games - 1,
          'league_tier': 'master'
        }
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(MMRCalculator.defaultMMR);
    });
  });

  context('No data at all', function() {
    it('Should equal', function() {
      const data = {
      };

      expect(MMRCalculator.calculateHeroesProfileAverageMMR(MMRCalculator.getRatingsHeroesProfile(data))).to.equal(MMRCalculator.defaultMMR);
    });
  });
});
