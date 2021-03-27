const { Telegraf } = require('telegraf');
const { beermoneyCommands, beermoneyListeners } = require('./actions');
const { checkAuth } = require('./auth');
const { beermoneyScenes } = require('./scenes');
const { mainMenuMessage, welcomeMessage, unauthorizedMessage, resultsChannelMessage } = require('./messages');
const util = require('../util');
const { dailyReport, alertReport, initialMessage } = require('./autopilot');
// should be on .env file
const bot = new Telegraf('1797826423:AAF0Lrx9xvlvykOMYGT9wat3u7uM5m8Y7og');

async function go(DBsystem, DBbeermoney, binanceAPI) {
  bot.start(async (ctx) => {
    let user = await checkAuth(DBsystem, ctx.update.message.from.username, ctx.update.message.from.id);
    if (user) {
      welcomeMessage(ctx, user);
      mainMenuMessage(ctx);
      resultsChannelMessage(ctx, bot);
      await beermoneyScenes(bot, DBsystem, binanceAPI);
      await beermoneyCommands(bot, DBsystem, binanceAPI);
      await beermoneyListeners(bot);
    } else {
      unauthorizedMessage(ctx);
      console.log('NOT ->' + ctx.update.message.from.username + ' - ' + ctx.update.message.from.id);
    }
  });

  bot.launch();

  bot.catch((error) => {
    console.log('------- telegraf error------\n', error);
  });

  await initialMessage(bot, DBsystem);
  await dailyReport(bot, DBsystem, binanceAPI);
  await alertReport(bot, DBbeermoney);

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
  // }
}

module.exports = {
  go,
};
