const config = require('config');

async function welcomeMessage(ctx, user) {
  ctx.reply('¡Bienvenid@ ' + user.Username + '!\nHas vinculado tu cuenta exitosamente');
}

async function mainMenuMessage(ctx) {
  ctx.reply('Beermoney BOT tiene las siguientes opciones:\n\n/saldo - Checa tu saldo actual en Beermoney\n/depositar - Ingresa un deposito a Beermoney\n/retirar - Retira tus fondos de Beermoney\n/config - Gestiona tu wallet de retiro\n/moneda - Cambia la unidad de cuenta (BTC o sats)\n/results - Obten link para el canal de telegram privado\n/help - Guia de Beermoney BOT para dummies\n\nSupport: @franklinzerocr\n🍺😎');
}

async function fundsMessage(ctx, user, fundsDisplay, fundsFIAT, maxCapDisplay) {
  ctx.replyWithMarkdown(user.Username + '\n\nSaldo: *' + fundsDisplay + '* ($' + fundsFIAT + ')\nMax Cap: ' + maxCapDisplay);
}

async function dailyReportMessage(bot, user, fundsDisplay, fundsFIAT, ROI, BTCUSDT, earnings, unconfirmedOperations = 0) {
  ROI = ROI >= 0 ? '+' + ROI : '-' + ROI;
  bot.telegram.sendMessage(user.T_userid, 'Reporte diario 🍺😎\n\nHoy ganaste:\n' + earnings + ' (' + ROI + '%)\n\nBalance Actual:\n' + fundsDisplay[0] + ' ($' + fundsFIAT[0] + ')\n\nPrecio del Bitcoin: $' + BTCUSDT + ' 🤑');
  if (unconfirmedOperations) bot.telegram.sendMessage(user.T_userid, 'Ocurrió un error con tus operaciones de deposito/retiro del día 😓\nPorfavor contacta a @franklinzerocr ');
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
  ctx.replyWithMarkdown('✅ Los montos se mostraran en: *' + currency + '*');
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

async function helpMessage(ctx, user) {
  ctx.replyWithMarkdown('Hola ' + user.Username + '!\nMuy bien que estes usando mi *Beermoney BOT* 🤖\n\nBeermoney es un Bot de Trading Algoritmico con Bitcoin que opera en Binance 24/7\n\nEl Bot compra shitcoins en el mercado spot y las vende por un precio superior de satoshis haciendo scalping trading. Todo esto dictado por un algoritmo desarrollador por mi @franklinzerocr. Este algoritmo esta evolucionando y cambiando constantemente para garantizar mas y mejores ganancias 💪\n\nLo primero que debes hacer es configurar tu direccion de retiro. Para ello debes ir a /config y colocar la direccion de wallet BTC (Red BTC) de tu cuenta de Binance. *No acepta direcciones de wallet externas a binance*\n\nLuego debes depositarle tus BTC a Beermoney en la opcion de /depositar. Alli encontraras la direccion de deposito de BTC de Beermoney. Es una direccion dentro de Binance, asi que si transfieres desde tu cuenta binance, no pagaras la comision al ser una transferencia interna.\n\nUna vez transferido, copia el txid (numero de transaccion) de tu historial y pegalo cuando la opcion de /depositar te lo pida y listo: *Ya hiciste tu deposito a Beermoney para que empiece a operar con tu inversion*, pero no sera hasta la proxima actualizacion del sistema de Beermoney que se actualizara tu saldo ✅\n\n*Beermoney trabaja con una actualizacion diaria a las 00:00 GMT (8pm VE) en donde reparte las ganancias a sus miembros y acredita los depositos realizados durante el dia y ejecuta los retiros a realizar. A su vez, envía un reporte diario con tus ganancias respectivas y el progreso de cuenta.*\n\nPuedes retirar parte o la totalidad de tus fondos cuando quieras. Pero te sugiero que lo dejes la mayor cantidad de tiempo disponible para poder obtener mas beneficios. Recordando que al retirar, se hace la solicitud para que en la proxima actualizacion del sistema ejecute tu retiro ✅\n\nPara retirar solo debes darle a la opcion de /retirar, elegir como expresar el monto que deseas retirar ya sea en BTC/sats o en FIAT, donde este ultimo calcula el aproximado de BTC equivalente a la cantidad de dolares que ingresas. El retiro se ejecutara en la próxima actualizacion a la direccion de BTC que tienes registrada en tu configuracion.\n\nPor ultimo los usuarios tienen una capacidad maxima de fondos que pueden tener dentro de Beermoney. Esto significa que no pueden tener fondos que superen esta capacidad maxima dentro de su saldo. Cada 1, 8, 15 y 23 de cada mes el bot ejecuta un retiro automatico a la direccion del usuario con el excedente de la capacidad maxima 👍\n\nEsto es asi porque el Bot puede presentar fallas trabajando con volumenes de dinero muy grandes. Mientras mas mejoras se hagan al algoritmo de Beermoney, mas podria aumentar dicha capacidad.\n\nHabiendo dicho todo esto recuerda que puedes contactarme directamente por @franklinzerocr y suscribete al canal privado de resultados que consigues en /results 🍺😎');
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
  helpMessage,
};
