const { MenuTemplate, MenuMiddleware, createBackMainMenuButtons } = require('telegraf-inline-menu');

const newMenuInteraction = async () => {
  const menu = new MenuTemplate(() => 'Bienvenido\n' + new Date().toISOString());
  let mainMenuToggle = false;
  menu.toggle('toggle me', 'toggle me', {
    set: (_, newState) => {
      mainMenuToggle = newState;
      // Update the menu afterwards
      return true;
    },
    isSet: () => mainMenuToggle,
  });

  menu.interact('interaction', 'interact', {
    hide: () => mainMenuToggle,
    do: async (ctx) => {
      await ctx.answerCbQuery('you clicked me!');
      // Do not update the menu afterwards
      return false;
    },
  });

  menu.interact('update after action', 'update afterwards', {
    joinLastRow: true,
    hide: () => mainMenuToggle,
    do: async (ctx) => {
      await ctx.answerCbQuery('I will update the menu now…');

      return true;

      // You can return true to update the same menu or use a relative path
      // For example '.' for the same menu or '..' for the parent menu
      // return '.'
    },
  });

  const menuMiddleware = new MenuMiddleware('/', menu);
  bot.command('menu', async (ctx) => menuMiddleware.replyToContext(ctx));
  bot.use(menuMiddleware.middleware());

  bot.catch((error) => {
    console.log('telegraf error', error.response, error.parameters, error.on || error);
  });
};

const currencyInteraction = async () => {
  const menu = new MenuTemplate(() => 'Bienvenido\n' + new Date().toISOString());
  let mainMenuToggle = false;
  menu.toggle('toggle me', 'toggle me', {
    set: (_, newState) => {
      mainMenuToggle = newState;
      // Update the menu afterwards
      return true;
    },
    isSet: () => mainMenuToggle,
  });

  menu.interact('interaction', 'interact', {
    hide: () => mainMenuToggle,
    do: async (ctx) => {
      await ctx.answerCbQuery('you clicked me!');
      // Do not update the menu afterwards
      return false;
    },
  });

  menu.interact('update after action', 'update afterwards', {
    joinLastRow: true,
    hide: () => mainMenuToggle,
    do: async (ctx) => {
      await ctx.answerCbQuery('I will update the menu now…');

      return true;

      // You can return true to update the same menu or use a relative path
      // For example '.' for the same menu or '..' for the parent menu
      // return '.'
    },
  });

  const menuMiddleware = new MenuMiddleware('/', menu);
  console.log(menuMiddleware.tree());
  bot.command('menu', async (ctx) => menuMiddleware.replyToContext(ctx));
  bot.use(menuMiddleware.middleware());

  bot.catch((error) => {
    console.log('telegraf error', error.response, error.parameters, error.on || error);
  });
};

module.exports = {
  newMenuInteraction,
};
