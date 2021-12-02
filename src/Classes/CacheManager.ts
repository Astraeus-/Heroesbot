import fs from 'fs/promises';
import { Logger } from '../util';

export default class CacheManager {
  private type;
  private loc;
  private update;
  private isUpdating;
  private updateResponse;

  constructor (settings) {
    /* eslint-disable */
    this.type           = typeof settings.type            != 'undefined' ? settings.type            : null
    this.loc            = typeof settings.loc             != 'undefined' ? settings.loc             : null
    this.update         = typeof settings.update          != 'undefined' ? settings.update          : null
    this.isUpdating     = typeof settings.isUpdating      != 'undefined' ? settings.isUpdating      : false
    this.updateResponse = typeof settings.updateResponse  != 'undefined' ? settings.updateResponse  : {}
    /* eslint-enable */
  }

  cacheExpired (lastUpdated, expirationTime) {
    return Date.now() - expirationTime > lastUpdated;
  }

  fetchCache (loc, expirationTime) {
    return this.readCacheFile(loc).then(async (cache) => {
      if (this.cacheExpired(cache.lastUpdatedAt, expirationTime)) {
        cache = await this.updateCache(loc);
      }

      return cache;
    });
  }

  readCacheFile (loc) {
    return fs.readFile(loc, { encoding: 'utf8' }).then((data) => {
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        throw Error('Unable to parse JSON object');
      }

      return parsedData;
    }).catch((error) => {
      throw error;
    });
  }

  updateCache (loc) {
    if (this.isUpdating) return this.updateResponse;
    this.isUpdating = true;

    const updatedCache = this.update().then((data) => {
      const newCache = {
        lastUpdatedAt: Date.now(),
        data: data
      };

      return newCache;
    }).then(async (newCache) => {
      await this.writeCacheFile(loc, newCache).catch((error) => {
        throw error;
      });

      Logger.info(`Updated ${this.type} cache`);
      this.isUpdating = false;
      return newCache;
    });
    this.updateResponse = updatedCache;
    return updatedCache;
  }

  writeCacheFile (loc, data) {
    let jsonData;
    try {
      jsonData = JSON.stringify(data, null, 2);
    } catch (error) {
      throw Error('Unable to create JSON object');
    }

    return fs.writeFile(loc, jsonData).catch((error) => {
      throw error;
    });
  }
}
