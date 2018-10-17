// bittrex.js

const _ = require('lodash');
const jsonic = require('jsonic');
const zlib = require('zlib');

const {indexOf} = require('./util');

const unpackData = (payload, cb) => {
  raw = new Buffer.from(payload, 'base64');
  zlib.inflateRaw(raw, function(err, inflated) {
    if (!err) {
      json = JSON.parse(inflated.toString('utf8'));
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

let data, b64, raw, json;

// returns updated book
handleBittrexMsg = (data, book) => {
  if (data.Z || data.S) {
    // process BUY orders
    if (data.Z) {
      data.Z.forEach(order => {
        switch (order.TY) {
          // add
          case 0:
            console.log('adding buy order : ', order);
            for (var i = 0, len = book.children.length; i < len; i++) {
              if (Number(order.R) < book.children[i].price) {
                let conformed = Object.assign(
                  book.children[i],
                  conformBittrexOrder(order, 'bid'),
                );
                console.log('inserting btx : ', conformed);
                book.children.splice(i, 0, conformed);
                break;
              }
            }
            break;

          case 1:
            let idx = indexOf(book, 'bid', order.R);

            console.log('removing buy order : ', order);
            if (idx !== -1) {
              if (book.children[idx].pVol !== undefined) {
                book.children[idx].bVol = undefined;
                return book;
              } else {
                book.children.splice(idx, 1);
                return book;
              }
            }

            break;
          // update
          case 2:
            break;
          default:
            return book;
        }
      });
    }

    //process SELL orders
    if (data.S) {
      data.S.forEach(order => {
        switch (order.TY) {
          // add
          case 0:
            console.log('adding sell order : ', order);

            for (var i = 0, len = book.children.length; i < len; i++) {
              if (Number(order.R) < book.children[i].price) {
                let conformed = Object.assign(
                  book.children[i],
                  conformBittrexOrder(order, 'ask'),
                );
                book.children.splice(i, 0, conformed);
                break;
              }
            }
            break;
          case 1:
            let idx = indexOf(book, 'ask', order.R);

            console.log('removing sell order : ', order);
            if (idx !== -1) {
              if (book.children[idx].pVol !== undefined) {
                book.children[idx].bVol = undefined;
                return book;
              } else {
                book.children.splice(idx, 1);
                return book;
              }
            }

            break;
          // update
          case 2:
            break;
          default:
            return book;
        }
      });
    }
  } else {
    return book;
  }
};

module.exports = {
  conformBittrexOrder,
  handleBittrexMsg,
  unpackData,
};
