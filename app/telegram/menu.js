const { MenuTemplate, deleteMenuFromContext } = require('telegraf-inline-menu');
const { currencyMenuMessage, chosenCurrencyMessage, currencyWithdrawMessage, mainMenuMessage } = require('./messages');
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
  const menuBtc = new MenuTemplate(async () => await currencyWithdrawMessage());
  const menuSats = new MenuTemplate(async () => await currencyWithdrawMessage());
  let mainMenuToggleBtc = false;
  let mainMenuToggleSats = false;

  menuBtc.interact('BTC', 'BTCwithdraw', {
    hide: () => mainMenuToggleBtc,
    do: async (ctx) => {
      await ctx.scene.enter('WITHDRAW_BTC_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  menuBtc.interact('FIAT', 'BTCFIATwithdraw', {
    joinLastRow: true,
    hide: () => mainMenuToggleBtc,
    do: async (ctx) => {
      await ctx.scene.enter('WITHDRAW_FIAT_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  menuSats.interact('sats', 'satswithdraw', {
    hide: () => mainMenuToggleSats,
    do: async (ctx) => {
      await ctx.scene.enter('WITHDRAW_SATS_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  menuSats.interact('FIAT', 'satsFIATwithdraw', {
    joinLastRow: true,
    hide: () => mainMenuToggleSats,
    do: async (ctx) => {
      await ctx.scene.enter('WITHDRAW_FIAT_ID');
      await bot.launch();
      await deleteMenuFromContext(ctx);
      return false;
    },
  });

  menuTemplate.submenu('/BtcWithdrawal', 'BtcWithdrawal', menuBtc);

  menuTemplate.submenu('/SatsWithdrawal', 'SatsWithdrawal', menuSats);

  return menuTemplate;
};

module.exports = {
  currencyDisplayMenu,
  withdrawMenu,
};
