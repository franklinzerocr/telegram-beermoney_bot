const { session, Scenes } = require('telegraf');
const { checkAuth } = require('./auth');
const db = require('../DB/db');
const { realWalletMessage, walletUpdateMessage, updateWalletAddressInstructionalMessage, showDepositAddressInstructionalMessage, realTxidMessage, depositStoredMessage, realAmountMessage, btcWithdrawalInstructionsMessage, satsWithdrawalInstructionsMessage, withdrawalStoredMessage, fiatWithdrawalInstructionsMessage, mainMenuMessage } = require('./messages');
const util = require('../util');
const binance = require('../binance/api');

async function leaveSceneTimeout(ctx) {
  setTimeout(async function tick() {
    return await ctx.scene.leave();
  }, 600000);
}

async function beermoneyScenes(bot, dbConnection, binanceAPI) {
  const depositWizard = new Scenes.WizardScene(
    'DEPOSIT_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
      let walletAddress = await binanceAPI.depositAddress('BTC');
      await showDepositAddressInstructionalMessage(ctx, walletAddress.address, user.Capacity);
      leaveSceneTimeout(ctx);
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase().includes('/BACKTOMENU')) {
        await mainMenuMessage(ctx);
        return await ctx.scene.leave();
      }
      let txId = String(ctx.message.text);
      if (txId.length < 10) {
        await realTxidMessage(ctx);
        return;
      }
      if (txId.includes('Internal transfer ')) txId = txId.split('Internal transfer ')[1];
      let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      await db.operations.storeDepositOperation(dbConnection, lastFunds, txId);
      await depositStoredMessage(ctx);
      await util.sleep(2000);
      await mainMenuMessage(ctx);
      return await ctx.scene.leave();
    }
  );
  const withdrawBtcWizard = new Scenes.WizardScene(
    'WITHDRAW_BTC_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.callback_query.from.username, ctx.update.callback_query.from.id);
      let BTCUSDT = (await binance.getTicker(binanceAPI)).BTCUSDT;
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      let fundsBtc = util.satoshiToBTC(lastFunds.Amount);
      let fundsFIAT = util.numberWithCommas((BTCUSDT * fundsBtc).toFixed(2));
      let minBtc = 0.0005;
      let minFIAT = util.numberWithCommas((BTCUSDT * minBtc).toFixed(2));
      ctx.wizard.state.withdrawal = { fundsBtc: fundsBtc, fundsFIAT: fundsFIAT, minBtc: minBtc, minFIAT: minFIAT };
      await btcWithdrawalInstructionsMessage(ctx, fundsBtc, fundsFIAT, minBtc, minFIAT);
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase().includes('/BACKTOMENU')) {
        await mainMenuMessage(ctx);
        return await ctx.scene.leave();
      }

      let amount = Number(ctx.message.text);
      if (!amount || amount < ctx.wizard.state.withdrawal.minBtc || amount > ctx.wizard.state.withdrawal.fundsBtc) {
        await realAmountMessage(ctx);
        return;
      }
      let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      amount = util.btcToSatoshi(amount);
      await db.operations.storeWithdrawalOperation(dbConnection, lastFunds, amount);
      await withdrawalStoredMessage(ctx);
      await util.sleep(2000);
      await mainMenuMessage(ctx);
      return await ctx.scene.leave();
    }
  );

  const withdrawSatsWizard = new Scenes.WizardScene(
    'WITHDRAW_SATS_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.callback_query.from.username, ctx.update.callback_query.from.id);
      let BTCUSDT = (await binance.getTicker(binanceAPI)).BTCUSDT;
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      let fundsBtc = util.satoshiToBTC(lastFunds.Amount);
      let fundsFIAT = util.numberWithCommas((BTCUSDT * fundsBtc).toFixed(2));
      let minBtc = 0.0005;
      let minSats = util.numberWithCommas(50000);
      let minFIAT = util.numberWithCommas((BTCUSDT * minBtc).toFixed(2));
      ctx.wizard.state.withdrawal = { fundsSats: lastFunds.Amount, fundsFIAT: fundsFIAT, minSats: minSats, minFIAT: minFIAT };
      await satsWithdrawalInstructionsMessage(ctx, util.numberWithCommas(lastFunds.Amount), fundsFIAT, minSats, minFIAT);
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase().includes('/BACKTOMENU')) {
        await mainMenuMessage(ctx);
        return await ctx.scene.leave();
      }

      let amount = Number(ctx.message.text);
      if (!amount || amount < ctx.wizard.state.withdrawal.minSats || amount > ctx.wizard.state.withdrawal.fundsSats) {
        await realAmountMessage(ctx);
        return;
      }
      let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      await db.operations.storeWithdrawalOperation(dbConnection, lastFunds, amount);
      await withdrawalStoredMessage(ctx);
      await util.sleep(2000);
      await mainMenuMessage(ctx);
      return await ctx.scene.leave();
    }
  );

  const withdrawFiatWizard = new Scenes.WizardScene(
    'WITHDRAW_FIAT_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.callback_query.from.username, ctx.update.callback_query.from.id);
      let BTCUSDT = (await binance.getTicker(binanceAPI)).BTCUSDT;
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      let fundsBtc = util.satoshiToBTC(lastFunds.Amount * 0.99);
      let fundsFIAT = util.numberWithCommas((BTCUSDT * fundsBtc).toFixed(2));
      let minBtc = 0.000505;
      let minFIAT = util.numberWithCommas((BTCUSDT * minBtc).toFixed(2));
      ctx.wizard.state.withdrawal = { fundsFIAT: fundsFIAT, minFIAT: minFIAT };
      await fiatWithdrawalInstructionsMessage(ctx, fundsFIAT, minFIAT);
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase().includes('/BACKTOMENU')) {
        await mainMenuMessage(ctx);
        return await ctx.scene.leave();
      }

      let amount = Number(ctx.message.text);
      if (!amount || amount < ctx.wizard.state.withdrawal.minFIAT || amount > ctx.wizard.state.withdrawal.fundsFIAT) {
        await realAmountMessage(ctx);
        return;
      }
      let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
      let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user);
      let BTCUSDT = (await binance.getTicker(binanceAPI)).BTCUSDT;
      amount = util.btcToSatoshi((amount / BTCUSDT).toFixed(8));
      await db.operations.storeWithdrawalOperation(dbConnection, lastFunds, amount);
      await withdrawalStoredMessage(ctx);
      await util.sleep(2000);
      await mainMenuMessage(ctx);
      return await ctx.scene.leave();
    }
  );

  const walletWizard = new Scenes.WizardScene(
    'WALLET_UPDATE_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
      let wallet = await db.wallet_address.getWalletFromUser(dbConnection, user);
      await updateWalletAddressInstructionalMessage(ctx, wallet);
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase().includes('/BACKTOMENU')) {
        await mainMenuMessage(ctx);
        return await ctx.scene.leave();
      }

      let walletAddress = String(ctx.message.text);
      if (walletAddress.length < 27) {
        await realWalletMessage(ctx);
        return;
      }

      let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
      let wallet = await db.wallet_address.getWalletFromUser(dbConnection, user);
      await db.wallet_address.updateWalletAddress(dbConnection, wallet, walletAddress);
      await walletUpdateMessage(ctx);
      await util.sleep(2000);
      await mainMenuMessage(ctx);
      return await ctx.scene.leave();
    }
  );

  const stage = new Scenes.Stage([depositWizard, withdrawFiatWizard, withdrawSatsWizard, withdrawBtcWizard, walletWizard]);
  bot.use(session()); // to  be precise, session is not a must have for Scenes to work, but it sure is lonely without one
  bot.use(stage.middleware());
}

module.exports = {
  beermoneyScenes,
};
