const config = require('config');

async function welcomeMessage(ctx, user) {
  ctx.reply('¡Bienvenid@ ' + user.Username + '!\nHas vinculado tu cuenta exitosamente');
}

async function mainMenuMessage(ctx) {
  ctx.reply('Beermoney BOT tiene las siguientes opciones:\n\n/saldo - Checa tu saldo actual en Beermoney\n/depositar - Ingresa un deposito a Beermoney\n/retirar - Retira tus fondos de Beermoney\n/config - Gestiona tu wallet de retiro\n/moneda - Cambia la unidad de cuenta (BTC o sats)\n/results - Obten link para el canal de telegram privado\n/help - Guia de Beermoney BOT para dummies\n\nSupport: @franklinzerocr\n🍺😎');
}

async function fundsMessage(ctx, user, fundsDisplay, fundsFIAT, maxCapDisplay, BTCUSDT) {
  ctx.replyWithMarkdown(user.Username + '\n\nSaldo: *' + fundsDisplay + '* ($' + fundsFIAT + ')\nMax Cap: ' + maxCapDisplay + '\n\nPrecio del Bitcoin: $' + BTCUSDT + ' 🤑');
}

async function dailyReportMessage(bot, user, fundsDisplay, fundsFIAT, ROI, BTCUSDT, earnings, unconfirmedOperations = 0, operationsBalance = 0, operationsBalanceDisplay, actualAmount) {
  ROI = ROI >= 0 ? '+' + ROI : ROI;
  if (actualAmount > 0)
    if (ROI >= 0) bot.telegram.sendMessage(user.T_userid, 'Reporte diario 🍺😎\n\nHoy ganaste:\n' + earnings + ' (' + ROI + '%)\n\nBalance Actual:\n' + fundsDisplay[0] + ' ($' + fundsFIAT[0] + ')\n\nPrecio del Bitcoin: $' + BTCUSDT + ' 🤑\n\n¡To the moon!🚀');
    else if (ROI < 0) bot.telegram.sendMessage(user.T_userid, 'Reporte diario 😢💸\n\nHoy perdiste:\n' + earnings + ' (' + ROI + '%)\n\nBalance Actual:\n' + fundsDisplay[0] + ' ($' + fundsFIAT[0] + ')\n\nPrecio del Bitcoin: $' + BTCUSDT + ' 🤑\n\nNo te preocupes que ya estamos corrigiendo💪');
  if (operationsBalance < 0) bot.telegram.sendMessage(user.T_userid, 'Hoy retiraste ' + operationsBalanceDisplay);
  else if (operationsBalance > 0) bot.telegram.sendMessage(user.T_userid, 'Hoy depositaste ' + operationsBalanceDisplay);
  if (unconfirmedOperations) bot.telegram.sendMessage(user.T_userid, 'Ocurrió un error con tus operaciones de deposito/retiro del día 😓\nPorfavor contacta a @franklinzerocr ');
}

