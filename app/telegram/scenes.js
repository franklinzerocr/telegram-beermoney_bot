const { session, Scenes } = require('telegraf');
const { checkAuth } = require('./auth');
const db = require('../DB/db');
const { showDepositAddressMessage, realTxidMessage, depositStoredMessage, realAmountMessage, btcWithdrawalInstructionsMessage, satsWithdrawalInstructionsMessage, withdrawalStoredMessage, fiatWithdrawalInstructionsMessage } = require('./messages');
const util = require('../util');
const binance = require('../binance/api');

async function beermoneyScenes(bot, dbConnection, binanceAPI, user) {
  const depositWizard = new Scenes.WizardScene(
    'DEPOSIT_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      let walletAddress = await binanceAPI.depositAddress('BTC');
      await showDepositAddressMessage(ctx, walletAddress.address, user.Capacity);
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase() == 'EXIT') ctx.scene.leave();

      let txId = String(ctx.message.text);
      if (txId.length < 10) {
        realTxidMessage(ctx);
        return;
      }
      user = await db.users.getUserByT_userid(dbConnection, user.T_userid);
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      await db.operations.storeDepositOperation(dbConnection, lastFunds, txId);
      depositStoredMessage(ctx);
      return ctx.scene.leave();
    }
  );
  const withdrawBtcWizard = new Scenes.WizardScene(
    'WITHDRAW_BTC_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      user = await db.users.getUserByT_userid(dbConnection, user.T_userid);
      let BTCUSDT = (await binance.getTicker(binanceAPI)).BTCUSDT;
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      let fundsBtc = util.satoshiToBTC(lastFunds.Amount);
      let fundsFIAT = util.numberWithCommas((BTCUSDT * fundsBtc).toFixed(2));
      let minBtc = 0.0005;
      let minFIAT = util.numberWithCommas((BTCUSDT * minBtc).toFixed(2));
      ctx.wizard.state.withdrawal = { fundsBtc: fundsBtc, fundsFIAT: fundsFIAT, minBtc: minBtc, minFIAT: minFIAT };
      btcWithdrawalInstructionsMessage(ctx, fundsBtc, fundsFIAT, minBtc, minFIAT);
      return ctx.wizard.next();
    },
    async (ctx) => {
      // validation example
      if (String(ctx.message.text).toUpperCase() == 'EXIT') ctx.scene.leave();

      let amount = Number(ctx.message.text);
      if (!amount || amount < ctx.wizard.state.withdrawal.minBtc || amount > ctx.wizard.state.withdrawal.fundsBtc) {
        realAmountMessage(ctx);
        return;
      }
      user = await db.users.getUserByT_userid(dbConnection, user.T_userid);
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      amount = util.btcToSatoshi(amount);
      await db.operations.storeWithdrawalOperation(dbConnection, lastFunds, amount);
      withdrawalStoredMessage(ctx);
      return ctx.scene.leave();
    }
  );

  const withdrawSatsWizard = new Scenes.WizardScene(
    'WITHDRAW_SATS_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      user = await db.users.getUserByT_userid(dbConnection, user.T_userid);
      let BTCUSDT = (await binance.getTicker(binanceAPI)).BTCUSDT;
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      let fundsBtc = util.satoshiToBTC(lastFunds.Amount);
      let fundsFIAT = util.numberWithCommas((BTCUSDT * fundsBtc).toFixed(2));
      let minBtc = 0.0005;
      let minSats = util.numberWithCommas(50000);
      let minFIAT = util.numberWithCommas((BTCUSDT * minBtc).toFixed(2));
      ctx.wizard.state.withdrawal = { fundsSats: lastFunds.Amount, fundsFIAT: fundsFIAT, minSats: minSats, minFIAT: minFIAT };
      satsWithdrawalInstructionsMessage(ctx, util.numberWithCommas(lastFunds.Amount), fundsFIAT, minSats, minFIAT);
      return ctx.wizard.next();
    },
    async (ctx) => {
      // validation example
      if (String(ctx.message.text).toUpperCase() == 'EXIT') ctx.scene.leave();

      let amount = Number(ctx.message.text);
      if (!amount || amount < ctx.wizard.state.withdrawal.minSats || amount > ctx.wizard.state.withdrawal.fundsSats) {
        realAmountMessage(ctx);
        return;
      }
      user = await db.users.getUserByT_userid(dbConnection, user.T_userid);
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      await db.operations.storeWithdrawalOperation(dbConnection, lastFunds, amount);
      withdrawalStoredMessage(ctx);
      return ctx.scene.leave();
    }
  );

  const withdrawFiatWizard = new Scenes.WizardScene(
    'WITHDRAW_FIAT_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      user = await db.users.getUserByT_userid(dbConnection, user.T_userid);
      let BTCUSDT = (await binance.getTicker(binanceAPI)).BTCUSDT;
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      let fundsBtc = util.satoshiToBTC(lastFunds.Amount * 0.99);
      let fundsFIAT = util.numberWithCommas((BTCUSDT * fundsBtc).toFixed(2));
      let minBtc = 0.000505;
      let minFIAT = util.numberWithCommas((BTCUSDT * minBtc).toFixed(2));
      ctx.wizard.state.withdrawal = { fundsFIAT: fundsFIAT, minFIAT: minFIAT };
      fiatWithdrawalInstructionsMessage(ctx, fundsFIAT, minFIAT);
      return ctx.wizard.next();
    },
    async (ctx) => {
      // validation example
      if (String(ctx.message.text).toUpperCase() == 'EXIT') ctx.scene.leave();

      let amount = Number(ctx.message.text);
      if (!amount || amount < ctx.wizard.state.withdrawal.minFIAT || amount > ctx.wizard.state.withdrawal.fundsFIAT) {
        realAmountMessage(ctx);
        return;
      }
      user = await db.users.getUserByT_userid(dbConnection, user.T_userid);
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      let BTCUSDT = (await binance.getTicker(binanceAPI)).BTCUSDT;
      amount = util.btcToSatoshi((amount / BTCUSDT).toFixed(8));
      await db.operations.storeWithdrawalOperation(dbConnection, lastFunds, amount);
      withdrawalStoredMessage(ctx);
      return ctx.scene.leave();
    }
  );

  const stage = new Scenes.Stage([depositWizard, withdrawFiatWizard, withdrawSatsWizard, withdrawBtcWizard]);
  bot.use(session()); // to  be precise, session is not a must have for Scenes to work, but it sure is lonely without one
  bot.use(stage.middleware());
}

module.exports = {
  beermoneyScenes,
};
