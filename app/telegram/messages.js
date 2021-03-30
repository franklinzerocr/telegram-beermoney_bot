const config = require('config');

async function welcomeMessage(ctx, user) {
  ctx.reply('¡Bienvenid@ ' + user.Username + '!\nHas vinculado tu cuenta exitosamente');
}

async function mainMenuMessage(ctx) {
  ctx.reply('Beermoney BOT tiene las siguientes opciones:\n\n/wallet - Checa tu saldo actual en Beermoney\n/depositar - Ingresa un deposito a Beermoney\n/retirar - Retira tus fondos de Beermoney\n/config - Gestiona tu wallet de retiro\n/moneda - Cambia la unidad de cuenta (BTC o sats)\n/results - Obten link para el canal de telegram privado\n\nSupport: @franklinzerocr\n🍺😎');
}

async function fundsMessage(ctx, user, fundsDisplay, fundsFIAT, maxCapDisplay) {
  ctx.replyWithMarkdown(user.Username + '\n\nSaldo: *' + fundsDisplay + '* ($' + fundsFIAT + ')\nMax Cap: ' + maxCapDisplay);
}

async function dailyReportMessage(bot, user, fundsDisplay, fundsFIAT, ROI, BTCUSDT, earnings) {
  ROI = ROI >= 0 ? '+' + ROI : '-' + ROI;
  bot.telegram.sendMessage(user.T_userid, 'Reporte diario 🍺😎\n\nHoy ganaste:\n' + earnings + ' (' + ROI + '%)\n\nBalance Actual:\n' + fundsDisplay[0] + ' ($' + fundsFIAT[0] + ')\n\nPrecio del Bitcoin: $' + BTCUSDT + ' 🤑');
}

async function rebootInitialMessage(bot, user) {
  bot.telegram.sendMessage(user.T_userid, '🔔 Beermoney BOT acaba de ser actualizado.\n\n Porfavor reinicia el BOT con /start');
}

async function unauthorizedMessage(ctx) {
  ctx.reply('No estas Autorizado para usar Beermoney');
}

async function resultsChannelMessage(ctx, bot) {
  let inviteLink = await bot.telegram.exportChatInviteLink(config.channel);
  ctx.reply('Ingresa al canal privado de Beermoney aqui ' + inviteLink);
}

async function currencyMenuMessage() {
  return 'Elige la unidad de moneda a mostrar';
}

async function chosenCurrencyMessage(ctx, currency) {
  ctx.replyWithMarkdown('Los montos se mostraran en: *' + currency + '*');
}

async function showDepositAddressInstructionalMessage(ctx, address) {
  await ctx.replyWithMarkdown('*- Ingresa el* _txid_ *del deposito que realizaste a esta direccion* 👇 o /backToMenu');
  await ctx.reply(address);
}

async function realTxidMessage(ctx) {
  ctx.reply('🚫 Porfavor ingresa un txId correcto o /backToMenu');
}

async function depositStoredMessage(ctx) {
  ctx.replyWithMarkdown('✅ Tu _Deposito_ ha sido registrado con exito. Espera al proximo corte diario para que se actualicen tus fondos');
}

async function currencyWithdrawMessage() {
  return 'Elige la moneda para expresar el monto a retirar:';
}

async function btcWithdrawalInstructionsMessage(ctx, fundsBtc, fundsFIAT, minBtc, minFIAT) {
  ctx.reply('Retiro maximo: ' + fundsBtc + ' BTC ($' + fundsFIAT + ')\nRetiro minimo: ' + minBtc + ' BTC ($' + minFIAT + ')');
  ctx.replyWithMarkdown('*- Ingresa el monto en* _BTC_ *a retirar o /backToMenu:*');
}

async function realAmountMessage(ctx) {
  ctx.reply('🚫 Porfavor ingresa un monto correcto dentro de los limites o /backToMenu');
}

async function withdrawalStoredMessage(ctx) {
  ctx.replyWithMarkdown('✅ Tu _Retiro_ ha sido registrado con exito. Espera al proximo corte diario para que se actualicen tus fondos');
}

async function satsWithdrawalInstructionsMessage(ctx, fundsSats, fundsFIAT, minSats, minFIAT) {
  ctx.reply('Retiro maximo: ' + fundsSats + ' sats ($' + fundsFIAT + ')\nRetiro minimo: ' + minSats + ' sats ($' + minFIAT + ')');
  ctx.replyWithMarkdown('*- Ingresa el monto en* _sats_ *a retirar o /backToMenu:*');
}

async function fiatWithdrawalInstructionsMessage(ctx, fundsFIAT, minFIAT) {
  ctx.reply('Retiro maximo: $' + fundsFIAT + '\nRetiro minimo: $' + minFIAT);
  ctx.replyWithMarkdown('*- Ingresa el monto en* _FIAT_ *a retirar o /backToMenu:*');
}

async function walletUpdateMessage(ctx) {
  ctx.reply('✅ Wallet Actualizada');
}

async function realWalletMessage(ctx) {
  ctx.reply('🚫 Porfavor ingresa una Wallet correcta o /backToMenu');
}

async function updateWalletAddressInstructionalMessage(ctx, wallet) {
  await ctx.replyWithMarkdown('Tu wallet actual es:\n' + wallet.Wallet + '\n\n*- Ingresa la nueva* _Wallet Address_ *a utilizar en Beermoney o /backToMenu* 👛');
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
  showDepositAddressInstructionalMessage,
  realTxidMessage,
  depositStoredMessage,
  currencyWithdrawMessage,
  btcWithdrawalInstructionsMessage,
  realAmountMessage,
  withdrawalStoredMessage,
  satsWithdrawalInstructionsMessage,
  fiatWithdrawalInstructionsMessage,
  walletUpdateMessage,
  updateWalletAddressInstructionalMessage,
  realWalletMessage,
};
