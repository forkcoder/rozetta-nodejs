require('dotenv').config();
const axios = require('axios');
const authUtils = require('./utils/auth-utils');
const { serverConfig, authConfig } = authUtils;

const translationData = {
  fieldId: '414',
  text: [
    'This is DOKODEMO Door bulletin board. You can post any discussion here such as promoting and announcing Events and Worlds, recruiting video editors, asking questions regarding functions, etc.'
  ],
  sourceLang: 'en',
  targetLang: 'zh-TW',
  contractId: authConfig.contractId,
};

const nonceGenerator = (() => {
  let lastTimestamp = 0;
  let counter = 0;
  return () => {
    const now = Date.now();
    if (now === lastTimestamp) {
      counter++;
    } else {
      counter = 0;
      lastTimestamp = now;
    }
    return `${now}${counter.toString().padStart(6, '0')}`;
  };
})();

const getTextResult = async (serverConfig, authConfig, translationData) => {
  const path = '/api/v1/translate';
  // We use UNIX time (in milliseconds) as nonce here.
  const nonce = nonceGenerator();
  const signature = authUtils.generateSignature(
    path,
    authConfig.secretKey,
    nonce
  );

  const url = `${serverConfig.protocol}//${serverConfig.hostname}:${serverConfig.port}${path}`;

  const headers = {
    accessKey: authConfig.accessKey,
    signature,
    nonce,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, translationData, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  try {
    const response = await getTextResult(
      serverConfig,
      authConfig,
      translationData
    );
    console.log('Server response:');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

main();
