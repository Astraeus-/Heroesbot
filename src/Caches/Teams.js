const CacheManager = require('../Classes/CacheManager');
const heroesloungeApi = require('heroeslounge-api');

const path = require('path');

class TeamsCache extends CacheManager {
  constructor () {
    const settings = {
      type: 'Teams',
      loc: path.join(__dirname, '../Data/Caches/Teamdata.json'),
      update: heroesloungeApi.getTeams
    };

    super(settings);
  }

  cacheExpired (lastUpdated, expirationTime) {
    return super.cacheExpired(lastUpdated, expirationTime);
  }

  fetchCache (expirationTime) {
    return super.fetchCache(this.loc, expirationTime);
  }

  readCacheFile (loc = this.loc) {
    return super.readCacheFile(loc);
  }

  updateCache (loc = this.loc) {
    return super.updateCache(loc);
  }

  writeCacheFile (loc = this.loc, data) {
    return super.writeCacheFile(loc, data);
  }
}

module.exports = new TeamsCache();
