const db = require('../DB/db');
const schedule = require('node-schedule');
const binance = require('../binance/api');
const util = require('../util');
const { dailyReportMessage } = require('./messages');

async function waitForBeermoneyBot(dbConnection) {
  while ((await db.trading_pool.checkDiffTradingPool(dbConnection)).length == 0) {
    console.log('- Wait 5secs for Beermoney System Update');
    await util.sleep(5000);
  }
}

async function dailyReport(bot, dbConnection, binanceAPI) {
  schedule.scheduleJob({ hour: 00, minute: 00, second: 30 }, async function () {
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

module.exports = {
  dailyReport,
};
