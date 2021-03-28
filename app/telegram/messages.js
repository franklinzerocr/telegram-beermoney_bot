const config = require('config');

function welcomeMessage(ctx, user) {
  ctx.reply('¡Bienvenid@ ' + user.Username + '!\nHas vinculado tu cuenta exitosamente');
}

function mainMenuMessage(ctx) {
  ctx.reply('Beermoney BOT tienes las siguientes opciones:\n\n/balance - Checa tu balance actual en Beermoney\n/depositar - Ingresa un deposito a Beermoney\n/retirar - Retira tus fondos de Beermoney a tu wallet activa\n/wallet - Gestiona tu wallet binance activa\n/moneda - Cambia la moneda de las unidades (BTC o sats)\n/results - Obten link para canal privado de resultados\n\nSupport: @franklinzerocr\n🍺😎');
}

function fundsMessage(ctx, user, fundsDisplay, fundsFIAT, maxCapDisplay) {
  ctx.replyWithMarkdown(user.Username + ' tienes un balance de:\n*' + fundsDisplay + '* -> ($' + fundsFIAT + ')\nCapacidad Máxima: ' + maxCapDisplay);
}

function dailyReportMessage(bot, user, fundsDisplay, fundsFIAT, ROI, BTCUSDT, earnings) {
  ROI = ROI >= 0 ? '+' + ROI : '-' + ROI;
  bot.telegram.sendMessage(user.T_userid, 'Reporte diario 🍺😎\n\nHoy ganaste: ' + earnings + ' (' + ROI + '%)\nBalance Actual: ' + fundsDisplay[0] + ' ($' + fundsFIAT[0] + ')\n\nPrecio del Bitcoin: $' + BTCUSDT + ' 🤑');
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

async function showDepositAddressMessage(ctx, address) {
  await ctx.replyWithMarkdown('*- Ingresa el* _TxId_ *del deposito que realizaste a esta direccion* 👇');
  await ctx.reply(address);
}

function realTxidMessage(ctx) {
  ctx.reply('🚫 Porfavor ingresa un txId correcto o "Exit"');
}

function depositStoredMessage(ctx) {
  ctx.replyWithMarkdown('✅ Tu _Deposito_ ha sido registrado con exito. Espera al proximo corte diario para que se actualicen tus fondos');
}

function currencyWithdrawMessage() {
  return 'Elige la moneda para expresar el monto a retirar:';
}

function btcWithdrawalInstructionsMessage(ctx, fundsBtc, fundsFIAT, minBtc, minFIAT) {
  ctx.reply('Retiro maximo: ' + fundsBtc + ' BTC ($' + fundsFIAT + ')\nRetiro minimo: ' + minBtc + ' BTC ($' + minFIAT + ')');
  ctx.replyWithMarkdown('*- Ingresa el monto en* _BTC_ *a retirar:*');
}

function realAmountMessage(ctx) {
  ctx.reply('🚫 Porfavor ingresa un monto correcto dentro de los limites o "Exit"');
}

function withdrawalStoredMessage(ctx) {
  ctx.replyWithMarkdown('✅ Tu _Retiro_ ha sido registrado con exito. Espera al proximo corte diario para que se actualicen tus fondos');
}

function satsWithdrawalInstructionsMessage(ctx, fundsSats, fundsFIAT, minSats, minFIAT) {
  ctx.reply('Retiro maximo: ' + fundsSats + ' sats ($' + fundsFIAT + ')\nRetiro minimo: ' + minSats + ' sats ($' + minFIAT + ')');
  ctx.replyWithMarkdown('*- Ingresa el monto en* _sats_ *a retirar:*');
}

function fiatWithdrawalInstructionsMessage(ctx, fundsFIAT, minFIAT) {
  ctx.reply('Retiro maximo: $' + fundsFIAT + '\nRetiro minimo: $' + minFIAT);
  ctx.replyWithMarkdown('*- Ingresa el monto en* _FIAT_ *a retirar:*');
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
  showDepositAddressMessage,
  realTxidMessage,
  depositStoredMessage,
  currencyWithdrawMessage,
  btcWithdrawalInstructionsMessage,
  realAmountMessage,
  withdrawalStoredMessage,
  satsWithdrawalInstructionsMessage,
  fiatWithdrawalInstructionsMessage,
};
