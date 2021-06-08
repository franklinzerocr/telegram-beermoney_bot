const db = require('../DB/db');
const schedule = require('node-schedule');
const binance = require('../binance/api');
const util = require('../util');
const { dailyReportMessage, rebootInitialMessage, dailyReportIntroMessage } = require('./messages');
const config = require('config');
const { getNewlyCreatedFloors, updateTelegramFloor, getInitialFloor, getNewlyCreatedFloorsSignals, updateTelegramFloorSignals } = require('../DB/floors');

async function waitForBeermoneyBot(dbConnection) {
  let tradingPool = await db.trading_pool.checkDiffTradingPool(dbConnection);
  while (tradingPool.length == 4) {
    console.log('- Wait 1min for Beermoney System Update');
    await util.sleep(60000);
    tradingPool = await db.trading_pool.checkDiffTradingPool(dbConnection);
  }
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
  schedule.scheduleJob({ hour: 00, minute: 00, second: 30 }, async function () {
    let tradingPool = await waitForBeermoneyBot(dbConnection);
    let users = await db.users.getAllUsers(dbConnection);
    let assets = ['BTC', 'USDT', 'BUSD', 'ETH'];
    for (let asset of assets) {
      let ticker = asset == 'USDT' ? 1 : (await binance.getTicker(binanceAPI))[asset + 'USDT'];
      for (let user of users) {
        if (user.T_userid) {
          asset == 'BTC' ? dailyReportIntroMessage(bot, user) : null;
          let funds = await db.funds.getPreviousTwoFundsFromUser(dbConnection, user, asset);
          let fundsDisplay = [],
            fundsAmount = [];
          fundsFIAT = [];
          for (let fund of funds) {
            fundsFIAT.push(util.numberWithCommas((ticker * fund.Amount).toFixed(2)));
            fundsAmount.push(fund.Amount);
            fundsDisplay.push(asset == 'BTC' && user.Display == 'sats' ? util.numberWithCommas(util.btcToSatoshi(fund.Amount)) + ' sats' : fund.Amount + ' ' + asset);
          }
          let operationsBalance = operationsTotalBalance(await db.operations.getConfirmedOperationsFromFunds(dbConnection, funds[1]));
          let operationsBalanceDisplay = asset == 'BTC' && user.Display == 'sats' ? util.numberWithCommas(util.btcToSatoshi(operationsBalance)) + ' sats' : operationsBalance + ' ' + asset;
          let unconfirmedOperations = await db.operations.getUnconfirmedOperationsFromFunds(dbConnection, funds[1]);
          let ROI = (((funds[0].Amount - operationsBalance) * 100) / funds[1].Amount - 100).toFixed(2);
          let earnings = funds[0].Profit;
          earnings = asset == 'BTC' && user.Display == 'sats' ? util.numberWithCommas(util.btcToSatoshi(earnings)) + ' sats' : earnings + ' ' + asset;
          ticker = util.numberWithCommas(Math.floor(ticker));
          dailyReportMessage(bot, user, fundsDisplay, fundsFIAT, ROI, BTCUSDT, earnings, unconfirmedOperations.length, operationsBalance, operationsBalanceDisplay, funds[0].Amount, asset);
        }
      }
    }
  });
}

async function alertReport(bot, dbConnection) {
  console.log('Start Telegram Results Channel BOT!');
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

      floor.Pair = floor.Pair == 'BTC' ? 'sats' : floor.Pair;

      // ENTRY
      if (floor.Level == 0) {
        message += '#TradingPlan' + floor.FK_Trading_Plan + ' START!!!\n\n';
        message += '#' + floor.Asset + ' / #' + floor.Pair + '\n';
        message += 'Entry Buy Price: ' + floor.Price + '\n';
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
          message += '#' + floor.Asset + ' / #' + floor.Pair + '\n';
          message += 'Exit Sell Price: ' + floor.Price + '\n';
          message += 'Duration: ' + dateDiff + 'min\n';
          message += 'Profit: ' + (floor.NetProfit - 100).toFixed(2) + '% 😎🍺';
          // LOSS
        } else {
          message += '#' + floor.Asset + ' / #' + floor.Pair + '\n';
          message += 'Exit Sell Price: ' + floor.Price + '\n';
          message += 'Duration: ' + dateDiff + 'min\n';
          message += 'Loss: ' + (floor.NetProfit - 100).toFixed(2) + '% 😢💸';
        }

        status = await bot.telegram.sendMessage(config.channel, message, { reply_to_message_id: initialFloor.TelegramID });
      }
      await updateTelegramFloor(dbConnection, floor, status.message_id);
    }
    timerId = setTimeout(tick, 1000);
  }, 0);
}

async function beermoneySignals(bot, dbConnection, binanceAPI) {
  console.log('Start Beermoney Signals Channel!');
  let timerId = setTimeout(async function tick() {
    let floor = [];
    let message = '';
    let status = {};

    floor = await getNewlyCreatedFloorsSignals(dbConnection);
    if (floor.length) {
      floor = floor[0];

      message = '';
      status = {};

      // let alert = await getAlertOfFloor(dbConnection, floor);

      // ENTRY
      if (floor.Level == 0) {
        message += '#TradingPlan' + floor.FK_Trading_Plan + ' START 🏁\n\n';
        message += '#' + floor.Asset + ' / #' + floor.Pair + '\n';
        message += 'Entry Buy Price: ' + floor.Price + '\n';
        // message += 'Channel: ' + alert.Channel;
        status = await bot.telegram.sendMessage(config.beermoneySignals, message);
        await updateTelegramFloorSignals(dbConnection, floor, status.message_id);

        //EXIT
      } else {
        let initialFloor = await getInitialFloor(dbConnection, floor.FK_Trading_Plan);
        await binance.postTopPrice(bot, dbConnection, binanceAPI, floor, initialFloor);
      }
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
  beermoneySignals,
};
