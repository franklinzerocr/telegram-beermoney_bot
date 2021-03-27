const db = require('./app/DB/db');
const configFile = require('config');
const token = require('./app/telegram/token');
const Binance = require('node-binance-api');
const bot = require('./app/telegram/bot');

let DBbeermoney, DBsystem, binanceAPI;

const main = async () => {
  //init connection to db

  DBbeermoney = await db.connection(configFile.get('DB'));
  DBsystem = await db.connection(configFile.get('DB2'));
  binanceAPI = new Binance().options({
    APIKEY: configFile.binance.public,
    APISECRET: configFile.binance.secret,
    useServerTime: true,
    reconnect: true,
    // verbose: true,
    recvWindow: 10000, // Set a higher recvWindow to increase response timeout
  });

  // let telegramToken = await token.generateTelegramLinkWithToken(DBsystem); // should pass a user?

  await bot.go(DBsystem, binanceAPI);
};

main();
