const CacheManager = require('../Classes/CacheManager')
const heroesloungeApi = require('heroeslounge-api')
const { Logger } = require('../util.js')

const path = require('path')

class MatchesTodayCache extends CacheManager {
  constructor () {
    const settings = {
      update: heroesloungeApi.getMatchesToday,
      isUpdating: {
        'eu': false,
        'na': false
      },
      updateResponse: {
        'eu': {},
        'na': {}
      }
    }

    super(settings)
  }

  cacheExpired (lastUpdated, expirationTime) {
    return super.cacheExpired(lastUpdated, expirationTime)
  }

  fetchCache (region, expirationTime) {
    const loc = path.join(__dirname, `../Data/Caches/MatchesToday${region}.json`)
    return this.readCacheFile(loc).then(async (cache) => {
      if (this.cacheExpired(cache.lastUpdatedAt, expirationTime)) {
        cache = await this.updateCache(region)
      }

      return cache
    })
  }

  readCacheFile (loc) {
    return super.readCacheFile(loc)
  }

  updateCache (region) {
    const timezone = region === 'eu' ? 'Europe/Berlin' : 'America/Los_Angeles'
    const loc = path.join(__dirname, `../Data/Caches/MatchesToday${region}.json`)

    if (this.isUpdating[region]) return this.updateResponse[region]
    this.isUpdating[region] = true

    let updatedCache = this.update(timezone).then((data) => {
      let newCache = {
        lastUpdatedAt: Date.now(),
        data: data
      }

      return newCache
    }).then(async (newCache) => {
      await this.writeCacheFile(loc, newCache).catch((error) => {
        throw error
      })

      Logger.info(`Updated ${region} cache`)
      this.isUpdating[region] = false
      return newCache
    })
    this.updateResponse[region] = updatedCache
    return updatedCache
  }

  writeCacheFile (loc, data) {
    return super.writeCacheFile(loc, data)
  }
}

module.exports = new MatchesTodayCache()
