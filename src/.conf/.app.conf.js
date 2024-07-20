const crypto = require('crypto');

const ENCRYPTION_KEY = crypto.randomBytes(32);
console.log(ENCRYPTION_KEY)

module.exports= ENCRYPTION_KEY