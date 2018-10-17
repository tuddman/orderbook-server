# orderbook-server

a cryptocurrency streaming trade data aggregator

## Usage

```bash

# if you're interested in a raw datafeed:

## In one terminal window:

yarn start

## then, in another terminal window:

npm i -g wscat
wscat -c ws://[IP]:[PORT]
< [{"price":0.03168,"pVol":72.06221059,"orderType":"ask"},{"price":0.03168286,"pVol":0.60809362,"orderType":"ask"},{"price":0.031685,"pVol":48.8573,"orderType":"ask"},{"price":0.03170455,"pVol":5.91445563,"orderType":"ask"},{"price":0.03170456,"pVol":12.63266407,"orderType":"ask"},{"price":0.03171807,"pVol":50,"orderType":"ask"},{"price":0.03171809,"pVol":7.19915,"orderType":"ask"},{"price":0.03171889,"pVol":11,"orderType":"ask"},{"price":0.03173069,"pVol":0.1,"orderType":"ask"},{"price":0.03173099,"pVol":0.1,"orderType":"ask"},{"price":0.03167939,"pVol":0.02540535,"orderType":"bid"},{"price":0.03167415,"pVol":0.26491615,"orderType":"bid"},{"price":0.03166778,"pVol":0.06507251,"orderType":"bid"},{"price":0.03166777,"pVol":0.05,"orderType":"bid"},{"price":0.03165644,"pVol":15.69666347,"orderType":"bid"},{"price":0.03165,"pVol":54.4020444,"orderType":"bid"},{"price":0.03164979,"pVol":5.92468687,"orderType":"bid"},{"price":0.03164817,"pVol":0.06146178,"orderType":"bid"},{"price":0.03161239,"pVol":2.68851769,"orderType":"bid"},{"price":0.03161224,"pVol":0.01621173,"orderType":"bid"}] 
```

Also pairs nicely with [this frontend](https://github.com/tuddman/orderbook)

## License

2018 (c) tuddman 

All Rights Reserved
