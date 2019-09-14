const permissions = require('./permissions.json');
const options = require('./options.json');

const { memeCooldown } = require('../../config.js');

if (!options.cooldown) {
  options.cooldown = memeCooldown;
}

module.exports = {
  options: options,
  permissions: permissions
};
