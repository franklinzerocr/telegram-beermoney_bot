const db = require('../DB/db');
const binance = require('../binance/api');
const util = require('../util');
const { checkAuth } = require('./auth');
const { mainMenuMessage, fundsMessage, resultsChannelMessage, helpMessage, unauthorizedMessage } = require('./messages');
const { MenuMiddleware, MenuTemplate } = require('telegraf-inline-menu');
const { currencyDisplayMenu, withdrawMenu, walletConfigurationMenu } = require('./menu');

async function beermoneyCommands(bot, dbConnection, binanceAPI, user) {
  let assets = ['BTC', 'USDT', 'BUSD', 'ETH'];
  await bot.command('/saldo', async (ctx, next) => {
    await next();
    console.log(ctx.update.message);
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);
    if (user) {
      for (let asset of assets) {
        let ticker = asset == 'USDT' ? 1 : (await binance.getTicker(binanceAPI))[asset + 'USDT'];

        let funds = await db.funds.getLastFundsFromUser(dbConnection, user, asset);

        let fundsFIAT = util.numberWithCommas((ticker * funds.Amount).toFixed(2));
        let fundsDisplay = asset == 'BTC' && user.Display == 'sats' ? util.numberWithCommas(util.btcToSatoshi(funds.Amount)) + ' sats' : funds.Amount + ' ' + asset;
        let maxCapDisplay = asset == 'BTC' && user.Display == 'sats' ? util.numberWithCommas(util.btcToSatoshi(user[asset])) + ' sats' : user[asset] + ' ' + asset;
        ticker = util.numberWithCommas(Number(ticker).toFixed(2));
        await fundsMessage(ctx, fundsDisplay, fundsFIAT, maxCapDisplay, ticker, asset);
      }
      await util.sleep(2500);
      await mainMenuMessage(ctx);
    } else {
      await unauthorizedMessage(ctx);
      console.log('NOT ->' + ctx.update.message.from.username + ' - ' + ctx.update.message.from.id);
    }
  });

  await bot.command('/privatechannel', async (ctx, next) => {
    console.log(ctx.update.message);
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);
    if (user) {
      await resultsChannelMessage(ctx, bot);
    } else {
      await unauthorizedMessage(ctx);
      console.log('NOT ->' + ctx.update.message.from.username + ' - ' + ctx.update.message.from.id);
    }
  });

  await bot.command('/help', async (ctx, next) => {
    console.log(ctx.update.message);
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);
    if (user) {
      await helpMessage(ctx, user);
    } else {
      await unauthorizedMessage(ctx);
      console.log('NOT ->' + ctx.update.message.from.username + ' - ' + ctx.update.message.from.id);
    }
  });

  await bot.command('/depositar', async (ctx) => {
    console.log(ctx.update.message);
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);

    if (user) {
      await ctx.scene.enter('DEPOSIT_ID');
      await bot.launch();
    } else {
      await unauthorizedMessage(ctx);
      console.log('NOT ->' + ctx.update.message.from.username + ' - ' + ctx.update.message.from.id);
    }
  });

  await bot.command('/config', async (ctx, next) => {
    console.log(ctx.update.message);
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);

    if (user) {
      await menuMiddleware.replyToContext(ctx, '/WalletConfiguration/');
    } else {
      await unauthorizedMessage(ctx);
      console.log('NOT ->' + ctx.update.message.from.username + ' - ' + ctx.update.message.from.id);
    }
  });

  let menuTemplate = new MenuTemplate();

  menuTemplate = await currencyDisplayMenu(dbConnection, menuTemplate);
  menuTemplate = await withdrawMenu(bot, menuTemplate);
  menuTemplate = await walletConfigurationMenu(bot, menuTemplate);

  const menuMiddleware = new MenuMiddleware('/', menuTemplate);

  bot.command('/moneda', async (ctx) => {
    console.log(ctx.update.message);
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);

    if (user) {
      await menuMiddleware.replyToContext(ctx, '/ChooseCurrency/');
    } else {
      await unauthorizedMessage(ctx);
      console.log('NOT ->' + ctx.update.message.from.username + ' - ' + ctx.update.message.from.id);
    }
  });

  bot.command('/retirar', async (ctx) => {
    console.log(ctx.update.message);
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);

    if (user) {
      await menuMiddleware.replyToContext(ctx, '/CurrencyWithdrawal/');
    } else {
      await unauthorizedMessage(ctx);
      console.log('NOT ->' + ctx.update.message.from.username + ' - ' + ctx.update.message.from.id);
    }
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
