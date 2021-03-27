const { Telegraf } = require('telegraf');
const { beermoneyCommands, beermoneyListeners } = require('./actions');
const { checkAuth } = require('./auth');
const { beermoneyScenes } = require('./scenes');
const { mainMenuMessage, welcomeMessage } = require('./messages');

// should be on .env file
const bot = new Telegraf('1797826423:AAF0Lrx9xvlvykOMYGT9wat3u7uM5m8Y7og');

async function go(DBsystem, DBbeermoney, binanceAPI) {
  bot.start(async (ctx) => {
    let user = await checkAuth(DBsystem, ctx.update.message.from.username, ctx.update.message.from.id);
    if (user) {
      welcomeMessage(ctx, user);
      mainMenuMessage(ctx);
      await beermoneyScenes(bot, DBsystem, binanceAPI);
      await beermoneyCommands(bot, DBsystem, binanceAPI);
      await beermoneyListeners(bot);
    } else {
      await ctx.reply('No estas Autorizado para usar Beermoney');
      console.log('NOT ->' + ctx.update.message.from.username + ' - ' + ctx.update.message.from.id);
    }
  });

  bot.launch();

  bot.catch((error) => {
    console.log('------- telegraf error------\n', error);
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
  // }
}

module.exports = {
  go,
};
