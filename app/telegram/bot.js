const { Telegraf } = require('telegraf');
const { beermoneyCommands } = require('./actions');
const { checkAuth } = require('./auth');
const { beermoneyScenes } = require('./scenes');
const { mainMenuMessage, welcomeMessage, unauthorizedMessage } = require('./messages');
const { dailyReport, alertReport, initialMessage, beermoneySignals } = require('./autopilot');
const config = require('config');
// should be on .env file
const bot = new Telegraf(config.telegram.key);

async function go(DBsystem, DBbeermoney, binanceAPI) {
  bot.start(async (ctx) => {
    let user = await checkAuth(DBsystem, ctx.update.message.from.username, ctx.update.message.from.id, ctx);
    if (user) {
      await welcomeMessage(ctx, user);
      await mainMenuMessage(ctx);
      await beermoneyCommands(bot, DBsystem, binanceAPI);
    } else {
      await unauthorizedMessage(ctx);
      console.log('NOT ->' + ctx.update.message.from.username + ' - ' + ctx.update.message.from.id);
    }
  });

  await beermoneyScenes(bot, DBsystem, binanceAPI);

  bot.launch();

  bot.catch((error) => {
    console.log('------- telegraf error------\n', error);
  });

  // Autopilot BOT
  await initialMessage(bot, DBsystem);
  await dailyReport(bot, DBsystem, binanceAPI);
  await alertReport(bot, DBbeermoney);
  await beermoneySignals(bot, DBbeermoney, binanceAPI);

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

module.exports = {
  go,
};
