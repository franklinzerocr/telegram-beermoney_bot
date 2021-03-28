const db = require('../DB/db');
const binance = require('../binance/api');
const util = require('../util');
const { checkAuth } = require('./auth');
const { mainMenuMessage, fundsMessage, resultsChannelMessage } = require('./messages');
const { MenuMiddleware, MenuTemplate } = require('telegraf-inline-menu');
const { currencyDisplayMenu, withdrawMenu } = require('./menu');

async function beermoneyCommands(bot, dbConnection, binanceAPI, user) {
  await bot.command('balance', async (ctx, next) => {
    await next();
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);
    let funds = await db.funds.getLastFundsFromUser(dbConnection, user);
    let fundsSatoshis = util.numberWithCommas(funds.Amount);
    let fundsBtc = util.satoshiToBTC(funds.Amount);
    let fundsFIAT = ((await binance.getTicker(binanceAPI)).BTCUSDT * fundsBtc).toFixed(2);
    let fundsDisplay = user.Display == 'BTC' ? fundsBtc + ' BTC' : fundsSatoshis + ' sats';
    let maxCapDisplay = user.Display == 'BTC' ? util.satoshiToBTC(user.Capacity) + ' BTC' : util.numberWithCommas(user.Capacity) + ' sats';
    fundsMessage(ctx, user, fundsDisplay, fundsFIAT, maxCapDisplay);
  });
  await bot.command('results', async (ctx, next) => {
    resultsChannelMessage(ctx, bot);
  });

  await bot.command('depositar', async (ctx, next) => {
    ctx.scene.enter('DEPOSIT_ID');
    await bot.launch();
  });
  await bot.command('wallet', async (ctx, next) => {
    ctx.reply('COMING SOON!');
  });

  let menuTemplate = new MenuTemplate();

  menuTemplate = await currencyDisplayMenu(dbConnection, menuTemplate);
  menuTemplate = await withdrawMenu(bot, menuTemplate);

  const menuMiddleware = new MenuMiddleware('/', menuTemplate);

  bot.command('moneda', async (ctx) => {
    await menuMiddleware.replyToContext(ctx, '/ChooseCurrency/');
  });

  bot.command('retirar', async (ctx) => {
    user = await db.users.getUserByT_userid(dbConnection, user.T_userid);
    user.Display == 'BTC' ? await menuMiddleware.replyToContext(ctx, '/BtcWithdrawal/') : await menuMiddleware.replyToContext(ctx, '/SatsWithdrawal/');
  });

  bot.use(menuMiddleware.middleware());
}

async function beermoneyListeners(bot) {
  // Default response
  bot.on('text', (ctx) => {
    if (!ctx.update.message.text.includes('/')) mainMenuMessage(ctx);
  });
}

module.exports = {
  beermoneyCommands,
  beermoneyListeners,
};
