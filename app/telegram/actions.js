const db = require('../DB/db');
const binance = require('../binance/api');
const util = require('../util');
const { checkAuth } = require('./auth');
const { mainMenuMessage, fundsMessage, resultsChannelMessage } = require('./messages');

async function beermoneyCommands(bot, dbConnection, binanceAPI) {
  await bot.command('balance', async (ctx, next) => {
    await next();
    let user = await checkAuth(dbConnection, ctx.update.message.from.username, ctx.update.message.from.id);
    let funds = await db.funds.getLastFundsFromUser(dbConnection, user);
    let fundsSatoshis = util.numberWithCommas(funds.Amount);
    let fundsBtc = util.satoshiToBTC(funds.Amount);
    let fundsFIAT = ((await binance.getTicker(binanceAPI)).BTCUSDT * fundsBtc).toFixed(2);
    let fundsDisplay = user.Display == 'BTC' ? fundsBtc + ' BTC' : fundsSatoshis + ' sats';
    fundsMessage(ctx, user, fundsDisplay, fundsFIAT);
  });
  await bot.command('moneda', async (ctx, next) => {
    await ctx.scene.enter('CONTACT_DATA_WIZARD_SCENE_ID');
    bot.launch();
  });
  await bot.command('results', async (ctx, next) => {
    resultsChannelMessage(ctx, bot);
  });
  await bot.command('depositar', async (ctx, next) => {
    ctx.reply('STILL WORKING!!!');
  });
  await bot.command('retirar', async (ctx, next) => {
    ctx.reply('STILL WORKING!!!');
  });
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
