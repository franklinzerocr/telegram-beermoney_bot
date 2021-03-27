const { session, Scenes } = require('telegraf');

async function beermoneyScenes(bot, dbConnection, binanceAPI) {
  const currencyDisplayWizard = new Scenes.WizardScene(
    'CURRENCY_DISPLAY_ID', // first argument is Scene_ID, same as for BaseScene
    (ctx) => {
      ctx.reply('What is your name?');
      ctx.wizard.state.contactData = {};
      return ctx.wizard.next();
    },
    (ctx) => {
      // validation example
      if (ctx.message.text.length < 2) {
        ctx.reply('Please enter name for real');
        return;
      }
      ctx.wizard.state.contactData.name = ctx.message.text;
      ctx.reply('Enter your e-mail');
      return ctx.wizard.next();
    },
    async (ctx) => {
      ctx.wizard.state.contactData.email = ctx.message.text;
      ctx.reply(ctx.wizard.state.contactData.email + ' - ' + ctx.wizard.state.contactData.name);
      ctx.reply('Thank you for your replies, we will contact your soon');
      return ctx.scene.leave();
    }
  );

  const stage = new Scenes.Stage([currencyDisplayWizard]);
  bot.use(session()); // to  be precise, session is not a must have for Scenes to work, but it sure is lonely without one
  bot.use(stage.middleware());
}

module.exports = {
  beermoneyScenes,
};
