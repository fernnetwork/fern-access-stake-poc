# fern-access-stake-poc

## Setup
- Install Node.js
- Install dependencies `npm i`

## Run Demo
1. Deploy contracts to local development network
```
$ npm run migrate --network development
```
2. Start Oracle service
```
$ cd app/access-stakle-oracle-poc
$ npm i && npm start
```
3. In a separate terminal, start the demo program that creates updates
```
$ cd app/access-stakle-oracle-demo
$ npm i && npm start
```