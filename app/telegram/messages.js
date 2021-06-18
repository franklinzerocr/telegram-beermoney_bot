const config = require('config');

async function welcomeMessage(ctx, user) {
  ctx.reply('¡Bienvenid@ ' + user.Username + '!\nHas vinculado tu cuenta exitosamente');
}

async function mainMenuMessage(ctx) {
  ctx.reply('Beermoney BOT tiene las siguientes opciones:\n\n/saldo - Checa tu saldo actual en Beermoney\n/depositar - Ingresa un deposito a Beermoney\n/retirar - Retira tus fondos de Beermoney\n/config - Gestiona tu wallet de retiro\n/moneda - Cambia la unidad de cuenta (BTC o sats)\n/privatechannel - Obten link para el canal de telegram privado\n/help - Guia de Beermoney BOT para dummies\n\nSupport: @franklinzerocr\n🍺😎');
}

async function fundsIntroMessage(ctx, user) {
  ctx.replyWithMarkdown('Saldos Actuales de ' + user.Username + ':');
}

async function fundsMessage(ctx, fundsDisplay, fundsFIAT, maxCapDisplay, ticker, asset) {
  ctx.replyWithMarkdown(asset + ':\n\n*' + fundsDisplay + '* ($' + fundsFIAT + ')\nMax Cap: ' + maxCapDisplay + '\n\nPrecio del ' + asset + ': $' + ticker + ' 🤑');
}

async function dailyReportIntroMessage(bot, user) {
  await bot.telegram.sendMessage(user.T_userid, 'Reporte diario Beermoney Bot 🤑');
}

async function dailyReportMessage(bot, user, fundsDisplay, fundsFIAT, ROI, earnings, unconfirmedOperations = 0, operationsBalance = 0, operationsBalanceDisplay, actualAmount, asset) {
  let ROIAux = ROI;
  ROI = ROI >= 0 ? '+' + ROI : ROI;
  if (actualAmount) {
    if (ROIAux && ROIAux >= 0) await bot.telegram.sendMessage(user.T_userid, 'Ganaste ' + asset + ' 😎🍺\n' + earnings + ' (' + ROI + '%)\n\nBalance Actual:\n' + fundsDisplay[0] + ' ($' + fundsFIAT[0] + ')\n\n¡To the moon!🚀');
    else if (ROIAux && ROIAux < 0) await bot.telegram.sendMessage(user.T_userid, 'Perdiste ' + asset + ' 😢💸\n' + earnings + ' (' + ROI + '%)\n\nBalance Actual:\n' + fundsDisplay[0] + ' ($' + fundsFIAT[0] + ')\n\nNo te preocupes que ya estamos corrigiendo💪');
  }
  if (operationsBalance < 0) await bot.telegram.sendMessage(user.T_userid, 'Se retiraron ' + operationsBalanceDisplay + ' a tu wallet configurada');
  else if (operationsBalance > 0) await bot.telegram.sendMessage(user.T_userid, 'Se acreditaron ' + operationsBalanceDisplay + ' de tu deposito realizado');
  if (unconfirmedOperations) await bot.telegram.sendMessage(user.T_userid, 'Ocurrió un error con tus operaciones de deposito/retiro del día 😓\nPorfavor contacta a @franklinzerocr ');
}

