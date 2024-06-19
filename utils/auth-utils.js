/**
 * Authentication utilities module.
 */
const crypto = require('crypto');

const signatureHMACAlgo = 'sha256';
const signatureHMACEncoding = 'hex';

const serverConfig = {
  protocol: 'https:',
  hostname: 'translate.rozetta-api.io',
  port: 443
};
const authConfig = {
  accessKey: process.env.ACCESS_KEY ,
  secretKey: process.env.SECRET_KEY,
  contractId: process.env.CONTRACT_ID,
};

const generateSignature = (path, secretKey, nonce) => {
  const hmac = crypto.createHmac(signatureHMACAlgo, secretKey);
  hmac.update(nonce);
  hmac.update(path);
  return hmac.digest(signatureHMACEncoding);
};

module.exports = {
  serverConfig,
  authConfig,
  generateSignature,
};
