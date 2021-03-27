const config = require('config');

function welcomeMessage(ctx, user) {
  ctx.reply('¡Bienvenid@ ' + user.Username + '!\nHas vinculado tu cuenta exitosamente');
}

function mainMenuMessage(ctx) {
  ctx.reply('Beermoney BOT tienes las siguientes opciones:\n\n/balance - Checa tu balance actual en Beermoney\n/depositar - Ingresa un deposito a Beermoney\n/retirar - Retira tus fondos de Beermoney a tu wallet\n/moneda - Cambia la moneda de las unidades (BTC o sats)\n/results - Obten link para canal de resultados\n\n🍺😎');
}

function fundsMessage(ctx, user, fundsDisplay, fundsFIAT) {
  ctx.reply(user.Username + ' tienes un balance de:\n\n' + fundsDisplay + ' -> ($' + fundsFIAT + ')');
}

function dailyReportMessage(bot, user, fundsDisplay, fundsFIAT, ROI, BTCUSDT) {
  bot.telegram.sendMessage(user.T_userid, 'Reporte diario 🍺😎\n\nTu ganancia BTC de hoy: ' + ROI + '%\nBalance: ' + fundsDisplay[0] + ' ($' + fundsFIAT[0] + ')\n\nPrecio de Bitcoin: $' + BTCUSDT + ' 🤑');
}

function rebootInitialMessage(bot, user) {
  bot.telegram.sendMessage(user.T_userid, '🔔 Beermoney BOT acaba de ser actualizado.\n\n Porfavor reinicia el BOT ingresando /start');
}

function unauthorizedMessage(ctx) {
  ctx.reply('No estas Autorizado para usar Beermoney');
}

async function resultsChannelMessage(ctx, bot) {
  let inviteLink = await bot.telegram.exportChatInviteLink(config.channel);
  ctx.reply('Ingresa al canal privado de Beermoney aqui ' + inviteLink);
}

function currencyMenuMessage() {
  return 'Elige la unidad de moneda a mostrar';
}

function chosenCurrencyMessage(ctx, currency) {
  ctx.replyWithMarkdown('Los montos se mostraran en: *' + currency + '*');
}

module.exports = {
  mainMenuMessage,
  fundsMessage,
  welcomeMessage,
  dailyReportMessage,
  rebootInitialMessage,
  unauthorizedMessage,
  resultsChannelMessage,
  currencyMenuMessage,
  chosenCurrencyMessage,
};
