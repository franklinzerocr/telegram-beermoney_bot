const { session, Scenes } = require('telegraf');
const { checkAuth } = require('./auth');
const db = require('../DB/db');
const { notUniqueTxidMessage, realWalletMessage, walletUpdateMessage, updateWalletAddressInstructionalMessage, showDepositAddressInstructionalMessage, realTxidMessage, depositStoredMessage, realAmountMessage, btcWithdrawalInstructionsMessage, satsWithdrawalInstructionsMessage, withdrawalStoredMessage, fiatWithdrawalInstructionsMessage, mainMenuMessage, withdrawalErrorMessage } = require('./messages');
const util = require('../util');
const binance = require('../binance/api');

async function leaveSceneTimeout(ctx) {
  setTimeout(async function tick() {
    return await ctx.scene.leave();
  }, 1800000);
}

async function beermoneyScenes(bot, dbConnection, binanceAPI) {
  async function getWalletInfo(asset) {
    let walletInfo = await binanceAPI.getWalletInfo();
    let obj = walletInfo.find((obj) => obj.coin == asset)['networkList'].find((obj) => obj.isDefault == true);
    return obj.withdrawFee;
  }

  async function withdrawal1stPart(ctx, asset) {
    let user = await checkAuth(dbConnection, ctx.update.callback_query.from.username, ctx.update.callback_query.from.id);
    let ticker = asset == 'USDT' ? 1 : (await binance.getTicker(binanceAPI))[asset + 'USDT'];
    let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user, asset);
    let fundsFIAT = util.numberWithCommas((ticker * lastFunds.Amount).toFixed(2));
    let minWithdrawal = await getWalletInfo(asset);
    let minFIAT = util.numberWithCommas((ticker * minWithdrawal).toFixed(2));
    ctx.wizard.state.withdrawal = { funds: lastFunds.Amount, fundsFIAT: fundsFIAT, minWithdrawal: minWithdrawal, minFIAT: minFIAT };
    await btcWithdrawalInstructionsMessage(ctx, lastFunds.Amount, fundsFIAT, minWithdrawal, minFIAT, asset);
    leaveSceneTimeout(ctx);
    return ctx;
  }

  async function withdrawal2ndPart(ctx, asset, amount) {
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
    let lastFunds = await db.funds.getLastFundsFromUser(dbConnection, user, asset);
    (await db.operations.storeWithdrawalOperation(dbConnection, lastFunds, amount)) ? await withdrawalStoredMessage(ctx) : await withdrawalErrorMessage(ctx);
    await util.sleep(2500);
    await mainMenuMessage(ctx);
    return ctx;
  }

  const depositWizard = new Scenes.WizardScene(
    'DEPOSIT_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
      await showDepositAddressInstructionalMessage(ctx);
      leaveSceneTimeout(ctx);
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase().includes('/BACKTOMENU')) {
        await mainMenuMessage(ctx);
        return await ctx.scene.leave();
      }
      let txId = String(ctx.message.text);
      if (txId.length < 9) {
        await realTxidMessage(ctx);
        return;
      }
      if (txId.includes('Internal transfer ')) txId = txId.split('Internal transfer ')[1];
      if ((await db.operations.checkExistingDeposit(dbConnection, txId)).length > 0) {
        await notUniqueTxidMessage(ctx);
        return;
      }
      let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
      await db.operations.storeDepositOperation(dbConnection, user, txId);
      await depositStoredMessage(ctx);
      await util.sleep(2500);
      await mainMenuMessage(ctx);
      return await ctx.scene.leave();
    }
  );

  const withdrawUSDTWizard = new Scenes.WizardScene(
    'WITHDRAW_USDT_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      ctx = await withdrawal1stPart(ctx, 'USDT');
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase().includes('/BACKTOMENU')) {
        await mainMenuMessage(ctx);
        return await ctx.scene.leave();
      }

      let amount = Number(ctx.message.text);
      if (!amount || amount < ctx.wizard.state.withdrawal.minWithdrawal || amount > ctx.wizard.state.withdrawal.funds) {
        await realAmountMessage(ctx);
        return;
      }
      ctx = await withdrawal2ndPart(ctx, 'USDT', amount);
      return await ctx.scene.leave();
    }
  );

  const withdrawBUSDWizard = new Scenes.WizardScene(
    'WITHDRAW_BUSD_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      ctx = await withdrawal1stPart(ctx, 'BUSD');
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase().includes('/BACKTOMENU')) {
        await mainMenuMessage(ctx);
        return await ctx.scene.leave();
      }

      let amount = Number(ctx.message.text);
      if (!amount || amount < ctx.wizard.state.withdrawal.minWithdrawal || amount > ctx.wizard.state.withdrawal.funds) {
        await realAmountMessage(ctx);
        return;
      }
      ctx = await withdrawal2ndPart(ctx, 'BUSD', amount);
      return await ctx.scene.leave();
    }
  );

  const withdrawETHWizard = new Scenes.WizardScene(
    'WITHDRAW_ETH_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      ctx = await withdrawal1stPart(ctx, 'ETH');
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase().includes('/BACKTOMENU')) {
        await mainMenuMessage(ctx);
        return await ctx.scene.leave();
      }

      let amount = Number(ctx.message.text);
      if (!amount || amount < ctx.wizard.state.withdrawal.minWithdrawal || amount > ctx.wizard.state.withdrawal.funds) {
        await realAmountMessage(ctx);
        return;
      }
      ctx = await withdrawal2ndPart(ctx, 'ETH', amount);
      return await ctx.scene.leave();
    }
  );

  const withdrawBTCWizard = new Scenes.WizardScene(
    'WITHDRAW_BTC_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      ctx = await withdrawal1stPart(ctx, 'BTC');
      return ctx.wizard.next();
    },
    async (ctx) => {
      if (String(ctx.message.text).toUpperCase().includes('/BACKTOMENU')) {
        await mainMenuMessage(ctx);
        return await ctx.scene.leave();
      }

      let amount = Number(ctx.message.text);
      if (!amount || amount < ctx.wizard.state.withdrawal.minWithdrawal || amount > ctx.wizard.state.withdrawal.funds) {
        await realAmountMessage(ctx);
        return;
      }
      ctx = await withdrawal2ndPart(ctx, 'BTC', amount);
      return await ctx.scene.leave();
    }
  );

  const walletWizard = new Scenes.WizardScene(
    'WALLET_UPDATE_ID', // first argument is Scene_ID, same as for BaseScene
    async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
      let wallet = await db.wallet_address.getWalletFromUser(dbConnection, user);
      await updateWalletAddressInstructionalMessage(ctx, wallet);
      leaveSceneTimeout(ctx);

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

  const stage = new Scenes.Stage([depositWizard, withdrawBTCWizard, withdrawUSDTWizard, withdrawBUSDWizard, withdrawETHWizard, walletWizard]);
  bot.use(session()); // to  be precise, session is not a must have for Scenes to work, but it sure is lonely without one
  bot.use(stage.middleware());
}

module.exports = {
  beermoneyScenes,
};