async function rebootInitialMessage(bot, user) {
  await bot.telegram.sendMessage(user.T_userid, '🔔 ------------------------ 🔔\nHola a todos! Estoy bastante contento de anunciar que tras mucho esfuerzo en estos meses acabo de terminar upgradear a la Version 2.0 de Beermoney Bot 🥳🍺');
  await bot.telegram.sendMessage(user.T_userid, 'Antes de explicar de que va, hagamos un repaso a groso modo de los primeros resultados publicos hasta ahora de este proyecto:\n\n- ROI de 130% en 90 dias (sin hacer interes compuesto)\n- Equivale a ROI de 1.5% diario aprox y 45% mensual aprox\n- 348 TradingPlans realizados\n- De los cuales 212 TradingPlans lograron PROFIT de mas del 0.3% y varios superaron 3% de PROFIT.\n- Solo 70 TradingPlans resultaron en LOSS mayores a -0.3%, solo hubo 6 TradingPlans con LOSS mayores a -5%.\n- El restante, 66 TradingPlans, salieron break even o muy cerca de 0%.\n\n(Mucho de esto es verificable en el canal de resultados y cotejando con las graficas)\n\nLa verdad yo estoy muy complacido de los resultados que obtuvo mi proyecto hasta ahora, y mas cuando yo veo lo que hace a diario, veo los aciertos y sobre todo los errores, tanto los del trading algoritmico como del sistema mismo, y los corrijo lo mas pronto posible. Mi esperanza y objetivo es que en algun momento ya no haya errores y solo queden los factores estadisticos y variables de mercado involucrados 🧐');
  await bot.telegram.sendMessage(user.T_userid, 'Queriendo ser un poco mas transparentes:\n\n- Actualmente el Bot cobra una comision de 30% sobre las ganancias diarias de cada inversor\n- Los valores que se reflejan en el canal privado son el resultado de la operacion, mas no asi de tu progreso. Hay factores como gestion de riesgo, recompras, resistencias y tendencias que no estan visualizadas.\n- Con esto lo que quiero decir es que el unico valor 100% real es el del reporte diario. El canal de resultados es mas como una "muestra del comportamiento aproximado" del bot para nuestra visualizacion a tiempo real 😮');
  await bot.telegram.sendMessage(user.T_userid, 'Ahora, en esta V2.0 hay muchisimos nuevos upgrades, pero el feature mas representativo es el de ahora permitir manejar un "sistema multimoneda".\n\nEs decir ahora el bot manejara 4 saldos separados: BTC, USDT, BUSD, ETH\n\nCon esta modalidad ahora se podra manejar una capacidad muchisimo mayor puesto que se transara en 4 mercados diferentes al mismo tiempo. Basicamente hara la misma operacion pero en cualquiera de estos otros pares de moneda que este disponible. \n\nPor ejemplo: \n- NKN/BTC & NKN/USDT.\n- SOL/BTC & SOL/USDT & SOL/BUSD\n- ZIL/BTC & ZIL/USDT & ZIL/BUSD & ZIL/ETH\n\nObviamente desde aqui mismo se podra gestionar el saldo respectivo 🤑');
  await bot.telegram.sendMessage(user.T_userid, 'Este ha sido un proyecto que me ha comido mucho de mis ahorros, puesto que ademas del esfuerzo involucrado, ha conllevado varios gastos en servicios y herramientas, que acumulados han sido bastante gasto.\n\nEsto se suma a que este proyecto puede tener un periodo de caducidad. Es decir, dentro de 1 año puede que ya no sea vigente este mismo algoritmo sin evolucionar, porque las condiciones de mercado habran cambiado; y por esto hay que sacarle jugo lo mas rapido posible metiendole la mayor cantidad de capital posible.\n\nLo que me lleva a anunciar que a partir de este momento abriré unas "Rondas de Inversion" para poder financiar mas agresivamente este proyecto y hacerlo mejorar cada vez mas en el tiempo 🤑');
  await bot.telegram.sendMessage(user.T_userid, 'El nuevo modelo de inversiones seria asi:\n- Si no quieres depositarle mas nada al Bot tu capacidad de BTC se mantendra igual que siempre hasta los 0.0015 BTC\n- Pero con cada nuevo deposito que se realice aumentara tu capacidad en dicha moneda igual a los montos depositados + 50% de dicha suma. Esto significa que el bot hara interes compuesto hasta que logres tener 1.5 veces tu monto depositado y alli empezaran los retiros automaticos. Por ejemplo: depositas 1,000 USDT -> tu capacidad sera de 1,500 USDT; Si luego depositas otros 100 USDT -> tu capacidad seria 1550 USDT\n- Actualmente el mercado de mayor liquidez es el de USDT, seguido del de BTC, luego BUSD y por ultimo ETH. Sugiero que distribuyas tus fondos en ese orden.\n- Recuerda que el retiro automatico es una funcionalidad para que se haga un retiro interno a tu Wallet de Binance configurada una vez tu saldo llegue a = capacidad maxima + minimo retiro. Los minimos retiros de binance actualmente son: BTC = 0.00057 ; USDT = 10 ; BUSD = 10 ; ETH = 0.0036. Lo que quiere decir que si tu capacidad es de 0.0015 una vez tu saldo llegue a 0.00207 BTC se hara un retiro con el sobrante de = saldo - capacidad = 0.00057 BTC\n- Este periodo de "Rondas de Inversion" sera vigente solo hasta el 31 de Julio (proximo mes). A partir del 1 de agosto, ya no le incrementare mas la capacidad de los inversores.\n- No soy de negocios de referidos, pero por este periodo si son bienvenidos de invitar a otros usuarios a participar, contactandome directamente para evaluar la solicitud y poder agregarlos al sistema 🤗');
  await bot.telegram.sendMessage(user.T_userid, 'Este proyecto ha sido todo un reto en muchos niveles, pero la verdad es que he disfrutado mucho el proceso de hacerlo. Espero que se animen a invertir mas en el mismo, seguir formando parte de mi iniciativa, ver la evolucion de mi proyecto que cada vez estoy mejorando mas diariamente, y tambien en tenerme como su principal candidato como desarrollador de software en caso de que conozcan algun proyecto en el que puedan referirme a mi o mi equipo de desarrollo de software Roisdigital🦉. Pueden ver nuestra pagina web https://roisdigital.com\n\nSin mas nada que decir, recuerden que pueden encontrar las instruccion especificas en /help o pueden contactarme en cualquier momento @franklinzerocr');
  await bot.telegram.sendMessage(user.T_userid, 'Beermoney Bot V2.0 😎🍺 - Update\n\nPara iniciar el protocolo del bot marca /start');
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
  await ctx.replyWithMarkdown('Estas son las direcciones destino 🧐:');
  await ctx.replyWithMarkdown('\n*BTC*👇');
  await ctx.replyWithMarkdown('_Red BTC_:');
  await ctx.reply(config.Adresses.BTC_BTC);
  await ctx.replyWithMarkdown('_Red BEP20 / ERC20 _:');
  await ctx.reply(config.Adresses.BTC_ERC20);
  await ctx.replyWithMarkdown('\n*USDT* 👇');
  await ctx.replyWithMarkdown('_Red BEP20 / ERC20_:');
  await ctx.reply(config.Adresses.USDT_ERC20);
  await ctx.replyWithMarkdown('_Red TRC20_:');
  await ctx.reply(config.Adresses.USDT_TRC20);
  await ctx.replyWithMarkdown('*BUSD* 👇');
  await ctx.replyWithMarkdown('_Red BEP20 / ERC20_:');
  await ctx.reply(config.Adresses.BUSD_ERC20);
  await ctx.replyWithMarkdown('*ETH* 👇');
  await ctx.replyWithMarkdown('_Red BEP20 / ERC20_:');
  await ctx.reply(config.Adresses.ETH_ERC20);
  await ctx.replyWithMarkdown('*- Ingresa el *_txid_* de la transferencia a alguna de estas direcciones y espera el mensaje de confirmación o vuelva al menu principal marcando /backToMenu*');
}

