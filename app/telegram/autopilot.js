const db = require('../DB/db');
const schedule = require('node-schedule');
const binance = require('../binance/api');
const util = require('../util');
const { dailyReportMessage, mainMenuMessage, rebootInitialMessage } = require('./messages');
const config = require('config');
const { getNewlyCreatedFloors, updateTelegramFloor, getInitialFloor, getAlertOfFloor } = require('../DB/floors');
const { getAllUsers } = require('../DB/users');

async function waitForBeermoneyBot(dbConnection) {
  while ((await db.trading_pool.checkDiffTradingPool(dbConnection)).length == 0) {
    console.log('- Wait 1min for Beermoney System Update');
    await util.sleep(60000);
  }
}

async function dailyReport(bot, dbConnection, binanceAPI) {
  schedule.scheduleJob({ hour: 00, minute: 00, second: 1 }, async function () {
    await waitForBeermoneyBot(dbConnection);
    let users = await db.users.getAllUsers(dbConnection);
    for (let user of users) {
      if (user.T_userid) {
        let funds = await db.funds.getPreviousTwoFundsFromUser(dbConnection, user);
        let fundsDisplay = [],
          fundsDisplay2 = [];
        fundsFIAT = [];
        let BTCUSDT = (await binance.getTicker(binanceAPI)).BTCUSDT;
        for (let fund of funds) {
          let fundsBtc = util.satoshiToBTC(fund.Amount);
          fundsFIAT.push((BTCUSDT * fundsBtc).toFixed(2));
          let fundsSatoshis = fund.Amount;
          fundsDisplay2.push(user.Display == 'BTC' ? fundsBtc : fundsSatoshis);
          fundsDisplay.push(user.Display == 'BTC' ? fundsBtc + ' BTC' : util.numberWithCommas(fundsSatoshis) + ' sats');
        }
        let ROI = ((fundsDisplay2[0] * 100) / fundsDisplay2[1] - 100).toFixed(2);
        BTCUSDT = util.numberWithCommas(Math.floor(BTCUSDT));
        dailyReportMessage(bot, user, fundsDisplay, fundsFIAT, ROI, BTCUSDT);
      }
    }
  });
}

async function alertReport(bot, dbConnection) {
  console.log('Start Telegram Channel BOT!');
  let timerId = setTimeout(async function tick() {
    let floor = [];
    let message = '';
    let status = {};

    floor = await getNewlyCreatedFloors(dbConnection);
    if (floor.length) {
      floor = floor[0];

      message = '';
      status = {};

      let alert = await getAlertOfFloor(dbConnection, floor);

      // ENTRY
      if (floor.Level == 0) {
        message += '#TradingPlan' + floor.FK_Trading_Plan + ' START 🔥\n\n';
        message += floor.Asset + ' / #BTC\n';
        message += 'Entry Buy Price: ' + floor.Price + ' sats \n';
        message += 'Channel: ' + alert.Channel;
        status = await bot.telegram.sendMessage(config.channel, message);
        //EXIT
      } else {
        let initialFloor = await getInitialFloor(dbConnection, floor.FK_Trading_Plan);
        let dateLast = new Date(floor.DateTime);
        let dateInit = new Date(initialFloor.DateTime);
        let dateDiff = ((dateLast - dateInit) / 1000 / 60).toFixed(0);

        // PROFIT
        if (floor.NetProfit >= 0) {
          message += 'Exit Sell Price: ' + floor.Price + ' sats\n';
          message += 'Profit: ' + floor.NetProfit + '% 😎🍺\n';
          message += 'Duration: ' + dateDiff + 'min';
          // LOSS
        } else {
          message += 'Exit Sell Price: ' + floor.Price + ' sats\n';
          message += 'Loss: ' + floor.NetProfit + '% 😢💸\n\n';
          message += 'Duration: ' + dateDiff + 'min';
        }

        status = await bot.telegram.sendMessage(config.channel, message, { reply_to_message_id: initialFloor.TelegramID });
      }

      updateTelegramFloor(dbConnection, floor, status.message_id);
    }
    timerId = setTimeout(tick, 1000);
  }, 0);
}

async function initialMessage(bot, dbConnection) {
  let users = await db.users.getAllUsers(dbConnection);
  for (let user of users) {
    if (user.T_userid) {
      rebootInitialMessage(bot, user);
    }
  }
}

module.exports = {
  dailyReport,
  alertReport,
  initialMessage,
};
