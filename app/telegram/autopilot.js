const db = require('../DB/db');
const schedule = require('node-schedule');
const binance = require('../binance/api');
const util = require('../util');
const { dailyReportMessage, rebootInitialMessage } = require('./messages');
const config = require('config');
const { getNewlyCreatedFloors, updateTelegramFloor, getInitialFloor, getAlertOfFloor } = require('../DB/floors');

async function waitForBeermoneyBot(dbConnection) {
  let tradingPool = await db.trading_pool.checkDiffTradingPool(dbConnection);
  while (tradingPool.length == 0) {
    console.log('- Wait 1min for Beermoney System Update');
    await util.sleep(60000);
    tradingPool = await db.trading_pool.checkDiffTradingPool(dbConnection);
  }
  await util.sleep(300000);
  return tradingPool[0];
}

function operationsTotalBalance(operations) {
  let balance = 0;
  for (let operation of operations) {
    if (operation.Type == 'Deposit') balance += operation.Amount;
    else if (operation.Type == 'Withdrawal') balance -= operation.Amount;
  }
  return balance;
}

async function dailyReport(bot, dbConnection, binanceAPI) {
  schedule.scheduleJob({ hour: 00, minute: 00, second: 10 }, async function () {
    let tradingPool = await waitForBeermoneyBot(dbConnection);
    let users = await db.users.getAllUsers(dbConnection);
    for (let user of users) {
      if (user.T_userid) {
        let funds = await db.funds.getPreviousTwoFundsFromUser(dbConnection, user);
        let fundsDisplay = [],
          fundsAmount = [];
        fundsFIAT = [];
        let BTCUSDT = (await binance.getTicker(binanceAPI)).BTCUSDT;
        for (let fund of funds) {
          let fundsBtc = util.satoshiToBTC(fund.Amount);
          fundsFIAT.push(util.numberWithCommas((BTCUSDT * fundsBtc).toFixed(2)));
          let fundsSatoshis = fund.Amount;
          fundsAmount.push(user.Display == 'BTC' ? fundsBtc : fundsSatoshis);
          fundsDisplay.push(user.Display == 'BTC' ? fundsBtc + ' BTC' : util.numberWithCommas(fundsSatoshis) + ' sats');
        }
        let operationsBalance = operationsTotalBalance(await db.operations.getConfirmedOperationsFromFunds(dbConnection, funds[1]));
        let unconfirmedOperations = await db.operations.getUnconfirmedOperationsFromFunds(dbConnection, funds[1]);
        let ROI = (((funds[0].Amount - operationsBalance) * 100) / funds[1].Amount - 100).toFixed(2);
        let earnings = Number(await db.earning.getProfitEarningsFromFunds(dbConnection, funds[1]));
        if (user.Beermoney) earnings += Number(await db.earning.getBeermoneyEarningsFromTradingPool(dbConnection, tradingPool));
        earnings = user.Display == 'BTC' ? util.satoshiToBTC(earnings) + ' BTC' : util.numberWithCommas(earnings) + ' sats';
        BTCUSDT = util.numberWithCommas(Math.floor(BTCUSDT));
        dailyReportMessage(bot, user, fundsDisplay, fundsFIAT, ROI, BTCUSDT, earnings, unconfirmedOperations.length);
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

      // let alert = await getAlertOfFloor(dbConnection, floor);

      // ENTRY
      if (floor.Level == 0) {
        message += '#TradingPlan' + floor.FK_Trading_Plan + ' START!!!\n\n';
        message += floor.Asset + ' / #BTC\n';
        message += 'Entry Buy Price: ' + floor.Price + ' sats \n';
        // message += 'Channel: ' + alert.Channel;
        status = await bot.telegram.sendMessage(config.channel, message);
        //EXIT
      } else {
        let initialFloor = await getInitialFloor(dbConnection, floor.FK_Trading_Plan);
        let dateLast = new Date(floor.DateTime);
        let dateInit = new Date(initialFloor.DateTime);
        let dateDiff = ((dateLast - dateInit) / 1000 / 60).toFixed(0);

        // PROFIT
        if (floor.NetProfit - 100 >= 0) {
          message += 'Exit Sell Price: ' + floor.Price + ' sats\n';
          message += 'Duration: ' + dateDiff + 'min\n';
          message += 'Profit: ' + (floor.NetProfit - 100).toFixed(2) + '% 😎🍺';
          // LOSS
        } else {
          message += 'Exit Sell Price: ' + floor.Price + ' sats\n';
          message += 'Duration: ' + dateDiff + 'min\n';
          message += 'Loss: ' + (floor.NetProfit - 100).toFixed(2) + '% 😢💸';
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