async function realTxidMessage(ctx) {
  ctx.reply('🚫 Porfavor ingresa un txId correcto o vuelva al menu principal marcando /backToMenu');
}

async function depositStoredMessage(ctx) {
  ctx.replyWithMarkdown('✅ Tu _Deposito_ ha sido registrado con exito. Espera al proximo corte diario para que se actualicen tus fondos');
}

async function currencyWithdrawMessage() {
  return 'Elige el saldo del cual retirar 👇';
}

async function walletConfigurationMessage() {
  return 'Elige la wallet de retiro a configurar 👇';
}

async function btcWithdrawalInstructionsMessage(ctx, funds, fundsFIAT, minWithdrawal, minFIAT, asset) {
  ctx.reply('Saldo disponible: ' + funds + ' ' + asset + ' ($' + fundsFIAT + ')\nRetiro minimo: ' + minWithdrawal + ' ' + asset + ' ($' + minFIAT + ')');
  ctx.replyWithMarkdown('*- Ingresa el monto de* _' + asset + '_ *a retirar y espere el mensaje de confirmacion o vuelva al menu principal marcando /backToMenu:*');
}

async function realAmountMessage(ctx) {
  ctx.reply('🚫 Porfavor ingresa un monto correcto dentro de los limites o vuelva al menu principal marcando /backToMenu');
}

