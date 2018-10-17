// poloniex.js

const _ = require('lodash');
const R = require('ramda');

const {indexOf} = require('./util');

// poloniex ws msg format -> conformed format
const conformPoloniexOrder = rawOrder => {
  return {
    orderType: rawOrder.type,
    pVol: Number(rawOrder.amount),
    price: Number(rawOrder.rate),
  };
};

// returns updated book
const handlePoloniexMsg = (channelName, data, seq, book) => {
  if (channelName === 'BTC_ETH') {
    if (data[0].type === 'orderBookModify') {
      let idx = indexOf(book, data[0].data.type, data[0].data.rate);

      // found the order in book...
      if (idx !== -1) {
        let conformed = Object.assign(
          book.children[idx],
          conformPoloniexOrder(data[0].data),
        );
        R.update(idx, conformed, book);
      }

      // could not find the order in book...
      if (idx === -1) {
        let prices = book.children.map(x => x.price);

        if (
          Number(data[0].data.rate) >= _.min(prices) &&
          Number(data[0].data.rate) <= _.max(prices)
        ) {
          let conformed = conformPoloniexOrder(data[0].data);
          for (var i = 0, len = book.children.length; i < len; i++) {
            if (Number(data[0].data.rate) < book.children[i].price) {
              book.children.splice(i, 0, conformed);
              break;
            }
          }
        }
      }

      return book;
    }

    if (data[0].type === 'orderBookRemove') {

      let idx = indexOf(book, data[0].data.type, data[0].data.rate);

      if (idx !== -1) {
        if (book.children[idx].bVol !== undefined) {
          book.children[idx].pVol = undefined  
        } else {
          book.children.splice(idx, 1) 
          return book;
        }
      }

      return book;
    }
  }
};

module.exports = {
  handlePoloniexMsg,
};