async function rebootInitialMessage(bot, user) {
  let maxCap = user.Username == 'Raymondn' || user.Username == 'ftpaty' || user.Username == 'karlianamsuarez' || user.Username == 'hortydesign' || user.Username == 'ruiseart91' || user.Username == 'mikeportela' ? '500,000' : '150,000';
  bot.telegram.sendMessage(user.T_userid, '🔔 Hola ' + user.Username + '👋, te tengo noticias de suma importancia que debes leer con atencion:\n\nDesde el día de hoy, 20 de abril, hasta el 30 de abril tendras una capacidad maxima de 1,000,000 de sats dentro del fondo de Beermoney BOT. Luego a partir del 1 de mayo se establecera a ' + maxCap + ' sats.\n\nLa razón de esto es que hice unas proyecciones y la maxima capacidad del Bot esta acercandose, por ende debo limitar las cuentas a montos pequeños dentro de poco. Esto sucede porque en la version actual de Beermoney (v1.2) estamos operando en mercado spot de bajo volumen (shitcoins) y corremos el riesgo de quedarnos con capital sin vender mientras mas alto sea el volumen.\n\nHabiendo dicho esto, mi recomendación es que aproveches al maximo la capacidad por tiempo limitado y deposites lo que puedas dentro del bot para obtener mas ganancias. Aviso que despues del 1 de mayo no volveré a incrementar la capacidad de las cuentas hasta que en un futuro termine de desarrollar Beermoney v2.0 y la nueva estrategia que solucione el manejo de un mayor volumen.\n\nTe recuerdo que todo excedente a tu capacidad maxima se retirara a tu wallet configurada de forma automatica en cada corte diario.\n\n🧐 TLDR: Ahora puedes depositar hasta 1,000,000 de sats dentro del bot, pero solo hasta el 30 de abril. Luego solo podras tener ' + maxCap + ' sats dentro del bot. Cualquier duda contactame a @franklinzerocr\n\n Ahora porfavor reinicia tu Beermoney BOT marcando /start 🏁');
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

async function showDepositAddressInstructionalMessage(ctx) {
  await ctx.replyWithMarkdown('*Puedes depositar Bitcoin que a cualquiera de estas direcciones dentro de Binance* o /backToMenu');
  await ctx.reply('Red BTC 👇');
  await ctx.reply(config.BTC_BTC);
  await ctx.reply('Red BEP20 (BSC) 👇');
  await ctx.reply(config.BTC_BEP20);
  await ctx.replyWithMarkdown('*- Ingresa el *_txid_* de la transferencia*');
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

async function notUniqueTxidMessage(ctx) {
  ctx.reply('🚫 Ese txid ya se encuentra registrado. Porfavor ingresa el txid correcto o /backToMenu');
}

async function updateWalletAddressInstructionalMessage(ctx, wallet) {
  await ctx.replyWithMarkdown('Tu wallet actual es:\n' + wallet.Wallet + '\n\n*- Ingresa la nueva* _Wallet Address_ * de BTC a utilizar en Beermoney o /backToMenu* 👛');
}

async function helpMessage(ctx, user) {
  ctx.replyWithMarkdown('Hola ' + user.Username + '!\nMuy bien que estes usando mi *Beermoney BOT* 🤖\n\nBeermoney es un Bot de Trading Algoritmico con Bitcoin que opera en Binance 24/7\n\nEl Bot compra shitcoins en el mercado spot y las vende por un precio superior de satoshis haciendo scalping trading. Todo esto dictado por un algoritmo desarrollador por mi @franklinzerocr. Este algoritmo esta evolucionando y desarrollandose constantemente para garantizar mas y mejores ganancias 💪\n\nLo primero que debes hacer es configurar tu direccion de retiro. Para ello debes ir a /config y colocar la direccion de wallet BTC (Red BTC) de tu cuenta de Binance. *No acepta direcciones de wallet de BTC externas a binance*\n\nLuego debes depositarle tus BTC a tu saldo Beermoney en la opcion de /depositar. Alli encontraras la direccion de deposito de BTC de Beermoney. Es una direccion dentro de Binance, asi que si transfieres desde tu cuenta binance, no pagaras la comision al ser una transferencia interna. Pero puedes enviarlos desde cualquier wallet realmente\n\nUna vez transferido, copia el txid (numero de transaccion) de tu historial y pegalo cuando la opcion de /depositar te lo pida y listo: *Ya hiciste tu deposito a Beermoney para que empiece a operar con tu inversion*, pero no sera hasta la proxima actualizacion del sistema de Beermoney que se actualizara tu saldo ✅\n\n*Beermoney trabaja con una actualizacion diaria a las 00:05 GMT (8:05pm VE) en donde reparte las ganancias a sus miembro, acredita todos los depositos realizados durante el dia a sus respectivas cuentas y ejecuta los retiros a realizar. A su vez, envía un reporte diario con tus ganancias respectivas y el progreso de tu cuenta.*\n\nPuedes retirar parte o la totalidad de tus fondos cuando quieras. Pero te sugiero que lo dejes la mayor cantidad de tiempo disponible para poder obtener mas beneficios. Recordando que al retirar, se hace la solicitud para que en la proxima actualizacion del sistema ejecute tu retiro ✅\n\nPara retirar solo debes darle a la opcion de /retirar, elegir como expresar el monto que deseas retirar ya sea en BTC/sats o en FIAT, donde este ultimo calcula el aproximado de BTC equivalente a la cantidad de dolares que ingresas. El retiro se ejecutara en la próxima actualizacion a la direccion de BTC que tienes registrada en tu configuracion.\n\nPor ultimo los usuarios tienen una capacidad maxima de fondos que pueden tener dentro de Beermoney. Esto significa que no pueden tener fondos que superen esta capacidad maxima dentro de su saldo. Esta capacidad la puedes revisar en /saldo.\n\n*Todos los dias el bot ejecuta un retiro automatico a la direccion del usuario con el excedente de la capacidad maxima + el retiro minimot (50.000 sats)* 👍\n\n*Es decir si tu capacidad es de 100.000 sats, cuando llegues a 150.000 sats (capacidad+retiro minimo) el bot retira tu excedente de 50.000sats*\n\nEsto se realizar porque el Bot esta limitado a un volumen maximo porque trabaja en mercados de poca liquidez. Mientras le haga mas mejoras al algoritmo de Beermoney, mas podria aumentar dicha capacidad. _De igual forma puedes contactarme directamente para solicitar un aumento manual de tu capacidad si te interesa._\n\nHabiendo dicho todo esto recuerda que puedes contactarme directamente por @franklinzerocr y suscribete al canal privado de resultados que consigues en /results 🍺😎');
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
  notUniqueTxidMessage,
};
