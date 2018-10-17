// util.js
// utility functions used application-wide

const _ = require('lodash');
const R = require('ramda');

const convertToArray = coll => {
  return Object.keys(coll).map(k => {
    return [Number(k), Number(coll[k])];
  });
};

const takeTopN = (arr, n) => {
  return R.take(n, arr);
};

const setHighestBid = book => {
  let firstBid = book.children.find(e => {
    return e.orderType === 'bid';
  });

  return firstBid ? firstBid.price : 0;
};

const indexOf = (book, orderType, price) => {
  return _.findIndex(book.children, e => {
    let oType = e.orderType;
    let oPrice = Number(e.price).toFixed(8);
    let bPrice = Number(price).toFixed(8);
    return oType === orderType && oPrice === bPrice;
  });
};

module.exports = {
  convertToArray,
  setHighestBid,
  takeTopN,
  indexOf,
};
