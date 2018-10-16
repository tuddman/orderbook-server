// bittrex.js

const jsonic = require('jsonic');
const zlib = require('zlib');

let data, b64, raw, json;

const unpackData = (payload, cb) => {
  raw = new Buffer.from(payload, 'base64');
  zlib.inflateRaw(raw, function(err, inflated) {
    if (!err) {
      json = JSON.parse(inflated.toString('utf8'));
      // console.log('json: ', json);
      return cb(null, json);
    } else {
      cb(err, null);
    }
  });
};

// bittrex ws msg format -> conformed format
const conformBittrexOrder = (rawOrder, orderType) => {
  return {
    orderType,
    bVol: Number(rawOrder.Q),
    price: Number(rawOrder.R),
  };
};


handleBittrexMsg = (data, book) => {
  
}

module.exports = {
  conformBittrexOrder,
  handleBittrexMsg,
  unpackData,
};
