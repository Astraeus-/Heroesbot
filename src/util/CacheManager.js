const heroesloungeApi = require('heroeslounge-api')
const Logger = require('./Logger.js')

const fs = require('fs').promises
const path = require('path')

class CacheManager {
  constructor () {
    this.caches = {
      'matchesToday': {
        isUpdating: false,
        loc: path.join(__dirname, '../Data/MatchesToday.json'),
        update: heroesloungeApi.getMatchesToday,
        updateResponse: {}
      },
      'teams': {
        isUpdating: false,
        loc: path.join(__dirname, '../Data/Teamdata.json'),
        update: heroesloungeApi.getTeams,
        updateResponse: {}
      }
    }
  }

  cacheExpired (lastUpdated, expirationTime) {
    return Date.now() - expirationTime > lastUpdated
  }

  fetchCache (type, expirationTime) {
    const cache = this.caches[type]

    return this.readCacheFile(cache.loc).then(async (cache) => {
      if (this.cacheExpired(cache.lastUpdatedAt, expirationTime)) {
        cache = await this.updateCache(type)
      }

      return cache
    })
  }

  readCacheFile (loc) {
    return fs.readFile(loc, { encoding: 'utf8' }).then((data) => {
      let parsedData
      try {
        parsedData = JSON.parse(data)
      } catch (error) {
        throw Error('Unable to parse JSON object')
      }
      return parsedData
    }).catch((error) => {
      throw error
    })
  }

  updateCache (type) {
    const cache = this.caches[type]

    if (cache.isUpdating) return cache.updateResponse
    cache.isUpdating = true

    let updatedCache = cache.update().then((data) => {
      let newCache = {
        lastUpdatedAt: Date.now(),
        data: data
      }

      return newCache
    }).then(async (newCache) => {
      await this.writeCacheFile(cache.loc, newCache).catch((error) => {
        throw error
      })

      Logger.info(`Updated ${type} cache`)
      cache.isUpdating = false
      return newCache
    })
    cache.updateResponse = updatedCache
    return updatedCache
  }

  writeCacheFile (loc, data) {
    let jsonData
    try {
      jsonData = JSON.stringify(data, null, 2)
    } catch (error) {
      throw Error('Unable to create JSON object')
    }

    return fs.writeFile(loc, jsonData).catch((error) => {
      throw error
    })
  }
}

module.exports = new CacheManager()
