// poloniex.js

const _ = require('lodash');
const R = require('ramda');

const setHighestBid = book => {
  let firstBid = book.children.find(e => {
    return e.orderType === 'bid';
  });

  return firstBid ? firstBid.price : 0;
};

// poloniex ws msg format -> conformed format
const conformPoloniexOrder = rawOrder => {
  return {
    pVol: Number(rawOrder.amount),
    orderType: rawOrder.type,
    price: Number(rawOrder.rate),
  };
};

// returns updated book
const handleMsg = (channelName, data, seq, book) => {
  if (channelName === 'BTC_ETH') {
    if (data[0].type === 'orderBookModify') {

      let idx = _.findIndex(book.children, e => {
        let oType = e.orderType;
        let bType = data[0].data.type;
        let oPrice = Number(e.price).toFixed(8);
        let bPrice = Number(data[0].data.rate).toFixed(8);

        return oType === bType && oPrice === bPrice;
      });

      if (idx !== -1) {
        let conformed = conformPoloniexOrder(book.children[idx]);

        R.update(idx, conformed, book);
      }

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
      // console.log('book removed:\n ', data[0]);

      _.remove(book.children, e => {
        let oType = e.orderType;
        let bType = data[0].data.type;
        let oPrice = Number(e.price).toFixed(8);
        let bPrice = Number(data[0].data.rate).toFixed(8);

        // console.log('COMPARING : ', oType, bType, oPrice, bPrice);
        return oType === bType && oPrice === bPrice;

      })

      return book;
    }
  }
};

module.exports = {
  handleMsg,
  setHighestBid,
};