async function withdrawalStoredMessage(ctx) {
  ctx.replyWithMarkdown('✅ Tu _Retiro_ ha sido registrado con exito. Espera al proximo corte diario para que se actualicen tus fondos');
}
async function withdrawalErrorMessage(ctx) {
  ctx.replyWithMarkdown('🚫 Ocurrio un error procesando tu retiro. Verifica montos disponibles o contacta soporte @franklinzerocr');
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
  await ctx.replyWithMarkdown('Tu wallet *' + wallet.Asset + '* (RED ' + config.network[wallet.Asset] + ') de retiro acutal es:\n_' + wallet.Wallet + '_\n\n*- Ingresa la nueva* _Wallet Address_ * de ' + wallet.Asset + ' a utilizar en Beermoney o vuelve al menu principal marcando /backToMenu* 👛');
}

async function helpMessage(ctx, user) {
  ctx.replyWithMarkdown('Hola ' + user.Username + '!\nMuy bien que estes usando mi *Beermoney BOT* 🤖\n\nBeermoney es un Bot de Trading Algoritmico con Bitcoin que opera en Binance 24/7\n\nEl Bot compra shitcoins en el mercado spot y las vende por un precio superior de satoshis haciendo scalping trading. Todo esto dictado por un algoritmo desarrollador por mi @franklinzerocr. Este algoritmo esta evolucionando y desarrollandose constantemente para garantizar mas y mejores ganancias 💪\n\nLo primero que debes hacer es configurar tus direcciones de retiro. Para ello debes ir a /config, seleccionar la moneda a o configurar y colocar la direccion de walletde tu cuenta de Binance. *No acepta direcciones de wallet externas a binance por ahora*\n\nLuego debes depositar tu saldo en Beermoney en la opcion de /depositar. Alli encontraras la direcciones de deposito de cada una de las monedas de Beermoney. Todas son direcciones de Binance, asi que si transfieres desde tu cuenta binance, no pagaras la comision al ser una transferencia interna. Pero de igual forma si depositar desde una wallet externa a esa direccion\n\nUna vez hecha la transferencia, copia el txid (numero de transaccion) de tu historial y pegalo cuando la opcion de /depositar te lo pida y listo: *Ya hiciste tu deposito a Beermoney para que empiece a operar con tu inversion*, pero no sera hasta la proxima actualizacion del sistema de Beermoney que se actualizara tu saldo ✅\n\n*Beermoney trabaja con una actualizacion diaria a las 00:00 GMT (8:00pm VE) en donde reparte las ganancias a sus miembro, acredita todos los depositos realizados durante el dia a sus respectivas cuentas y ejecuta los retiros a realizar. A su vez, envía un reporte diario con tus ganancias respectivas y el progreso de tu cuenta.*\n\nPuedes retirar parte o la totalidad de tus fondos cuando quieras. Pero te sugiero que lo dejes la mayor cantidad de tiempo disponible para poder obtener mas beneficios y disfrutar del interes compuesto hasta que tu capacidad lo permita. Recordando que al retirar, se hace la solicitud para que en la proxima actualizacion del sistema ejecute tu retiro ✅\n\nPara retirar solo debes darle a la opcion de /retirar, elegir que moneda deseas retirar ya sea BTC, USDT, BUSD o ETH. El retiro se ejecutara en la próxima actualizacion a la direccion de tu wallet que tienes registrada en tu configuracion.\n\nPor ultimo los usuarios tienen una capacidad maxima de fondos que pueden tener dentro de Beermoney. Esto significa que no pueden tener fondos que superen esta capacidad maxima dentro de su saldo. Esta capacidad la puedes revisar en /saldo.\n\n*Todos los dias el bot ejecuta un retiro automatico a la direccion del usuario con el excedente de la capacidad maxima + el retiro minimo* 👍\n\n*Es decir si tu capacidad es de 0.0015 BTC, cuando llegues a 0.00207BTC (capacidad+retiro minimo) el bot retira tu excedente de 0.00057 BTC*\n\nEsto se realizar porque el Bot esta limitado a un volumen maximo porque trabaja en mercados de poca liquidez. Mientras le haga mas mejoras al algoritmo de Beermoney, mas podria aumentar dicha capacidad.\n\nHabiendo dicho todo esto recuerda que puedes contactarme directamente por @franklinzerocr y suscribete al canal privado de resultados que consigues en /privatechannel 🍺😎');
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
  dailyReportIntroMessage,
  fundsIntroMessage,
  withdrawalErrorMessage,
  walletConfigurationMessage,
};
