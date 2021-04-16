const config = require('config');
const util = require('../util');
const { updateTelegramFloorSignals } = require('../DB/floors');

async function getTicker(binanceAPI) {
  while (1 == 1) {
    try {
      ticker = await binanceAPI.prices();
      return ticker;
    } catch (e) {
      await util.sleep(1000);
    }
  }
}

async function postTopPrice(bot, dbConnection, binanceAPI, floor, initialFloor) {
  let init = +new Date(initialFloor.DateTime) - 60000;
  await binanceAPI.candlesticks(
    floor.Asset + 'BTC',
    '1m',
    async function (error, ticks, symbol) {
      if (error) console.log('error', error.body);
      let highestPrice = 0;
      for (let tick of ticks) {
        let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = tick;
        highestPrice = highestPrice < high ? high : highestPrice;
      }

      highestPrice = (highestPrice * 100000000).toFixed(0);

      let profit = ((highestPrice * 100) / initialFloor.Price - 100).toFixed(2);

      let message = floor.Asset + ' / #BTC\n';
      message += 'Top Price: ' + highestPrice + '\n';
      message += 'Profit so far: ' + profit + '% 😎🍺\n\n';
      message += '#AlgoTrade';

      status = await bot.telegram.sendMessage(config.beermoneySignals, message, { reply_to_message_id: initialFloor.SignalsID });
      updateTelegramFloorSignals(dbConnection, floor, status.message_id);
    },
    { startTime: init, endTime: +new Date() }
  );
}

module.exports = {
  getTicker,
  postTopPrice,
};
