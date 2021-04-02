const db = require('../DB/db');
const binance = require('../binance/api');
const util = require('../util');
const { checkAuth } = require('./auth');
const { mainMenuMessage, fundsMessage, resultsChannelMessage, helpMessage } = require('./messages');
const { MenuMiddleware, MenuTemplate } = require('telegraf-inline-menu');
const { currencyDisplayMenu, withdrawMenu } = require('./menu');

async function beermoneyCommands(bot, dbConnection, binanceAPI, user) {
  await bot.command('/saldo', async (ctx, next) => {
    await next();
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);
    let funds = await db.funds.getLastFundsFromUser(dbConnection, user);
    let fundsSatoshis = util.numberWithCommas(funds.Amount);
    let fundsBtc = util.satoshiToBTC(funds.Amount);
    let fundsFIAT = util.numberWithCommas(((await binance.getTicker(binanceAPI)).BTCUSDT * fundsBtc).toFixed(2));
    let fundsDisplay = user.Display == 'BTC' ? fundsBtc + ' BTC' : fundsSatoshis + ' sats';
    let maxCapDisplay = user.Display == 'BTC' ? util.satoshiToBTC(user.Capacity) + ' BTC' : util.numberWithCommas(user.Capacity) + ' sats';
    await fundsMessage(ctx, user, fundsDisplay, fundsFIAT, maxCapDisplay);
  });

  await bot.command('/results', async (ctx, next) => {
    await resultsChannelMessage(ctx, bot);
  });

  await bot.command('/help', async (ctx, next) => {
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);

    await helpMessage(ctx, user);
  });

  await bot.command('/depositar', async (ctx) => {
    await ctx.scene.enter('DEPOSIT_ID');
    await bot.launch();
  });

  await bot.command('/config', async (ctx, next) => {
    await ctx.scene.enter('WALLET_UPDATE_ID');
    await bot.launch();
  });

  let menuTemplate = new MenuTemplate();

  menuTemplate = await currencyDisplayMenu(dbConnection, menuTemplate);
  menuTemplate = await withdrawMenu(bot, menuTemplate);

  const menuMiddleware = new MenuMiddleware('/', menuTemplate);

  bot.command('/moneda', async (ctx) => {
    await menuMiddleware.replyToContext(ctx, '/ChooseCurrency/');
  });

  bot.command('/retirar', async (ctx) => {
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);
    user.Display == 'BTC' ? await menuMiddleware.replyToContext(ctx, '/BtcWithdrawal/') : await menuMiddleware.replyToContext(ctx, '/SatsWithdrawal/');
  });

  bot.use(menuMiddleware.middleware());

  beermoneyDefaultListener(bot);
}

function beermoneyDefaultListener(bot) {
  // Default response
  bot.on('text', async (ctx) => {
    if (ctx.update.message.text.includes('/backToMenu') || ctx.update.message.text.includes('/menu') || !ctx.update.message.text.includes('/')) await mainMenuMessage(ctx);
  });
}

module.exports = {
  beermoneyCommands,
};
