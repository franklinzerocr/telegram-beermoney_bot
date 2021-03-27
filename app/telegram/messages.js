function welcomeMessage(ctx, user) {
  ctx.reply('¡Bienvenid@ ' + user.Username + '!\nHas vinculado tu cuenta exitosamente');
}

function mainMenuMessage(ctx) {
  ctx.reply('Beermoney BOT tienes las siguientes opciones:\n\n/balance - Checa tu balance actual en Beermoney\n/depositar - Ingresa un deposito a Beermoney\n/retirar - Retira tus fondos de Beermoney a tu wallet\n/moneda - Cambia la moneda a mostrar (BTC o sats)\n\n🍺😎');
}

function fundsMessage(ctx, user, fundsDisplay, fundsFIAT) {
  ctx.reply(user.Username + ' tienes un balance de:\n\n' + fundsDisplay + ' -> ($' + fundsFIAT + ')');
}

module.exports = {
  mainMenuMessage,
  fundsMessage,
  welcomeMessage,
};
