const crypto = require('crypto');

const generateUniqueId = () => {
  return crypto.randomBytes(12).toString('hex');
};

module.exports = generateUniqueId;
