require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const signatureHMACAlgo = 'sha256';
const signatureHMACEncoding = 'hex';

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

const generateSignature = async (nonce) => {
  const hmac = crypto.createHmac(signatureHMACAlgo, process.env.SECRET_KEY);
  hmac.update(nonce);
  hmac.update(process.env.TRANSLATE_PATH);
  return hmac.digest(signatureHMACEncoding);
};

const getTranslateTexts = async function (sourceLang, targetLang, texts) {
  const nonce =  nonceGenerator();
  const signature = await generateSignature(nonce);
  const bodyData = {
    fieldId: '414',
    text: texts,
    sourceLang: sourceLang,
    targetLang: targetLang,
    contractId: process.env.CONTRACT_ID,
    autoSplit: true
  }
  try{
    const response = await axios.post(process.env.TRANSLATE_URL, bodyData,  {
      headers: {
        'Content-Type': 'application/json',
        accessKey: process.env.ACCESS_KEY,
        signature,
        nonce
      }
    });
    const data = response.data;
    if (data.status !== 'success') {
      console.log('Translation failed with response:', response);
      return null;
    }
    if (response.status === 200 && data) {
      return data.data.translationResult.map(t => t.translatedText);
    }
    return null;
  } catch (err) {
    console.log('Error when fetching translate API:', err);
    return null;
  }
}

const main = async () => {
  try {
    const response = await getTranslateTexts(
      'en','ja',['Hello World!!']
    );
    console.log('Server response:');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

main();
