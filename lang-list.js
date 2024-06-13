const https = require('https');

const authUtils = require('./utils/auth-utils');

const serverConfig = {
 protocol: 'https:',
 hostname: 'translate.rozetta-api.io',
 port: 443
};
const authConfig = {
 accessKey: '',
 secretKey: '',
 nonce: new Date().getTime().toString()
};

const getLanguagesList = (serverConfig, authConfig) => {
 const path = '/api/v1/languages/engine/t4oo';
 const signature = authUtils.generateSignature(
   path,
   authConfig.secretKey,
   authConfig.nonce
 );
 const requestOptions = {
   protocol: serverConfig.protocol,
   host: serverConfig.hostname,
   port: serverConfig.port,
   method: 'GET',
   path,
   headers: {
     accessKey: authConfig.accessKey,
     signature,
     nonce: authConfig.nonce
   }
 };

 return new Promise((resolve, reject) => {
   const request = https.request(requestOptions, (response) => {
     response.setEncoding('utf8');
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
   request.end();
 });
};

const main = async () => {
 try {
   const response = await getLanguagesList(
     serverConfig,
     authConfig,
   );
   console.log('Server response:');
   console.log(response);
 } catch (error) {
   console.error(error);
 }
};

main();