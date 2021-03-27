const { MenuTemplate, MenuMiddleware, createBackMainMenuButtons } = require('telegraf-inline-menu');
const { currencyMenuMessage, chosenCurrencyMessage } = require('./messages');
const db = require('../DB/db');
const { checkAuth } = require('./auth');

const currencyDisplayMenu = async (bot, dbConnection) => {
  const menu = new MenuTemplate(() => currencyMenuMessage());
  let mainMenuToggle = false;
  let message_id = 0;

  menu.interact('BTC', 'BTC', {
    hide: () => mainMenuToggle,
    do: async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.callback_query.from.username, ctx.update.callback_query.from.id);
      await db.users.updateUserCurrency(dbConnection, user.Username, 'BTC');
      chosenCurrencyMessage(ctx, 'BTC');
      ctx.deleteMessage(message_id);
      mainMenuToggle = true;
      return false;
    },
  });

  menu.interact('sats', 'sats', {
    joinLastRow: true,
    hide: () => mainMenuToggle,
    do: async (ctx) => {
      let user = await checkAuth(dbConnection, ctx.update.callback_query.from.username, ctx.update.callback_query.from.id);
      await db.users.updateUserCurrency(dbConnection, user.Username, 'sats');
      chosenCurrencyMessage(ctx, 'sats');
      ctx.deleteMessage(message_id);
      mainMenuToggle = true;
      return false;
    },
  });

  const menuMiddleware = new MenuMiddleware('/', menu);

  bot.command('moneda', async (ctx) => {
    mainMenuToggle = false;
    let status = await menuMiddleware.replyToContext(ctx);
    message_id = status.message_id;
  });

  bot.use(menuMiddleware.middleware());
};

module.exports = {
  currencyDisplayMenu,
};
