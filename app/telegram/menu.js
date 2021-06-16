const { MenuTemplate, deleteMenuFromContext } = require('telegraf-inline-menu');
const { currencyMenuMessage, chosenCurrencyMessage, currencyWithdrawMessage, mainMenuMessage, walletConfigurationMessage } = require('./messages');
const db = require('../DB/db');
const util = require('../util');
const { checkAuth } = require('./auth');

const currencyDisplayMenu = async (dbConnection, menuTemplate) => {
  const menuCurrency = new MenuTemplate(async () => await currencyMenuMessage());
  let mainMenuToggle = false;

  menuCurrency.interact('Show BTC', 'BTC', {
    hide: () => mainMenuToggle,
    do: async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.callback_query.from.username, ctx.update.callback_query.from.id);
      await db.users.updateUserCurrency(dbConnection, user.Username, 'BTC');
      await chosenCurrencyMessage(ctx, 'BTC');
      await deleteMenuFromContext(ctx);
      await util.sleep(2000);
      await mainMenuMessage(ctx);
      return false;
    },
  });

  menuCurrency.interact('Show sats', 'sats', {
    joinLastRow: true,
    hide: () => mainMenuToggle,
    do: async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.callback_query.from.username, ctx.update.callback_query.from.id);
      await db.users.updateUserCurrency(dbConnection, user.Username, 'sats');
      await chosenCurrencyMessage(ctx, 'sats');
      await deleteMenuFromContext(ctx);
      await util.sleep(2000);
      await mainMenuMessage(ctx);
      return false;
    },
  });

  menuTemplate.submenu('/ChooseCurrency', 'ChooseCurrency', menuCurrency);

  return menuTemplate;
};

const withdrawMenu = async (bot, menuTemplate) => {
  const currencyMenu = new MenuTemplate(async () => await currencyWithdrawMessage());
  let withdrawToggle = false;

  currencyMenu.interact('BTC', 'BTCwithdraw', {
    hide: () => withdrawToggle,
    do: async (ctx) => {
      await ctx.scene.enter('WITHDRAW_BTC_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  currencyMenu.interact('USDT', 'USDTwithdraw', {
    joinLastRow: true,
    hide: () => withdrawToggle,
    do: async (ctx) => {
      await ctx.scene.enter('WITHDRAW_USDT_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  currencyMenu.interact('BUSD', 'BUSDwithdraw', {
    joinLastRow: true,
    hide: () => withdrawToggle,
    do: async (ctx) => {
      await ctx.scene.enter('WITHDRAW_BUSD_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  currencyMenu.interact('ETH', 'ETHwithdraw', {
    joinLastRow: true,
    hide: () => withdrawToggle,
    do: async (ctx) => {
      await ctx.scene.enter('WITHDRAW_ETH_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  menuTemplate.submenu('/CurrencyWithdrawal', 'CurrencyWithdrawal', currencyMenu);

  return menuTemplate;
};
const walletConfigurationMenu = async (bot, menuTemplate) => {
  const walletMenu = new MenuTemplate(async () => await walletConfigurationMessage());
  let withdrawToggle = false;

  walletMenu.interact('BTC', 'BTCconfig', {
    hide: () => withdrawToggle,
    do: async (ctx) => {
      await ctx.scene.enter('WALLET_UPDATE_BTC_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  walletMenu.interact('USDT', 'USDTconfig', {
    joinLastRow: true,
    hide: () => withdrawToggle,
    do: async (ctx) => {
      await ctx.scene.enter('WALLET_UPDATE_USDT_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  walletMenu.interact('BUSD', 'BUSDconfig', {
    joinLastRow: true,
    hide: () => withdrawToggle,
    do: async (ctx) => {
      await ctx.scene.enter('WALLET_UPDATE_BUSD_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  walletMenu.interact('ETH', 'ETHconfig', {
    joinLastRow: true,
    hide: () => withdrawToggle,
    do: async (ctx) => {
      await ctx.scene.enter('WALLET_UPDATE_ETH_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  menuTemplate.submenu('/WalletConfiguration', 'WalletConfiguration', walletMenu);

  return menuTemplate;
};

module.exports = {
  currencyDisplayMenu,
  withdrawMenu,
  walletConfigurationMenu,
};
