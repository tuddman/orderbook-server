// orderbook-server
// index.js

const signalR = require('signalr-client');
const jsonic = require('jsonic');
const zlib = require('zlib');
const Poloniex = require('poloniex-api-node');
const {handlePoloniexMsg} = require('./poloniex');
const {handleBittrexMsg, unpackData} = require('./bittrex');
const {convertToArray, setHighestBid, takeTopN} = require('./util');
const R = require('ramda');
const WebSocket = require('faye-websocket');
const http = require('http');
const port = 8000;

const server = http.createServer();

let book = {children: [], highestBid: 0};

// add more PAIRs here to stream different pairs.
// TODO: parameterize this so diff pair(s) are requested with ws.onMessage()
let markets = {
  BTCETH: {
    bittrex: 'BTC-ETH',
    poloniex: 'BTC_ETH',
  },
};

// --------------------- Bittrex
//
let raw, b64, json;

const hydrateOrderbookWithBittrex = data => {
  let asks = R.take(10, data.Z).map(a => {
    book.children.push({price: a.R, bVol: a.Q, orderType: 'ask'});
  });
  let bids = R.take(10, data.S).map(a => {
    book.children.push({price: a.R, bVol: a.Q, orderType: 'bid'});
  });
  let highBid = setHighestBid(book);
  console.log('highBid ', highBid);

  if (highBid > 0) book.highestBid = highBid;
};

const bittrex = new signalR.client('wss://socket.bittrex.com/signalr', ['c2']);

bittrex.serviceHandlers.connected = function(connection) {
  console.log('connected');

  bittrex
    .call('c2', 'QueryExchangeState', markets.BTCETH.bittrex)
    .done(function(err, result) {
      if (err) {
        return console.error(err);
      }

      let unpacked = unpackData(result, (err, data) => {
        if (!err) {
          hydrateOrderbookWithBittrex(data);
          return data;
        }
      });
    });

  bittrex
    .call('c2', 'SubscribeToExchangeDeltas', markets.BTCETH.bittrex)
    .done(function(err, result) {
      if (err) {
        return console.error(err);
      }
      if (result === true) {
        console.log(
          'Subscribed to ' + markets.BTCETH.bittrex + ' Exchange Deltas',
        );
      }
    });
};

bittrex.serviceHandlers.messageReceived = function(message) {
  data = jsonic(message.utf8Data);
  if (data.hasOwnProperty('M')) {
    if (data.M[0]) {
      if (data.M[0].hasOwnProperty('A')) {
        if (data.M[0].A[0]) {
          b64 = data.M[0].A[0];
          raw = new Buffer.from(b64, 'base64');

          zlib.inflateRaw(raw, function(err, inflated) {
            if (!err) {
              json = JSON.parse(inflated.toString('utf8'));
              // console.log('msg:json : ', json);
              handleBittrexMsg(json, book);
            }
          });
        }
      }
    }
  }
};

// --------------------- Poloniex
//

const hydrateOrderbookWithPoloniex = data => {
  let asks = convertToArray(data[0].data.asks);
  let bids = convertToArray(data[0].data.bids);
  let tenAsks = takeTopN(asks, 10);
  let tenBids = takeTopN(bids, 10);
  tenAsks.map(a => {
    book.children.push({price: a[0], pVol: a[1], orderType: 'ask'});
  });
  tenBids.map(b => {
    book.children.push({price: b[0], pVol: b[1], orderType: 'bid'});
  });
  let highBid = setHighestBid(book);
  console.log('highBid ', highBid);

  if (highBid > 0) book.highestBid = highBid;
};

let poloniex = new Poloniex();
poloniex.subscribe(markets.BTCETH.poloniex);

poloniex.on('open', () => {
  console.log(`Poloniex WebSocket connection open`);
});

poloniex.on('message', (channelName, data, seq) => {
  if (channelName === 'BTC_ETH') {
    if (data[0].type === 'orderBook') {
      hydrateOrderbookWithPoloniex(data);
    }
  }
});

poloniex.on('close', (reason, details) => {
  console.log(`Poloniex WebSocket connection disconnected`);
});

poloniex.on('error', error => {
  console.log(`An error has occured: `, error);
});

poloniex.openWebSocket({version: 2});

// --------------------- Websocket Server
//

server.on('upgrade', function(request, socket, body) {
  if (WebSocket.isWebSocket(request)) {
    let ws = new WebSocket(request, socket, body);
    ws.on('open', function(event) {
      console.log('opening websocket connection');
      console.log('sending initial book');
      ws.send(JSON.stringify(book));
    });

    poloniex.on('message', (channelName, data, seq) => {
      let msg = handlePoloniexMsg(channelName, data, seq, book);
      if (ws && msg) {
        ws.send(JSON.stringify(msg));
      }
    });

    ws.on('close', function(event) {
      console.log('close', event.code, event.reason);
      ws = null;
    });
  }
});

server.listen(port);
