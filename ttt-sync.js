require('dotenv').config();
const https = require('https');

const authUtils = require('./utils/auth-utils');
const { serverConfig, authConfig } = authUtils;
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

const translationData = {
  fieldId: '414',
  text: [
    'This is DOKODEMO Door bulletin board. You can post any discussion here such as promoting and announcing Events and Worlds, recruiting video editors, asking questions regarding functions, etc.'
  ],
  sourceLang: 'en',
  targetLang: 'zh-TW',
  contractId: authConfig.contractId,
};
const getTextResult = (serverConfig, authConfig, translationData) => {
  const path = '/api/v1/translate';
  // We use UNIX time (in milliseconds) as nonce here.
  const nonce = nonceGenerator();
  const signature = authUtils.generateSignature(
    path,
    authConfig.secretKey,
    nonce
  );
  const requestOptions = {
    protocol: serverConfig.protocol,
    host: serverConfig.hostname,
    port: serverConfig.port,
    method: 'POST',
    path,
    headers: {
      accessKey: authConfig.accessKey,
      signature,
      nonce,
      'Content-Type': 'application/json'
    }
  };
  return new Promise((resolve, reject) => {
    // You can also use 3rd party modules, such as superagent, to send the
    // request. Here we use the Node.js built-in https module.
    const request = https.request(requestOptions, (response) => {
      response.setEncoding('utf8');
      console.log(`Status code: ${response.statusCode}`);
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(data);
      });
    });
    request.on('error', (error) => {
      reject(error);
    });
    request.write(JSON.stringify(translationData));
    request.end();
  });
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
