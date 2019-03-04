const heroesloungeApi = require('heroeslounge-api')
const Logger = require('./Logger.js')

const fs = require('fs').promises
const path = require('path')

class CacheManager {
  cacheExpired (lastUpdated, expirationTime) {
    return Date.now() - expirationTime > lastUpdated
  }

  fetchCache (type, expirationTime) {
    const cacheDetails = this.resolveCacheDetails(type)

    return this.readCacheFile(cacheDetails.loc).then(async (cache) => {
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
      Logger.error(`Could not read file ${loc}`, error)
    })
  }

  resolveCacheDetails (type) {
    let cacheDetails = {}

    switch (type) {
      case 'matchesToday':
        cacheDetails.loc = path.join(__dirname, '../Data/MatchesToday.json')
        cacheDetails.update = heroesloungeApi.getMatchesToday
        break
      case 'teams':
        cacheDetails.loc = path.join(__dirname, '../Data/Teamdata.json')
        cacheDetails.update = heroesloungeApi.getTeams
        break
      default:
        break
    }
    return cacheDetails
  }

  updateCache (type) {
    const cacheDetails = this.resolveCacheDetails(type)

    return cacheDetails.update().then((data) => {
      let cache = {
        lastUpdatedAt: Date.now(),
        data: data
      }

      return cache
    }).then(async (cache) => {
      await this.writeCacheFile(cacheDetails.loc, cache).catch((error) => {
        throw error
      })

      Logger.info(`Updated ${type} cache`)
      return cache
    })
  }

  writeCacheFile (loc, data) {
    let jsonData
    try {
      jsonData = JSON.stringify(data, null, 2)
    } catch (error) {
      throw Error('Unable to create JSON object')
    }

    return fs.writeFile(loc, jsonData).catch((error) => {
      Logger.error(`Could not write file ${loc}`, error)
    })
  }
}

module.exports = new CacheManager()
